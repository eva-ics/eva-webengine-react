import { Eva, ItemState } from "@eva-ics/webengine";
import { useEvaState, CanvasPosition } from "./common";

interface ItemValueDisplay {
  oid?: string;
  state?: ItemState;
  label?: string;
  units?: string;
  format_with?: (value: any) => any;
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
                  state={v.state}
                  digits={v.digits}
                  units={v.units}
                  threshold={v.threshold}
                  format_with={v.format_with}
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
  state,
  digits,
  units,
  threshold,
  format_with,
  set_color_with,
  engine
}: {
  oid?: string;
  state?: ItemState;
  digits?: number;
  units?: string;
  threshold?: Array<ItemValueThreshold>;
  format_with?: (value: any) => any;
  set_color_with?: (value: any) => string;
  engine?: Eva;
}) => {
  const eva_state = useEvaState({ oid: oid, engine });
  state = state ? state : eva_state;

  let cls = "";
  switch (state.status) {
    case -1:
      cls += " error";
      break;
    default:
      cls += " ok";
      break;
  }
  if (state.connected == false) cls += " disconnected";
  let value;
  if (digits === undefined) {
    value = state.value;
  } else {
    value = parseFloat(state.value).toFixed(digits);
  }
  if (threshold) {
    let v = parseFloat(state.value);
    for (const t of threshold) {
      if (v >= t.value) {
        cls += ` ${t.class}`;
        break;
      }
    }
  }
  if (format_with) {
    value = format_with(value);
  }
  let color;
  if (set_color_with) {
    color = set_color_with(value);
  }
  return (
    <span className={`eva state${cls}`} style={{ color: color }}>
      {value}
      {units}
    </span>
  );
};

export { ItemValue, ItemValueDisplay, ItemValueThreshold, ItemValueTable };
