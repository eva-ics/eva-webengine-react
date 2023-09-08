import { useEvaState } from "../common";
import {
  GaugeLight,
  GaugeMinimal,
  GaugeParams,
  GaugeSphere,
  GaugeStandard,
  GaugeType
} from "./index";

const Gauge = ({
  minValue,
  maxValue,
  oid,
  state,
  type,
  engine,
  digits,
  units,
  threshold,
  format_with,
  diameter,
  warnValue,
  critValue,
  startAngle,
  endAngle,
  numTicks,
  offset,
  arcStrokeWidth,
  strokeLineCap,
  tickLength,
  baseRadius,
  tipRadius,
  needleOffset,
  middleRadius,
  showValue,
  label
}: GaugeParams) => {
  state = state ? state : useEvaState({ oid, engine });

  switch (type) {
    case GaugeType.Sphere:
      return (
        <GaugeSphere
          minValue={minValue}
          maxValue={maxValue}
          oid={oid}
          state={state}
          engine={engine}
          digits={digits}
          units={units}
          threshold={threshold}
          format_with={format_with}
          diameter={diameter}
          warnValue={warnValue}
          critValue={critValue}
          startAngle={startAngle}
          endAngle={endAngle}
          numTicks={numTicks}
          offset={offset}
          arcStrokeWidth={arcStrokeWidth}
          strokeLineCap={strokeLineCap}
          tickLength={tickLength}
          baseRadius={baseRadius}
          tipRadius={tipRadius}
          needleOffset={needleOffset}
          middleRadius={middleRadius}
          showValue={showValue}
          label={label}
        />
      );
    case GaugeType.Light:
      return (
        <GaugeLight
          minValue={minValue}
          maxValue={maxValue}
          oid={oid}
          state={state}
          engine={engine}
          digits={digits}
          units={units}
          threshold={threshold}
          format_with={format_with}
          diameter={diameter}
          warnValue={warnValue}
          critValue={critValue}
          startAngle={startAngle}
          endAngle={endAngle}
          numTicks={numTicks}
          offset={offset}
          arcStrokeWidth={arcStrokeWidth}
          strokeLineCap={strokeLineCap}
          tickLength={tickLength}
          baseRadius={baseRadius}
          tipRadius={tipRadius}
          needleOffset={needleOffset}
          middleRadius={middleRadius}
          showValue={showValue}
          label={label}
        />
      );
    case GaugeType.Minimal:
      return (
        <GaugeMinimal
          minValue={minValue}
          maxValue={maxValue}
          oid={oid}
          state={state}
          engine={engine}
          digits={digits}
          units={units}
          threshold={threshold}
          format_with={format_with}
          diameter={diameter}
          warnValue={warnValue}
          critValue={critValue}
          startAngle={startAngle}
          endAngle={endAngle}
          numTicks={numTicks}
          offset={offset}
          arcStrokeWidth={arcStrokeWidth}
          strokeLineCap={strokeLineCap}
          tickLength={tickLength}
          baseRadius={baseRadius}
          tipRadius={tipRadius}
          needleOffset={needleOffset}
          middleRadius={middleRadius}
          showValue={showValue}
          label={label}
        />
      );
    default:
      return (
        <GaugeStandard
          minValue={minValue}
          maxValue={maxValue}
          oid={oid}
          state={state}
          engine={engine}
          digits={digits}
          units={units}
          threshold={threshold}
          format_with={format_with}
          diameter={diameter}
          warnValue={warnValue}
          critValue={critValue}
          startAngle={startAngle}
          endAngle={endAngle}
          numTicks={numTicks}
          offset={offset}
          arcStrokeWidth={arcStrokeWidth}
          strokeLineCap={strokeLineCap}
          tickLength={tickLength}
          baseRadius={baseRadius}
          tipRadius={tipRadius}
          needleOffset={needleOffset}
          middleRadius={middleRadius}
          showValue={showValue}
          label={label}
        />
      );
  }
};

export default Gauge;
