import { calculateProgressColor, useEvaState } from "./common";
import { Eva } from "@eva-ics/webengine";
import { ItemValueThreshold, ItemValue } from "./value";

export interface ThermometerParams {
  oid?: string;
  minValue: number;
  maxValue: number;
  engine?: Eva;
  value?: number;
  digits?: number;
  units?: string;
  className?: string;
  threshold?: Array<ItemValueThreshold>;
  format_with?: (value: any) => any;
  warnValue?: number;
  critValue?: number;
  lowWarnValue?: number;
  lowCritValue?: number;
  set_color_with?: (value: any) => string | undefined;
  set_class_name_with?: (value: any) => string | undefined;
  showValue?: boolean;
  label?: string;
  showMinMax?: boolean;
}

export const Thermometer = ({
  oid,
  minValue,
  maxValue,
  engine,
  digits,
  units,
  className,
  threshold,
  format_with,
  warnValue,
  critValue,
  lowWarnValue,
  lowCritValue,
  set_color_with,
  set_class_name_with,
  showValue,
  label,
  showMinMax
}: ThermometerParams) => {
  const state = useEvaState({ oid, engine });
  const { value } = state;

  const color = calculateProgressColor(
    "eva-thermometer",
    value,
    warnValue,
    critValue,
    lowWarnValue,
    lowCritValue
  );

  let percentage = ((value - minValue) / (maxValue - minValue)) * 100;
  if (percentage < 0) {
    percentage = 0;
  } else if (percentage > 100) {
    percentage = 100;
  }

  return (
    <div className="eva-thermometer-container">
      {showMinMax && (
        <div className="eva-thermometer-min-value">
          <span>{maxValue}</span>
        </div>
      )}

      <div className="eva-thermometer-progress-container">
        <div
          className={color}
          style={{
            height: `${percentage}%`
          }}
        ></div>
        <div className="eva-thermometer-separator">
          <div>-</div>
          <div>-</div>
          <div>-</div>
          <div>-</div>
          <div>-</div>
        </div>
      </div>
      {showMinMax && (
        <div className="eva-thermometer-max-value">
          <span>{minValue}</span>
        </div>
      )}
      <div className="eva-thermometer-values-container">
        <p className="eva-thermometer-label">{label}</p>
        {showValue && (
          <ItemValue
            engine={engine}
            oid={oid}
            state={state}
            digits={digits}
            units={units}
            className={className}
            threshold={threshold}
            format_with={format_with}
            set_color_with={set_color_with}
            set_class_name_with={set_class_name_with}
          />
        )}
      </div>
    </div>
  );
};
