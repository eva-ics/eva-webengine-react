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
import GaugeModern from "./GaugeModern";
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
  Light = "light",
  Modern = "modern"
}

enum GaugeProgressColor {
  Normal = "gauge-progress-color",
  Warning = "gauge-warning-progress-color",
  Critical = "gauge-critical-progress-color",
  Tick = "gauge-tick-color",
  Needle = "gauge-needle-color"
}

export interface GaugeParams {
  minValue: number;
  maxValue: number;
  oid?: string;
  formula?: string;
  state?: ItemState;
  type?: GaugeType;
  engine?: Eva;
  value?: number;
  digits?: number;
  units?: string;
  className?: string;
  threshold?: Array<ItemValueThreshold>;
  format_with?: (value: any) => any;
  set_color_with?: (value: any) => string | undefined;
  set_class_name_with?: (value: any) => string | undefined;
  diameter?: number;
  warnValue?: number;
  critValue?: number;
  lowWarnValue?: number;
  lowCritValue?: number;
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
  GaugeModern,
  GaugeType,
  GaugeProgressColor,
  StrokeLineCap
};
