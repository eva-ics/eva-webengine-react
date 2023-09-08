/*
 * Based on https://github.com/mattrothenberg/use-gauge
 *
 * The original project is available under MIT license
 */

import Gauge from "./Gauge";
import GaugeStandard from "./GaugeStandard";
import GaugeSphere from "./GaugeSphere";
import GaugeLight from "./GaugeLight";
import GaugeMinimal from "./GaugeMinimal";
import { Eva, ItemState } from "@eva-ics/webengine";
import { ItemValueThreshold } from "../value";

enum StrokeLineCap {
  Butt = "butt",
  Round = "round",
  Square = "square",
  Inherit = "inherit"
}

enum GaugeType {
  Standart = "standard",
  Sphere = "sphere",
  Minimal = "minimal",
  Light = "light"
}

enum ClassNameColors {
  Green = "gauge-progress-color",
  Yellow = "gauge-warning-progress-color",
  Red = "gauge-critical-progress-color",
  Tick = "gauge-tick-color",
  Needle = "gauge-needle-color"
}

export interface GaugeParams {
  minValue: number;
  maxValue: number;
  oid?: string;
  state?: ItemState;
  type?: GaugeType;
  engine?: Eva;
  value?: number;
  digits?: number;
  units?: string;
  threshold?: Array<ItemValueThreshold>;
  format_with?: (value: any) => any;
  diameter?: number;
  warnValue?: number;
  critValue?: number;
  startAngle?: number;
  endAngle?: number;
  numTicks?: number;
  offset?: number;
  arcStrokeWidth?: number;
  strokeLineCap?: StrokeLineCap | undefined;
  tickLength?: number;
  baseRadius?: number;
  tipRadius?: number;
  needleOffset?: number;
  middleRadius?: number;
  showValue?: boolean;
  label?: string;
}

export {
  Gauge,
  GaugeSphere,
  GaugeStandard,
  GaugeLight,
  GaugeMinimal,
  GaugeType,
  ClassNameColors,
  StrokeLineCap
};
