import { Eva, StateProp } from "@eva-ics/webengine";
import { useState, useEffect, useRef, useCallback } from "react";

let eva: Eva | null = null;

function get_engine(): Eva | null {
  return eva;
}

function set_engine(engine: Eva) {
  eva = engine;
}

function useEvaState(oid: string) {
  const [state, setState] = useState({});

  useEffect(() => {
    eva!.watch(oid, setState);
    return () => {
      eva!.unwatch(oid, setState);
    };
  }, [oid]);
  return state;
}

function useEvaStateHistory(
  oid: string,
  timeframe: string | Array<string>,
  update: number,
  prop?: StateProp,
  fill?: string,
  args?: any
) {
  const [state, setState] = useState({ data: null, error: null });
  const visible = useRef(false);
  const update_worker: any = useRef(null);

  let update_interval = update * 1000;
  if (isNaN(update_interval)) {
    update_interval = 1000;
  } else if (update_interval < 100) {
    update_interval = 100;
  }

  const updateHistory = useCallback(() => {
    if (!visible.current) {
      update_worker.current = null;
      return;
    }
    if (eva && eva.logged_in) {
      let tframes;
      if (timeframe) {
        tframes = timeframe;
      } else {
        tframes = "1H";
      }
      if (!Array.isArray(tframes)) {
        tframes = [tframes];
      }
      let primary_tf_idx = 0;
      let calls = tframes.map((tf, idx) => {
        let t = tf.split(":");
        let t_start = t[0];
        if (t_start.startsWith("t")) {
          t_start = t_start.substr(1);
          primary_tf_idx = idx;
        }
        let t_end = t[1] || null;
        let api_opts = args;
        let x: StateProp | null =
          prop === undefined
            ? StateProp.Value
            : prop == StateProp.Any
            ? null
            : prop;
        let api_call_opts = {
          ...{
            s: t_start,
            e: t_end,
            x: x,
            w: fill
          },
          ...api_opts
        };
        return eva!.call("item.state_history", oid, api_call_opts);
      });
      Promise.all(calls)
        .then((result) => {
          (result as any).t = result[primary_tf_idx].t;
          setState({ data: result as any, error: null });
        })
        .catch((err) => {
          setState({ data: null, error: err });
        });
    } else {
      setState({ data: null, error: null });
    }
    update_worker.current = setTimeout(updateHistory, update_interval);
  }, [oid, timeframe, prop, fill, args, update_interval]);

  useEffect(() => {
    visible.current = true;
    if (!update_worker.current) {
      updateHistory();
    }
    return () => {
      visible.current = false;
      clearTimeout(update_worker.current);
      update_worker.current = null;
    };
  }, [oid, updateHistory]);
  return state;
}

export { get_engine, set_engine, useEvaState, useEvaStateHistory };
