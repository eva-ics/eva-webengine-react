import {
  Eva,
  EvaError,
  EvaErrorKind,
  EventKind,
  SvcMessage
} from "@eva-ics/webengine";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Dispatch,
  SetStateAction
} from "react";
import { cookies } from "bmat/dom";
import QRCode from "react-qr-code";
import { get_engine } from "./common";
import toast from "react-hot-toast";

type FunctionLogout = () => void;

enum AppStateKind {
  LoginSession = "login_session",
  LoginAuto = "login_auto",
  Login = "login",
  OtpSetup = "otp_setup",
  OtpAuth = "otp_auth",
  LoginForm = "login_form",
  Active = "active"
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
  register_globals?: boolean;
}

interface FormData {
  login: string;
  password: string;
  remember: boolean;
}

const displayAlert = (text: string, level: string, timeout?: number) => {
  let fn;
  if (level === "warning" || level === "error") {
    fn = toast.error;
  } else {
    fn = toast.success;
  }
  let t = timeout;
  if (t === undefined) {
    t = 5;
  }
  fn(text, { duration: t * 1000 });
};

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
  const [app_state, setAppState] = useState<AppState>({
    state: AppStateKind.LoginSession
  });

  const eva_engine = engine || (get_engine() as Eva);
  if (!eva_engine) {
    throw new Error("EVA ICS WebEngine not set");
  }

  const [form, setForm] = useState<FormData>({
    login: "",
    password: "",
    remember: true
  });

  const logout = useCallback(async () => {
    try {
      try {
        cookies.erase(CookieNames.Password);
      } catch (e) {}
      await eva_engine.stop();
      eva_engine.clear_auth();
    } catch (e) {}
    setAppState({ state: AppStateKind.LoginForm });
  }, [eva_engine]);

  useEffect(() => {
    if (login_props?.register_globals) {
      eva_engine.register_globals();
      const w = window as any;
      if (w.$eva.hmi == undefined) {
        w.$eva.hmi = {};
      }
      const hmi = w.$eva.hmi;
      hmi.logout = logout;
      hmi.login = (login: string, password: string) => {
        setAppState({ state: AppStateKind.Login });
        eva_engine.stop().finally(() => {
          eva_engine.set_login_password(login, password);
          setForm({ login: "", password: "", remember: false });
          eva_engine.start();
        });
      };
      hmi.display_alert = displayAlert;
    }
  }, [login_props, logout, eva_engine]);

  useEffect(() => {
    eva_engine.on(EventKind.LoginSuccess, () => {
      setAppState({ state: AppStateKind.Active });
    });
  }, [form.remember, login_props, app_state, eva_engine]);

  useEffect(() => {
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
  }, [eva_engine]);

  useEffect(() => {
    eva_engine.on(EventKind.LoginFailed, (err: EvaError) => {
      // try to re-login in case of invalid token
      if (
        err.code == EvaErrorKind.ACCESS_DENIED &&
        (err.message == "invalid token" ||
          err.message == "No token/API key specified") &&
        eva_engine.is_auth_set()
      ) {
        eva_engine.erase_token_cookie();
        eva_engine.restart();
        return;
      }
      // handle server error
      if (
        err.code == EvaErrorKind.CORE_ERROR &&
        err.message == "Server error"
      ) {
        setAppState({ state: AppStateKind.Login });
        eva_engine.restart();
        return;
      }
      // delete password cookie if access denied
      if (
        err.code == EvaErrorKind.ACCESS_DENIED &&
        app_state.state == AppStateKind.LoginAuto
      ) {
        try {
          cookies.erase(CookieNames.Password);
        } catch (e) {}
      }
      setAppState({
        state:
          app_state.state == AppStateKind.LoginSession &&
          err.code == EvaErrorKind.ACCESS_DENIED
            ? AppStateKind.LoginAuto
            : AppStateKind.LoginForm,
        err: err
      });
    });

    switch (app_state.state) {
      // try to login with an existing session or basic auth
      case AppStateKind.LoginSession:
        // set login/password for further login attempts
        if (login_props?.cache_auth) {
          eva_engine.set_login_password(
            cookies.read(CookieNames.Login) || "",
            cookies.read(CookieNames.Password) || ""
          );
        }
        eva_engine.start();
        break;
      case AppStateKind.LoginAuto:
        // try to auto login if there is a token in cookies or basic auth is used
        if (login_props?.cache_auth) {
          eva_engine.set_login_password(
            cookies.read(CookieNames.Login) || "",
            cookies.read(CookieNames.Password) || ""
          );
        }
        if (eva_engine.is_auth_set()) {
          eva_engine.start();
        } else {
          setAppState({ state: AppStateKind.LoginForm });
        }
        break;
    }
  }, [app_state, login_props, eva_engine]);

  switch (app_state.state) {
    case AppStateKind.Active:
      return (
        <>
          <Dashboard engine={eva_engine} logout={logout} />
        </>
      );
      break;
    case AppStateKind.LoginSession:
    case AppStateKind.LoginAuto:
    case AppStateKind.Login:
      return (
        <>
          <div className="eva login progress">
            {login_props?.label_logging_in || "Logging in..."}
          </div>
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
    default:
      let error_msg = app_state.err?.message;
      // for strict mode in development
      if (error_msg == "No authentication data provided") {
        eva_engine.log.debug(
          "suppressing error message, strict mode & development on?"
        );
        error_msg = undefined;
      }
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
  setAppState: Dispatch<SetStateAction<AppState>>;
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
    setAppState({ state: AppStateKind.Login });
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
            <div style={{ background: "white", padding: "10px" }}>
              <QRCode
                size={(props?.otp_qr_size || 170) - 20}
                value={otp_setup}
              />
            </div>
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
  form: FormData;
  setForm: Dispatch<SetStateAction<FormData>>;
  setAppState: Dispatch<SetStateAction<AppState>>;
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
  }, [props, setForm]);

  const onUpdateField = useCallback(
    (e: any) => {
      const nextFormState = {
        ...form,
        [e.target.name]:
          e.target.name == "remember" ? e.target.checked : e.target.value
      };
      setForm(nextFormState);
    },
    [form]
  );

  const onSubmit = useCallback(
    (e: any) => {
      e.preventDefault();
      setAppState({ state: AppStateKind.Login });
      engine.set_login_password(form.login, form.password);
      if (props?.cache_login || props?.cache_auth) {
        cookies.create(CookieNames.Login, form.login, 365);
      } else {
        try {
          cookies.erase(CookieNames.Login);
        } catch (e) {}
      }
      if (props?.cache_auth) {
        cookies.create(CookieNames.Password, form.password, 365);
      } else {
        try {
          cookies.erase(CookieNames.Password);
        } catch (e) {}
      }
      const nextFormState = {
        ...form,
        password: ""
      };
      setForm(nextFormState);
      engine.start();
    },
    [engine, props, form]
  );

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
