import {
  Eva,
  EvaError,
  EvaErrorKind,
  EventKind,
  SvcMessage
} from "@eva-ics/webengine";
import { useState, useEffect, useRef } from "react";
import { cookies } from "@altertech/jsaltt";
import { QRious } from "react-qrious";
import { get_engine } from "./common";

type FunctionLogout = () => void;

enum AppStateKind {
  Loaded = 0,
  Ready = 1,
  LoggingIn = 2,
  OtpSetup = 10,
  OtpAuth = 11,
  Active = 100,
  LoginFailed = -1
}

enum CookieNames {
  Login = "auth_login",
  Password = "auth_password"
}

interface AppState {
  state: AppStateKind;
  svc_msg?: SvcMessage;
  err?: EvaError;
}

interface LoginProps {
  label_login?: string;
  label_password?: string;
  label_enter?: string;
  label_cancel?: string;
  label_otp_setup?: string;
  label_otp_setup_scan?: string;
  label_otp_required?: string;
  label_otp_code?: string;
  label_otp_invalid?: string;
  label_remember?: string;
  label_logging_in?: string;
  otp_issuer_name?: string;
  otp_qr_size?: number;
  cache_login?: boolean;
  cache_auth?: boolean;
}

const HMIApp = ({
  engine,
  Dashboard,
  login_props
}: {
  engine?: Eva;
  Dashboard: ({
    engine,
    logout
  }: {
    engine: Eva;
    logout: FunctionLogout;
  }) => JSX.Element;
  login_props?: LoginProps;
}) => {
  const [app_state, setAppState] = useState({
    state: AppStateKind.Loaded
  } as AppState);

  const eva_engine: Eva = engine || (get_engine() as Eva);

  if (!eva_engine) {
    throw new Error("EVA ICS WebEngine not set");
  }

  const [form, setForm] = useState({
    login: "",
    password: "",
    remember: true
  });

  const logout = async () => {
    try {
      try {
        cookies.erase(CookieNames.Password);
      } catch (e) {}
      await eva_engine.stop();
    } catch (e) {}
    setAppState({ state: AppStateKind.Ready });
  };

  useEffect(() => {
    eva_engine.on(EventKind.LoginSuccess, () => {
      eva_engine.login = "";
      eva_engine.login_xopts = null;
      if (login_props?.cache_auth) {
        if (form.remember) {
          if (eva_engine.password) {
            cookies.create(CookieNames.Password, eva_engine.password, 3650);
          }
        } else {
          try {
            cookies.erase(CookieNames.Password);
          } catch (e) {}
        }
      }
      eva_engine.password = "";
      setAppState({ state: AppStateKind.Active });
    });
    eva_engine.on(EventKind.LoginOTPSetup, (msg: SvcMessage) => {
      setAppState({ state: AppStateKind.OtpSetup, svc_msg: msg });
      eva_engine.login_xopts = null;
    });
    eva_engine.on(EventKind.LoginOTPRequired, () => {
      setAppState({ state: AppStateKind.OtpAuth });
      eva_engine.login_xopts = null;
    });
    eva_engine.on(EventKind.LoginOTPInvalid, () => {
      setAppState({
        state: AppStateKind.OtpAuth,
        err: { code: EvaErrorKind.ACCESS_DENIED }
      });
      eva_engine.login_xopts = null;
    });
    eva_engine.on(EventKind.LoginFailed, (err: EvaError) => {
      if (login_props?.cache_auth && eva_engine.password) {
        try {
          cookies.erase(CookieNames.Password);
        } catch (e) {}
      }
      setAppState({ state: AppStateKind.LoginFailed, err: err });
    });
  }, []);

  // try to auto login if there is a token in cookies or basic auth is used
  if (app_state.state == AppStateKind.Loaded) {
    setAppState({ state: AppStateKind.LoggingIn });
    eva_engine.start();
  }

  let error_msg = app_state.err ? app_state.err.message : "";
  // auto-login failed - ignore
  if (app_state?.err?.code == EvaErrorKind.ACCESS_DENIED) {
    if (
      error_msg === "No authentication data provided" ||
      error_msg === "invalid token"
    ) {
      error_msg = "";
      // try to repeat login with cached
      if (login_props?.cache_auth) {
        eva_engine.login = cookies.read(CookieNames.Login) || "";
        eva_engine.password = cookies.read(CookieNames.Password) || "";
        if (eva_engine.login && eva_engine.password) {
          //setAppState({ state: AppStateKind.LoggingIn });
          eva_engine.start();
        }
      }
    } else {
      try {
        cookies.erase(CookieNames.Password);
      } catch (e) {}
    }
  }

  switch (app_state.state) {
    case AppStateKind.LoggingIn:
      return (
        <>
          <div className="eva login progress">
            {login_props?.label_logging_in || "Logging in..."}
          </div>
        </>
      );
      break;
    case AppStateKind.Active:
      return (
        <>
          <Dashboard engine={eva_engine} logout={logout} />
        </>
      );
      break;
    case AppStateKind.OtpAuth:
    case AppStateKind.OtpSetup:
      return (
        <>
          <OtpForm
            engine={eva_engine}
            app_state={app_state}
            setAppState={setAppState}
            props={login_props}
            logout={logout}
          />
        </>
      );
      break;
    case AppStateKind.Loaded:
    default:
      return (
        <>
          <CredsForm
            engine={eva_engine}
            form={form}
            setForm={setForm}
            setAppState={setAppState}
            props={login_props}
            error_msg={error_msg}
          />
        </>
      );
  }
};

