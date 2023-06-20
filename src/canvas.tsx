import { ItemValueDisplay, ItemValue } from "./value";
import {
  ControlButtonDisplay,
  ControlButtonKind,
  ControlButtonToggle,
  ControlButtonValue,
  ControlButtonRun
} from "./control";
import { Eva, ActionResult, EvaError } from "@eva-ics/webengine";
import { CSSProperties } from "react";

const Canvas = ({
  image,
  css_class,
  items,
  buttons,
  engine,
  on_success,
  on_fail
}: {
  image?: string;
  css_class?: string;
  items?: Array<ItemValueDisplay>;
  buttons?: Array<ControlButtonDisplay>;
  engine?: Eva;
  on_success?: (result: ActionResult) => void;
  on_fail?: (err: EvaError) => void;
}) => {
  let style_area: CSSProperties | undefined;
  if (image) {
    style_area = {
      background: `url(${image})`,
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "contain"
    };
  }
  return (
    <div className={`eva canvas container ${css_class || ""}`}>
      <div style={style_area} className={`eva canvas area ${css_class || ""}`}>
        {items?.map((v) => {
          let pos: CSSProperties | undefined;
          if (v.position) {
            pos = {
              position: "absolute",
              left: v.position.x,
              top: v.position.y
            };
          }
          return (
            <div
              key={`item_${v.oid}`}
              style={pos}
              className={`eva canvas element ${css_class || ""} ${
                v.css_class || ""
              }`}
            >
              {v.label ? `${v.label}: ` : ""}
              <ItemValue
                oid={v.oid}
                digits={v.digits}
                units={v.units}
                threshold={v.threshold}
                format_with={v.format_with}
                engine={engine}
              />
            </div>
          );
        })}
        {buttons?.map((v) => {
          let kind = v.kind;
          if (v.oid.startsWith("lmacro:")) {
            kind = ControlButtonKind.Run;
          }
          let pos: CSSProperties | undefined;
          if (v.position) {
            pos = {
              position: "absolute",
              left: v.position.x,
              top: v.position.y
            };
          }
          switch (kind) {
            case ControlButtonKind.Value:
              return (
                <div
                  key={`button_${v.oid}`}
                  style={pos}
                  className={`eva canvas element ${css_class || ""} ${
                    v.css_class || ""
                  }`}
                >
                  <ControlButtonValue
                    key={v.oid}
                    oid={v.oid}
                    label={v.label}
                    input_size={v.input_size}
                    css_class={v.css_class}
                    engine={engine}
                    on_success={on_success}
                    on_fail={on_fail}
                  />
                </div>
              );
            case ControlButtonKind.Run:
              return (
                <div
                  key={`button_${v.oid}`}
                  style={pos}
                  className={`eva canvas element ${css_class || ""} ${
                    v.css_class || ""
                  }`}
                >
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
                </div>
              );
            default:
              return (
                <div
                  key={v.oid}
                  style={pos}
                  className={`eva canvas element ${css_class || ""} ${
                    v.css_class || ""
                  }`}
                >
                  <ControlButtonToggle
                    key={v.oid}
                    oid={v.oid}
                    label={v.label}
                    css_class={v.css_class}
                    engine={engine}
                    on_success={on_success}
                    on_fail={on_fail}
                  />
                </div>
              );
          }
        })}
      </div>
    </div>
  );
};

export { Canvas };
