import { GaugeProgressColor, GaugeParams, StrokeLineCap } from "./index";
import { ItemValue } from "../value";
import { calculateColor, useGauge } from "./common";
import React from "react";

const options = {
  diameter: 150, // GaugeStandard diameter value
  minValue: 0, // Minimum value indicator
  maxValue: 100, // Maximum value indicator
  startAngle: 90, // Initial indicator position
  endAngle: 270, // End indicator position
  numTicks: 11, // Step of indicator values
  offset: -50, // Distance of indicator line from the center
  arcStrokeWidth: 24, // Indicator line thickness
  strokeLineCap: StrokeLineCap, // Type of progress line
  tickLength: 10, // Length of ticks
  baseRadius: 2, // Radius of central point of arrow indicator
  middleRadius: 5, //Radius of middle circle of arrow indicator
  tipRadius: 1, // Radius of end point of arrow indicator
  needleOffset: 10 // Length of arrow indicator
};

const GaugeLight = ({
  minValue,
  maxValue,
  oid,
  state,
  warnValue,
  critValue,
  lowWarnValue,
  lowCritValue,
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
  strokeLineCap = StrokeLineCap.Butt,
  tickLength = options.tickLength,
  baseRadius = options.baseRadius,
  tipRadius = options.tipRadius,
  needleOffset = options.needleOffset,
  middleRadius = options.middleRadius
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
    getTickProps,
    getLabelProps,
    valueToAngle,
    angleToValue,
    getArcProps,
    getNeedleProps,
    getSVGProps
  } = useGauge({
    startAngle,
    endAngle,
    numTicks,
    diameter,
    domain: [minValue, maxValue]
  });

  const { tip, base, points } = getNeedleProps({
    value,
    baseRadius,
    tipRadius,
    offset: needleOffset
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
            {ticks.map((angle, i) => (
              <React.Fragment key={`tick-group-${i}`}>
                <line
                  className={GaugeProgressColor.Tick}
                  {...getTickProps({ angle, length: tickLength })}
                />
                <text
                  className="gauge-text-default-color"
                  {...getLabelProps({ angle, offset: 20 })}
                >
                  {angleToValue(angle)}
                </text>
              </React.Fragment>
            ))}
          </g>
          <g id="needle">
            <circle
              className="gauge-middle-base-color"
              {...base}
              r={middleRadius}
            />
            <circle className={GaugeProgressColor.Needle} {...base} />
            <circle className={GaugeProgressColor.Needle} {...tip} />
            <polyline className={GaugeProgressColor.Needle} points={points} />
            <circle className="gauge-midpoint-color" {...base} r={4} />
          </g>
        </svg>
        <div className="gauge-value">
          <p className="gauge-label">{label}</p>
          {showValue && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GaugeLight;
