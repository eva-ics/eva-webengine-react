import { Eva, StateProp, ItemState } from "@eva-ics/webengine";
import { useState, useEffect, useRef, useCallback } from "react";

let eva: Eva | null = null;

function get_engine(): Eva | null {
  return eva;
}

function set_engine(engine: Eva) {
  eva = engine;
}

interface EvaStateParams {
  oid: string;
  engine?: Eva;
}

interface EvaStateHistoryParams {
  oid: string;
  timeframe: string | Array<string>;
  update: number;
  prop?: StateProp;
  fill?: string;
  args?: any;
  engine?: Eva;
}

function useEvaState(params: EvaStateParams) {
  const [state, setState] = useState({} as ItemState);

  const eva_engine: Eva = params.engine || (eva as Eva);
  useEffect(() => {
    eva_engine!.watch(params.oid, setState);
    return () => {
      eva_engine!.unwatch(params.oid, setState);
    };
  }, [params.oid]);
  return state;
}

function useEvaStateHistory(params: EvaStateHistoryParams) {
  const [state, setState] = useState({ data: null, error: null });
  const visible = useRef(false);
  const update_worker: any = useRef(null);

  const eva_engine: Eva = params.engine || (eva as Eva);
  let update_interval = params.update * 1000;
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
    if (eva_engine && eva_engine.logged_in) {
      let tframes = params.timeframe || "1H";
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
        let api_opts = params.args;
        let x: StateProp | null =
          params.prop === undefined
            ? StateProp.Value
            : params.prop == StateProp.Any
            ? null
            : params.prop;
        let api_call_opts = {
          ...{
            s: t_start,
            e: t_end,
            x: x,
            w: params.fill
          },
          ...api_opts
        };
        return eva_engine!.call(
          "item.state_history",
          params.oid,
          api_call_opts
        );
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
  }, [
    params.oid,
    params.timeframe,
    params.prop,
    params.fill,
    params.args,
    update_interval
  ]);

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
  }, [params.oid, updateHistory]);
  return state;
}

export {
  get_engine,
  set_engine,
  useEvaState,
  useEvaStateHistory,
  EvaStateParams,
  EvaStateHistoryParams
};
