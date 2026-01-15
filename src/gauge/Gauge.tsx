import { useEvaState } from "../common";
import {
  GaugeLight,
  GaugeMinimal,
  GaugeModern,
  GaugeParams,
  GaugeSphere,
  GaugeStandard,
  GaugeType
} from "./index";
import { calculateFormula } from "bmat/numbers";

const Gauge = ({
  oid,
  formula,
  state,
  type,
  engine,
  tickLength,
  baseRadius,
  tipRadius,
  needleOffset,
  middleRadius,
  ...rest
}: GaugeParams) => {
  const eva_state = useEvaState({ oid, engine }, [oid, engine]);

  if (formula && formula !== "x") {
    state = state ? { ...state } : { ...eva_state };
    try {
      if (typeof state?.value === "number")
        state.value = calculateFormula(formula, state.value);
    } catch {
      state.value = NaN;
    }
  } else {
    state = state ? state : eva_state;
  }

  switch (type) {
    case GaugeType.Sphere:
      return (
        <GaugeSphere
          oid={oid}
          formula={formula}
          state={state}
          engine={engine}
          tickLength={tickLength}
          baseRadius={baseRadius}
          tipRadius={tipRadius}
          needleOffset={needleOffset}
          middleRadius={middleRadius}
          {...rest}
        />
      );
    case GaugeType.Light:
      return (
        <GaugeLight
          oid={oid}
          formula={formula}
          state={state}
          engine={engine}
          tickLength={tickLength}
          baseRadius={baseRadius}
          tipRadius={tipRadius}
          needleOffset={needleOffset}
          middleRadius={middleRadius}
          {...rest}
        />
      );
    case GaugeType.Minimal:
      return (
        <GaugeMinimal
          oid={oid}
          formula={formula}
          state={state}
          engine={engine}
          tickLength={tickLength}
          baseRadius={baseRadius}
          tipRadius={tipRadius}
          needleOffset={needleOffset}
          middleRadius={middleRadius}
          {...rest}
        />
      );
    case GaugeType.Modern:
      return (
        <GaugeModern
          oid={oid}
          formula={formula}
          state={state}
          engine={engine}
          {...rest}
        />
      );
    default:
      return (
        <GaugeStandard
          oid={oid}
          formula={formula}
          state={state}
          engine={engine}
          tickLength={tickLength}
          baseRadius={baseRadius}
          tipRadius={tipRadius}
          needleOffset={needleOffset}
          middleRadius={middleRadius}
          {...rest}
        />
      );
  }
};

export default Gauge;
