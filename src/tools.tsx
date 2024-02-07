import { StateProp } from "@eva-ics/webengine";
import {
  generateDashTableRichCSV,
  ColumnRichInfo,
  DashTableColType
} from "bmat/dashtable";

export interface StateHistoryOIDColMapping {
  oid: string;
  name: string;
  tf_id?: number;
  prop?: StateProp;
}

export const generateStateHistoryCSV = ({
  data,
  mapping,
  timeColName,
  timeFormatter
}: {
  data: any;
  mapping: StateHistoryOIDColMapping[];
  timeColName?: string;
  timeFormatter?: (t: number) => string;
}): string | null => {
  if (!data) {
    return null;
  }
  const rData: object[] = [];
  const time_cols: ColumnRichInfo[] = timeFormatter
    ? [
        {
          id: "t",
          name: timeColName || "time",
          enabled: true
        }
      ]
    : [];
  const cols: ColumnRichInfo[] = time_cols.concat(
    mapping.map((m) => {
      return {
        id: m.name,
        name: m.name,
        enabled: true,
        columnType: DashTableColType.Integer
      };
    })
  );
  data.t.forEach((t: number, idx: number) => {
    const row = {};
    if (timeFormatter) {
      (row as any)[timeColName || "t"] = timeFormatter(t);
    } else {
      (row as any).t = t;
    }
    mapping.forEach((m) => {
      const id = `${m.oid}/${m.prop || StateProp.Value}`;
      let value = null;
      const tf_col = data[m.tf_id || 0];
      if (tf_col) {
        const data_col = data[m.tf_id || 0][id];
        if (data_col) {
          const val = data_col[idx];
          if (val !== undefined) {
            value = val;
          }
        }
      }
      (row as any)[m.name] = value;
    });
    rData.push(row);
  });
  return generateDashTableRichCSV({
    cols: cols,
    data: rData,
    timeCol: timeFormatter ? undefined : "t"
  });
};