const OtpForm = ({
  engine,
  app_state,
  setAppState,
  props,
  logout
}: {
  engine: Eva;
  app_state: AppState;
  setAppState: any;
  props?: LoginProps;
  logout: FunctionLogout;
}) => {
  const otpRef = useRef(null);
  const [otp_form, setOtpForm] = useState({
    otp: ""
  });

  const onUpdateField = (e: any) => {
    const nextFormState = {
      ...otp_form,
      [e.target.name]: e.target.value
    };
    setOtpForm(nextFormState);
  };

  const onSubmit = (e: any) => {
    e.preventDefault();
    setAppState({ state: AppStateKind.LoggingIn });
    engine.login_xopts = { otp: otp_form.otp };
    const nextFormState = {
      ...otp_form,
      otp: ""
    };
    setOtpForm(nextFormState);
    engine.start();
  };

  const onAbort = (e: any) => {
    e.preventDefault();
    logout();
  };

  useEffect(() => {
    (otpRef.current as any).focus();
  }, []);
  let form_data;
  switch (app_state.state) {
    case AppStateKind.OtpSetup:
      let otp_setup = `otpauth://totp/${engine.login}?secret=${app_state?.svc_msg?.value}`;
      if (props?.otp_issuer_name) {
        otp_setup += `&issuer=${props.otp_issuer_name}`;
      }
      form_data = (
        <>
          <div className="eva login widerow">
            {props?.label_otp_setup || "OTP authentication setup"}
          </div>
          <div className="eva login widerow">
            {props?.label_otp_setup_scan ||
              "scan this code with an authenticator app then enter the response"}
          </div>
          <div className="eva login qr">
            <QRious size={props?.otp_qr_size || 150} value={otp_setup} />
          </div>
        </>
      );
      break;
    default:
      form_data = (
        <>
          <div className="eva login widerow">
            {props?.label_otp_required || "OTP required"} ({engine.login})
          </div>
        </>
      );
  }
  let content = (
    <>
      <form className="eva login" onSubmit={onSubmit}>
        {form_data}
        <div className="eva login error">
          {app_state.err?.code == EvaErrorKind.ACCESS_DENIED
            ? props?.label_otp_invalid || "Invalid OTP code"
            : ""}
        </div>
        <div className="eva login row text">
          <label htmlFor="eva_input_otp">
            {props?.label_otp_code || "Code"}
          </label>
          <input
            className="eva login"
            ref={otpRef}
            id="eva_input_otp"
            type="text"
            name="otp"
            onChange={onUpdateField}
          />
        </div>
        <button className="eva login">{props?.label_enter || "Enter"}</button>
        <button className="eva login" onClick={onAbort}>
          {props?.label_cancel || "Abort"}
        </button>
      </form>
    </>
  );
  return (
    <>
      <LoginForm content={content} />
    </>
  );
};

const CredsForm = ({
  engine,
  form,
  setForm,
  setAppState,
  error_msg,
  props
}: {
  engine: Eva;
  form: any;
  setForm: any;
  setAppState: any;
  error_msg?: string;
  props?: LoginProps;
}) => {
  const loginRef = useRef(null);

  useEffect(() => {
    (loginRef.current as any).focus();
    if (props?.cache_login || props?.cache_auth) {
      let login = cookies.read(CookieNames.Login) || "";
      if (login) {
        const nextFormState = {
          ...form,
          ["login"]: login
        };
        setForm(nextFormState);
      }
    }
  }, []);

  const onUpdateField = (e: any) => {
    const nextFormState = {
      ...form,
      [e.target.name]:
        e.target.name === "remember" ? e.target.checked : e.target.value
    };
    setForm(nextFormState);
  };

  const onSubmit = (e: any) => {
    e.preventDefault();
    setAppState({ state: AppStateKind.LoggingIn });
    engine.login = form.login;
    engine.password = form.password;
    if (props?.cache_login || props?.cache_auth) {
      cookies.create(CookieNames.Login, form.login, 3650);
    }
    const nextFormState = {
      ...form,
      password: ""
    };
    setForm(nextFormState);
    engine.start();
  };

  let remember;
  if (props?.cache_auth) {
    remember = (
      <>
        <div className="eva login row remember">
          <input
            className="eva login checkbox"
            type="checkbox"
            name="remember"
            id="eva_input_remember"
            checked={form.remember}
            onChange={onUpdateField}
          />
          <label htmlFor="eva_input_remember">
            {props.label_remember || "remember credentials"}
          </label>
        </div>
      </>
    );
  }
  let content = (
    <>
      <form className="eva login" onSubmit={onSubmit}>
        <div className="eva login error">{error_msg}</div>
        <div className="eva login row text">
          <label htmlFor="eva_input_login">
            {props?.label_login || "Login"}
          </label>
          <input
            className="eva login"
            id="eva_input_login"
            ref={loginRef}
            type="text"
            name="login"
            value={form.login}
            onChange={onUpdateField}
          />
        </div>
        <div className="eva login row text">
          <label htmlFor="eva_input_password">
            {props?.label_password || "Password"}
          </label>
          <input
            className="eva login"
            id="eva_input_password"
            type="password"
            name="password"
            value={form.password}
            onChange={onUpdateField}
          />
        </div>
        {remember}
        <button className="eva login">{props?.label_enter || "Enter"}</button>
      </form>
    </>
  );
  return (
    <>
      <LoginForm content={content} />
    </>
  );
};

const LoginForm = ({ content }: { content: JSX.Element }) => {
  return (
    <>
      <div className="eva login container">
        <div className="eva login logo"></div>
        <div className="eva login header"></div>
        <div className="eva login form-container">{content}</div>
      </div>
    </>
  );
};

export { HMIApp, FunctionLogout, LoginProps };
