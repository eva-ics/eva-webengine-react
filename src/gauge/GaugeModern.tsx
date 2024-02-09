import React from "react";
import { GaugeParams, StrokeLineCap } from "./index";
import { ItemValue } from "../value";
import { useGauge, calculateColor } from "./common";

const options = {
  diameter: 200, // GaugeStandard diameter value
  minValue: 0, // Minimum value indicator
  maxValue: 100, // Maximum value indicator
  startAngle: 45, // Initial indicator position
  endAngle: 315, // End indicator position
  numTicks: 5, // Step of indicator values
  offset: -50, // Distance of indicator line from the center
  arcStrokeWidth: 24, // Indicator line thickness
  strokeLineCap: StrokeLineCap, // Type of progress line
  tickLength: 10, // Length of ticks
  baseRadius: 6, // Radius of central point of arrow indicator
  middleRadius: 14, //Radius of middle circle of arrow indicator
  tipRadius: 2, // Radius of end point of arrow indicator
  needleOffset: 10 // Length of arrow indicator
};

const GaugeModern = ({
  minValue,
  maxValue,
  oid,
  state,
  warnValue,
  critValue,
  lowCritValue,
  lowWarnValue,
  engine,
  digits,
  units,
  className,
  threshold,
  format_with,
  set_color_with,
  set_class_name_with,
  showValue,
  label,
  diameter = options.diameter,
  startAngle = options.startAngle,
  endAngle = options.endAngle,
  numTicks = options.numTicks,
  offset = options.offset,
  arcStrokeWidth = options.arcStrokeWidth,
  strokeLineCap = StrokeLineCap.Round
}: GaugeParams) => {
  let value = state ? state.value : NaN;
  const color = calculateColor(
    value,
    warnValue,
    critValue,
    lowWarnValue,
    lowCritValue
  );

  if (value > maxValue) {
    value = maxValue;
  } else if (value < minValue) {
    value = minValue;
  }

  const {
    ticks,
    getLabelProps,
    valueToAngle,
    angleToValue,
    getArcProps,
    getSVGProps
  } = useGauge({
    startAngle,
    endAngle,
    numTicks,
    diameter,
    domain: [minValue, maxValue]
  });

  return (
    <div className="gauge-container">
      <div className="gauge-wrapper">
        <svg {...getSVGProps()} className="gauge-preview">
          <path
            {...getArcProps({
              offset,
              startAngle,
              endAngle
            })}
            fill="none"
            className="gauge-progress-background-color"
            strokeWidth={arcStrokeWidth}
            strokeLinecap={strokeLineCap}
          />
          {value > minValue && (
            <path
              {...getArcProps({
                offset,
                startAngle,
                endAngle: valueToAngle(value)
              })}
              fill="none"
              className={color}
              strokeWidth={arcStrokeWidth}
              strokeLinecap={strokeLineCap}
            />
          )}
          <g id="ticks">
            {ticks.map((angle: any) => (
              <React.Fragment key={`tick-group-${angle}`}>
                <text
                  className="gauge-text-default-color"
                  {...getLabelProps({ angle, offset: 20 })}
                >
                  {angleToValue(angle)}
                </text>
              </React.Fragment>
            ))}
          </g>
        </svg>
        <div className="gauge-value">
          <p className="gauge-label-circle">{label}</p>
          {showValue && (
            <div className="gauge-value-result">
              <ItemValue
                engine={engine}
                oid={oid}
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
    </div>
  );
};

export default GaugeModern;
