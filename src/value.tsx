import { Eva, ItemState } from "@eva-ics/webengine";
import { useEvaState, CanvasPosition } from "./common";
import { calculateFormula } from "bmat/numbers";

interface ItemValueDisplay {
  oid?: string;
  formula?: string;
  state?: ItemState;
  label?: string;
  units?: string;
  className?: string;
  format_with?: (value: any) => any;
  set_color_with?: (value: any) => string | any;
  set_class_name_with?: (value: any) => string | any;
  digits?: number;
  threshold?: Array<ItemValueThreshold>;
  position?: CanvasPosition;
  css_class?: string;
}

interface ItemValueThreshold {
  value: number;
  class: string;
}

const ItemValueTable = ({
  items,
  title,
  engine
}: {
  items: Array<ItemValueDisplay>;
  title?: string;
  engine?: Eva;
}) => {
  const header = title ? (
    <tr className="eva state valuetable header">
      <th className="eva state valuetable" colSpan={2}>
        {title}
      </th>
    </tr>
  ) : (
    ""
  );
  return (
    <table className="eva state valuetable">
      <tbody className="eva state valuetable">
        {header}
        {items.map((v) => {
          return (
            <tr key={v.oid} className="eva state valuetable">
              <td className="eva state valuetable label">
                {v.label || v.oid || ""}
              </td>
              <td className="eva state valuetable value">
                <ItemValue
                  oid={v.oid}
                  formula={v.formula}
                  state={v.state}
                  digits={v.digits}
                  units={v.units}
                  className={v.className}
                  threshold={v.threshold}
                  format_with={v.format_with}
                  set_color_with={v.set_color_with}
                  set_class_name_with={v.set_class_name_with}
                  engine={engine}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const ItemValue = ({
  oid,
  formula,
  state,
  digits,
  units,
  className,
  threshold,
  format_with,
  set_color_with,
  set_class_name_with,
  engine
}: {
  oid?: string;
  formula?: string;
  state?: ItemState;
  digits?: number;
  units?: string;
  className?: string;
  threshold?: Array<ItemValueThreshold>;
  format_with?: (value: any) => any;
  set_color_with?: (value: any) => string | undefined;
  set_class_name_with?: (value: any) => string | undefined;
  engine?: Eva;
}) => {
  const eva_state = useEvaState({ oid: oid, engine });
  const current_state = state ? state : eva_state;

  let value = current_state.value;

  if (formula && typeof value === "number") {
    try {
      value = calculateFormula(formula, value);
    } catch {
      value = NaN;
    }
  }

  if (digits !== undefined) {
    value = parseFloat(value).toFixed(digits);
  }

  let cls;
  if (set_class_name_with) {
    cls = set_class_name_with(value) || "";
  } else {
    cls = className || "";
  }
  switch (current_state.status) {
    case -1:
      cls += " error";
      break;
    default:
      cls += " ok";
      break;
  }
  if (current_state.connected == false) cls += " disconnected";
  if (threshold) {
    let v = parseFloat(current_state.value);
    for (const t of threshold) {
      if (v >= t.value) {
        cls += ` ${t.class}`;
        break;
      }
    }
  }
  let color;
  if (set_color_with) {
    color = set_color_with(value);
  }
  if (format_with) {
    value = format_with(value);
  }
  return (
    <span className={`eva state ${cls}`} style={{ color: color }}>
      {value}
      {units}
    </span>
  );
};

export { ItemValue, ItemValueDisplay, ItemValueThreshold, ItemValueTable };
