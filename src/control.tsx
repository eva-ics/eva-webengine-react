import { Eva, ActionResult, EvaError, EvaErrorKind } from "@eva-ics/webengine";
import { CanvasPosition, get_engine, useEvaState } from "./common";
import { useId, useRef, useState, ChangeEvent, MouseEvent } from "react";

const handle_action_finished = (
  result: ActionResult,
  on_success?: (result: ActionResult) => void,
  on_fail?: (err: EvaError) => void
) => {
  if (result.exitcode === 0) {
    if (on_success) on_success(result);
  } else if (on_fail) {
    on_fail(new EvaError(EvaErrorKind.FUNC_FAILED, result.err || undefined));
  }
};

const handle_action_error = (
  err: EvaError,
  on_fail?: (err: EvaError) => void
) => {
  if (on_fail) {
    on_fail(err);
  }
};

enum ControlButtonKind {
  Toggle = "toggle",
  Value = "value",
  Run = "run"
}

interface ControlButtonDisplay {
  oid: string;
  params?: object;
  busy?: string;
  label?: string;
  kind?: ControlButtonKind;
  input_size?: number;
  position?: CanvasPosition;
  css_class?: string;
}

const ControlBlock = ({
  buttons,
  title,
  engine,
  on_success,
  on_fail
}: {
  buttons: Array<ControlButtonDisplay>;
  title?: string;
  engine?: Eva;
  on_success?: (result: ActionResult) => void;
  on_fail?: (err: EvaError) => void;
}) => {
  let header;
  if (title) {
    header = <div className="eva button block_title">{title}</div>;
  }
  return (
    <div className="eva button block">
      {header}
      <div className="eva button block_container">
        {buttons.map((v) => {
          let kind = v.kind;
          if (v.oid.startsWith("lmacro:")) {
            kind = ControlButtonKind.Run;
          }
          switch (kind) {
            case ControlButtonKind.Value:
              return (
                <ControlButtonValue
                  key={v.oid}
                  oid={v.oid}
                  label={v.label}
                  css_class={v.css_class}
                  input_size={v.input_size}
                  engine={engine}
                  on_success={on_success}
                  on_fail={on_fail}
                />
              );
            case ControlButtonKind.Run:
              return (
                <ControlButtonRun
                  key={v.oid}
                  oid={v.oid}
                  params={v.params}
                  busy={v.busy}
                  label={v.label}
                  css_class={v.css_class}
                  engine={engine}
                  on_success={on_success}
                  on_fail={on_fail}
                />
              );
            default:
              return (
                <ControlButtonToggle
                  key={v.oid}
                  oid={v.oid}
                  label={v.label}
                  css_class={v.css_class}
                  engine={engine}
                  on_success={on_success}
                  on_fail={on_fail}
                />
              );
          }
        })}
      </div>
    </div>
  );
};

const ControlButtonToggle = ({
  oid,
  label,
  css_class,
  engine,
  on_success,
  on_fail
}: {
  oid: string;
  label?: string;
  css_class?: string;
  engine?: Eva;
  on_success?: (result: ActionResult) => void;
  on_fail?: (err: EvaError) => void;
}) => {
  const state = useEvaState({ oid: oid, engine });

  const handle_action = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const eva_engine: Eva = engine || (get_engine() as Eva);
    eva_engine.action
      .toggle(oid, true)
      .then((result) => handle_action_finished(result, on_success, on_fail))
      .catch((err) => handle_action_error(err, on_fail));
  };

  return (
    <div className={`eva button container toggle ${css_class || ""}`}>
      <label className="eva button switch">
        <input
          type="checkbox"
          onChange={handle_action}
          checked={state && state.value > 0}
          disabled={state && state.act !== undefined && state.act > 0}
        />
        <span className={`eva button slider ${css_class || ""}`}></span>
        <div className={`eva button label slider ${css_class || ""}`}>
          {label || oid}
        </div>
      </label>
    </div>
  );
};

const ControlButtonValue = ({
  oid,
  label,
  css_class,
  input_size,
  engine,
  on_success,
  on_fail
}: {
  oid: string;
  label?: string;
  css_class?: string;
  input_size?: number;
  engine?: Eva;
  on_success?: (result: ActionResult) => void;
  on_fail?: (err: EvaError) => void;
}) => {
  const state = useEvaState({ oid: oid, engine });
  const [value, setValue] = useState(state.value);
  const id = useId();
  const valueRef = useRef(null);

  const handle_action = (e: MouseEvent) => {
    e.preventDefault();
    const eva_engine: Eva = engine || (get_engine() as Eva);
    if (value === undefined) return;
    let val: string | number = parseFloat(value);
    if (isNaN(val)) {
      val = value;
    }
    eva_engine.action
      .exec(oid, { v: val }, true)
      .then((result) => {
        setValue(undefined);
        handle_action_finished(result, on_success, on_fail);
      })
      .catch((err) => {
        setValue(undefined);
        handle_action_error(err, on_fail);
      });
  };

  if (value === undefined && valueRef.current) {
    (valueRef.current as any).value = state.value;
  }

  let input_cls = `eva button value ${css_class || ""}`;

  if (value !== undefined) {
    input_cls += " changed";
  }

  return (
    <div className={`eva button container value ${css_class || ""}`}>
      <input
        className={input_cls}
        size={input_size}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.keyCode === 27) setValue(undefined);
        }}
        type="text"
        ref={valueRef}
        id={id}
      />
      <label htmlFor={id}>
        <div className={`eva button label input ${css_class || ""}`}>
          {label || oid}
        </div>
      </label>
      <button
        disabled={
          value === undefined ||
          (state && state.act !== undefined && state.act > 0)
        }
        onClick={handle_action}
        className={`eva button input apply ${css_class || ""}`}
      ></button>
    </div>
  );
};

const ControlButtonRun = ({
  oid,
  params,
  label,
  busy,
  css_class,
  engine,
  on_success,
  on_fail
}: {
  oid: string;
  params?: object;
  label?: string;
  busy?: string;
  css_class?: string;
  engine?: Eva;
  on_success?: (result: ActionResult) => void;
  on_fail?: (err: EvaError) => void;
}) => {
  const state_busy = useEvaState({ oid: busy, engine });

  const handle_action = (e: MouseEvent) => {
    e.preventDefault();
    const eva_engine: Eva = engine || (get_engine() as Eva);
    eva_engine.action
      .run(oid, params, true)
      .then((result) => handle_action_finished(result, on_success, on_fail))
      .catch((err) => handle_action_error(err, on_fail));
  };

  const isDisabled = (): boolean | undefined => {
    if (busy) {
      if (busy.startsWith("sensor:")) {
        return state_busy.value == 1;
      } else if (busy.startsWith("lvar:")) {
        return state_busy.status == 1;
      } else {
        return state_busy.act !== undefined && state_busy.act > 0;
      }
    }
  };

  return (
    <div className={`eva button container run ${css_class || ""}`}>
      <button
        disabled={isDisabled()}
        onClick={handle_action}
        className={`eva button run ${css_class || ""}`}
      >
        {label || oid}
      </button>
    </div>
  );
};

export {
  ControlButtonKind,
  ControlButtonDisplay,
  ControlBlock,
  ControlButtonToggle,
  ControlButtonValue,
  ControlButtonRun
};
