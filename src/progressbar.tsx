import { useEvaState, calculateProgressColor } from "./common";
import { ItemValue, ItemValueThreshold } from "./value";
import { Eva } from "@eva-ics/webengine";
import { calculateFormula } from "bmat/numbers";

export interface ProgressBarParams {
  oid?: string;
  formula?: string;
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
  showMinMaxValues?: boolean;
  label?: string;
}

export const ProgressBar = ({
  oid,
  formula,
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
  showMinMaxValues,
  label
}: ProgressBarParams) => {
  const state = useEvaState({ oid, engine }, [oid, engine]);
  let value = state?.value;

  if (formula && typeof value === "number") {
    try {
      value = calculateFormula(formula, value);
    } catch {
      value = NaN;
    }
  }

  const color = calculateProgressColor(
    "eva-progressbar",
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
    <>
      <div className="eva-progressbar-container">
        <div className="eva-progressbar-labels-container">
          {showMinMaxValues && (
            <div className="eva-progressbar-max-value">
              <span>{minValue}</span>
            </div>
          )}
          <div className="eva-progressbar-progress-container">
            <div
              className={color}
              style={{
                width: `${percentage}%`,
                height: "100%"
              }}
            ></div>
          </div>
          {showMinMaxValues && (
            <div className="eva-progressbar-min-value">
              <span>{maxValue}</span>
            </div>
          )}
        </div>
        <div className="eva-progressbar-values">
          {showValue && (
            <div className="eva-progressbar-values-container">
              <p className="eva-progressbar-values-label">{label}</p>
              <ItemValue
                engine={engine}
                oid={oid}
                formula={formula}
                state={state}
                digits={digits}
                units={units}
                className={className}
                threshold={threshold}
                format_with={format_with}
                set_color_with={set_color_with}
                set_class_name_with={set_class_name_with}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
