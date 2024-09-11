import { useEvaStateHistory, StateHistoryData } from "./common";
import { Line, Bar, Radar, Doughnut } from "react-chartjs-2";
import { Eva, StateProp } from "@eva-ics/webengine";
import { deepMerge } from "bmat/tools";
import { calculateFormula } from "bmat/numbers";
import { useMemo } from "react";

enum ChartKind {
  Line = "line",
  Bar = "bar",
  Radar = "radar",
  Doughnut = "doughnut"
}

const ChartDisplay = ({
  datasetIdKey,
  data,
  options,
  kind
}: {
  datasetIdKey: string;
  data: any;
  options: any;
  kind: ChartKind;
}) => {
  switch (kind) {
    case ChartKind.Line:
      return <Line datasetIdKey={datasetIdKey} data={data} options={options} />;
    case ChartKind.Bar:
      return <Bar datasetIdKey={datasetIdKey} data={data} options={options} />;
    case ChartKind.Radar:
      return (
        <Radar datasetIdKey={datasetIdKey} data={data} options={options} />
      );
    case ChartKind.Doughnut:
      return (
        <Doughnut datasetIdKey={datasetIdKey} data={data} options={options} />
      );
  }
};

const LineChart = ({
  oid,
  timeframe,
  formula,
  digits,
  update,
  prop,
  fill,
  args,
  colors,
  labels,
  title,
  options,
  className,
  width,
  height,
  data_callback,
  state,
  engine
}: {
  oid?: string | Array<string>;
  timeframe: string | Array<string>;
  formula?: string | Array<string>;
  digits?: number;
  update: number;
  prop?: StateProp;
  fill?: string;
  args?: any;
  colors?: Array<string>;
  labels?: Array<string>;
  title?: string;
  options?: any;
  className?: string;
  width?: number;
  height?: number;
  data_callback?: (data: any) => void;
  state?: StateHistoryData;
  engine?: Eva;
}) => {
  return Chart({
    oid,
    timeframe,
    formula,
    digits,
    update,
    prop,
    fill,
    args,
    colors,
    labels,
    title,
    options,
    className,
    width,
    height,
    data_callback,
    state,
    kind: ChartKind.Line,
    engine
  });
};

