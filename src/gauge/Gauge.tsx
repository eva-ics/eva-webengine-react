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
  oid,
  minValue,
  maxValue,
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
  const state = useEvaState({ oid, engine });
  const { value } = state;

  switch (type) {
    case GaugeType.Sphere:
      return (
        <GaugeSphere
          oid={oid}
          value={value}
          minValue={minValue}
          maxValue={maxValue}
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
          oid={oid}
          value={value}
          minValue={minValue}
          maxValue={maxValue}
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
          oid={oid}
          value={value}
          minValue={minValue}
          maxValue={maxValue}
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
          oid={oid}
          value={value}
          minValue={minValue}
          maxValue={maxValue}
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
