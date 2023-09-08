import React, { useEffect, useState } from "react";
import { ClassNameColors, GaugeParams, StrokeLineCap } from "./index";
import { ItemValue } from "../value";
import { useGauge } from "./common";

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

const GaugeSphere = ({
  minValue,
  maxValue,
  oid,
  state,
  warnValue,
  critValue,
  engine,
  digits,
  units,
  threshold,
  format_with,
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
  const [progressColorOfValue, setProgressColorOfValue] = useState(
    ClassNameColors.Green
  );
  let value = state ? state.value : NaN;

  if (value > maxValue) {
    value = maxValue;
  }

  useEffect(() => {
    if (warnValue === undefined && critValue === undefined) {
      setProgressColorOfValue(ClassNameColors.Green);
    } else if (critValue === undefined) {
      setProgressColorOfValue(
        value < warnValue! ? ClassNameColors.Green : ClassNameColors.Yellow
      );
    } else if (warnValue === undefined) {
      setProgressColorOfValue(
        value < critValue ? ClassNameColors.Green : ClassNameColors.Red
      );
    } else {
      switch (true) {
        case value >= minValue && value < warnValue:
          setProgressColorOfValue(ClassNameColors.Green);
          break;
        case value > warnValue && value < critValue:
          setProgressColorOfValue(ClassNameColors.Yellow);
          break;
        case value >= critValue:
          setProgressColorOfValue(ClassNameColors.Red);
          break;
        default:
          return;
      }
    }
  }, [value, warnValue, critValue, minValue, maxValue, progressColorOfValue]);

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
              className={progressColorOfValue}
              strokeWidth={arcStrokeWidth}
              strokeLinecap={strokeLineCap}
            />
          )}
          <g id="ticks">
            {ticks.map((angle) => (
              <React.Fragment key={`tick-group-${angle}`}>
                <line
                  className={ClassNameColors.Tick}
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
            <circle className={ClassNameColors.Needle} {...base} />
            <circle className={ClassNameColors.Needle} {...tip} />
            <polyline className={ClassNameColors.Needle} points={points} />
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
                threshold={threshold}
                format_with={format_with}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GaugeSphere;