const Chart = ({
  oid,
  timeframe,
  formula,
  digits,
  update,
  prop,
  fill,
  args,
  colors,
  labels,
  title,
  options,
  className,
  width,
  height,
  data_callback,
  state,
  kind,
  engine
}: {
  oid?: string | Array<string>;
  timeframe: string | Array<string>;
  formula?: string | Array<string>;
  digits?: number;
  update: number;
  prop?: StateProp;
  fill?: string;
  args?: any;
  colors?: Array<string>;
  labels?: Array<string>;
  title?: string;
  options?: any;
  className?: string;
  width?: number;
  height?: number;
  data_callback?: (data: any) => void;
  state?: StateHistoryData;
  kind: ChartKind;
  engine?: Eva;
}) => {
  const hook_oids = useMemo(() => {
    return state ? [] : oid;
  }, [state, oid]);

  const loaded_state = useEvaStateHistory(
    {
      oid: hook_oids,
      timeframe: timeframe,
      update: update,
      prop: prop,
      fill: fill,
      digits: digits,
      args: args,
      engine: engine
    },
    [hook_oids, timeframe, update, prop, fill, digits, args, engine]
  );

  const current_state = state || loaded_state;

  const chart_style = { width: width, height: height };

  useMemo(() => {
    if (data_callback) {
      data_callback(current_state.data);
    }
  }, [data_callback, current_state.data]);

  if (current_state.data) {
    try {
      let x;
      if (prop) {
        x = prop === StateProp.Any ? StateProp.Value : prop;
      } else {
        x = StateProp.Value;
      }
      let data = {
        labels: current_state.data.t.map((t: number) => t * 1000),
        datasets: []
      };
      let xidx = 0;
      for (let d = 0; d < current_state.data.length; d++) {
        for (let i = 0; i < (Array.isArray(oid) ? oid.length : 1); i++) {
          let color;
          if (colors) {
            color = colors[xidx];
          }
          let frm: string | undefined;
          if (formula) {
            if (typeof formula === "string") {
              frm = formula;
            } else {
              frm = formula[xidx];
            }
          }
          let label;
          if (labels) {
            label = labels[xidx];
          }
          if (!label) {
            if (Array.isArray(oid)) {
              label = oid[i];
            } else {
              label = oid;
            }
          }
          let key;
          if (Array.isArray(oid)) {
            key = `${oid[i]}/${x}`;
          } else {
            key = x;
          }
          let dataframe = [];
          try {
            if (frm) {
              dataframe = current_state.data[d][key].map((n: number) => {
                try {
                  let val = calculateFormula(frm as string, n) as
                    | number
                    | undefined;
                  return digits === undefined || val === undefined
                    ? val
                    : parseFloat(val.toFixed(digits));
                } catch {
                  return NaN;
                }
              });
            } else {
              dataframe = current_state.data[d][key];
            }
          } catch (e) {}
          (data.datasets as any).push({
            data: dataframe,
            label: label,
            borderColor: color,
            backgroundColor: color,
            fill: false
          });
          xidx += 1;
        }
      }
      let ct_unit;
      let ct_format;
      let t_unit = Array.isArray(timeframe) ? timeframe[0] : timeframe;
      if (t_unit.includes(":")) {
        let [t_start_s, t_end_s] = t_unit.split(":");
        const t_start = parseFloat(t_start_s);
        const t_end = parseFloat(t_end_s);
        if (t_start && t_end) {
          const t_range = t_end - t_start;
          if (t_range < 3600 * 2) {
            t_unit = "T";
          } else if (t_range < 86400 * 2) {
            t_unit = "H";
          } else if (t_range < 86400 * 30) {
            t_unit = "D";
          } else if (t_range < 86400 * 365) {
            t_unit = "W";
          } else {
            t_unit = "M";
          }
        }
      } else {
        t_unit = t_unit.slice(-1);
      }
      switch (t_unit) {
        case "T":
        case "S":
          ct_unit = "second";
          ct_format = "mm:ss";
          break;
        case "W":
          ct_unit = "day";
          ct_format = "MM/dd HH::mm";
          break;
        case "M":
          ct_unit = "month";
          ct_format = "YYYY/MM/dd";
          break;
        case "D":
          ct_unit = "hour";
          ct_format = "MM/dd HH::mm:ss";
          break;
        default:
          ct_unit = "minute";
          ct_format = "HH:mm:ss";
      }
      const default_chart_ops = {
        responsive: true,
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left"
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",

            grid: {
              drawOnChartArea: false // only want the grid lines for one axis to show up
            }
          },
          x: {
            type: "time",
            time: {
              unit: ct_unit,
              unitStepSize: 1,
              round: ct_unit,
              tooltipFormat: ct_format
            },
            ticks: {
              fontSize: 12,
              fontColor: "#ccc",
              maxTicksLimit: 8,
              maxRotation: 0,
              autoSkip: true,
              callback: function (
                value: any,
                index: number,
                values: Array<any>
              ): any {
                if (index === values.length - 1) {
                  return "";
                } else {
                  return (this as any).getLabelForValue(value).split(" ");
                }
              }
            }
          }
        },
        plugins: {
          filler: {
            propagate: true
          },
          title: {
            text: title,
            display: true
          },
          legend: {
            display: xidx > 1,
            position: "top"
          }
        }
      };
      let chart_ops = deepMerge(default_chart_ops, options);
      return (
        <div style={chart_style} className={`eva chart container ${className}`}>
          <ChartDisplay
            kind={kind}
            datasetIdKey="id"
            data={data}
            options={chart_ops}
          />
        </div>
      );
    } catch (error) {
      const err = `Error: ${error})`;
      return (
        <div style={chart_style} className={`eva chart error ${className}`}>
          {err}
        </div>
      );
    }
  } else if (current_state.error) {
    const err = `Error: ${current_state.error.message} (${current_state.error.code})`;
    return (
      <div style={chart_style} className={`eva chart error ${className}`}>
        {err}
      </div>
    );
  } else {
    return (
      <div
        style={chart_style}
        className={`eva chart loading ${className}`}
      ></div>
    );
  }
};

export { LineChart, Chart, ChartKind };
