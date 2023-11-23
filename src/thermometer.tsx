import { calculateProgressColor, useEvaState } from "./common";
import { Eva } from "@eva-ics/webengine";
import { ItemValueThreshold, ItemValue } from "./value";

export interface ThermometerParams {
  oid: string;
  minValue: number;
  maxValue: number;
  engine?: Eva;
  value?: number;
  digits?: number;
  units?: string;
  threshold?: Array<ItemValueThreshold>;
  format_with?: (value: any) => any;
  warnValue?: number;
  critValue?: number;
  lowWarnValue?: number;
  lowCritValue?: number;
  showValue?: boolean;
  label?: string;
  showMinMax?: boolean;
}

export { Thermometer };

const Thermometer = ({
  oid,
  minValue,
  maxValue,
  engine,
  digits,
  units,
  threshold,
  format_with,
  warnValue,
  critValue,
  lowWarnValue,
  lowCritValue,
  showValue,
  label,
  showMinMax
}: ThermometerParams) => {
  const state = useEvaState({ oid, engine });
  const { value } = state;
  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;

  const color = calculateProgressColor(
    "eva-thermometer",
    value,
    warnValue,
    critValue,
    lowWarnValue,
    lowCritValue
  );

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
            digits={digits}
            units={units}
            threshold={threshold}
            format_with={format_with}
          />
        )}
      </div>
    </div>
  );
};

export default Thermometer;
