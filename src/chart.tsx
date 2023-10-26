import { useEvaStateHistory } from "./common";
import { Line } from "react-chartjs-2";
import { Eva, StateProp } from "@eva-ics/webengine";
import { deepMerge } from "@altertech/jsaltt";

const LineChart = ({
  oid,
  timeframe,
  update,
  prop,
  fill,
  args,
  colors,
  labels,
  title,
  options,
  disable_update,
  engine
}: {
  oid: string | Array<string>;
  timeframe: string | Array<string>;
  update: number;
  prop?: StateProp;
  fill?: string;
  args?: any;
  colors?: Array<string>;
  labels?: Array<string>;
  title?: string;
  options?: any;
  disable_update?: boolean;
  engine?: Eva;
}) => {
  const state = useEvaStateHistory({
    oid: disable_update ? undefined : oid,
    timeframe: timeframe,
    update: update,
    prop: prop,
    fill: fill,
    args: args,
    engine: engine
  });

  if (state.data) {
    try {
      let x;
      if (prop) {
        x = prop === StateProp.Any ? StateProp.Value : prop;
      } else {
        x = StateProp.Value;
      }
      let data = {
        labels: state.data.t.map((t: number) => t * 1000),
        datasets: []
      };
      let xidx = 0;
      for (let d = 0; d < state.data.length; d++) {
        for (let i = 0; i < (Array.isArray(oid) ? oid.length : 1); i++) {
          let color;
          if (colors) {
            color = colors[xidx];
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
          (data.datasets as any).push({
            data: state.data[d][key],
            label: label,
            borderColor: color,
            backgroundColor: color,
            fill: false
          });
          xidx += 1;
        }
      }
      let t_unit;
      if (Array.isArray(timeframe)) {
        t_unit = timeframe[0].slice(-1);
      } else {
        t_unit = timeframe.slice(-1);
      }
      let ct_unit;
      let ct_format;
      switch (t_unit) {
        case "T":
        case "S":
          ct_unit = "second";
          ct_format = "mm:ss";
          break;
        case "W":
          ct_unit = "day";
          ct_format = "MM/dd HH::mm:ss";
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
        <div className="eva chart container">
          <Line datasetIdKey="id" data={data} options={chart_ops} />
        </div>
      );
    } catch (error) {
      const err = `Error: ${error})`;
      return <div className="eva chart error">{err}</div>;
    }
  } else if (state.error && !disable_update) {
    const err = `Error: ${state.error.message} (${state.error.code})`;
    return <div className="eva chart error">{err}</div>;
  } else {
    return <div className="eva chart loading"></div>;
  }
};

export { LineChart };
