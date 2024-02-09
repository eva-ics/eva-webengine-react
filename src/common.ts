const eva_webengine_react_version = "0.2.16";

import {
  Eva,
  EvaError,
  EvaErrorKind,
  StateProp,
  ItemState
} from "@eva-ics/webengine";
import { useState, useEffect, useRef, useCallback } from "react";
import { Mutex } from "async-mutex";

let eva: Eva | null = null;

let subscription_mutex = new Mutex();

const get_engine = (): Eva | null => {
  return eva;
};

const set_engine = (engine: Eva) => {
  eva = engine;
  (eva as any).wer_version = eva_webengine_react_version;
};

interface CanvasPosition {
  x: number;
  y: number;
}

interface EvaStateParams {
  oid?: string;
  engine?: Eva;
}

const useEvaState = (params: EvaStateParams) => {
  const [state, setState] = useState({} as ItemState);

  const eva_engine: Eva = params.engine || (eva as Eva);
  useEffect(() => {
    if (params.oid) {
      if (eva_engine) {
        eva_engine.watch(params.oid, setState);
      } else {
        throw new Error("EVA ICS WebEngine not set");
      }
    } else {
      setState({} as ItemState);
    }
    return () => {
      if (eva_engine && params.oid) {
        eva_engine.unwatch(params.oid, setState);
      }
    };
  }, [params.oid]);
  return state;
};

interface StateHistoryData {
  data: any;
  error?: EvaError;
}

interface EvaStateHistoryParams {
  oid?: string | Array<string>;
  timeframe: string | Array<string>;
  update?: number;
  prop?: StateProp;
  fill?: string;
  args?: any;
  engine?: Eva;
}

interface UpdateWorkerEnabled {
  enabled: boolean;
}

const useEvaStateHistory = (params: EvaStateHistoryParams) => {
  const [state, setState] = useState({ data: null } as StateHistoryData);
  const visible = useRef(false);
  const update_worker = useRef<any>(null);
  const update_worker_enabled = useRef<UpdateWorkerEnabled>({ enabled: true });

  const eva_engine: Eva = params.engine || (eva as Eva);
  let update_interval = params.update ? params.update * 1000 : 1000;
  if (isNaN(update_interval)) {
    update_interval = 1000;
  } else if (update_interval < 100) {
    update_interval = 100;
  }

  const updateHistory = useCallback(() => {
    if (!visible.current) {
      update_worker.current = null;
      update_worker_enabled.current.enabled = false;
      update_worker_enabled.current = { enabled: false };
      setState({ data: null });
      return;
    }
    update_worker_enabled.current = { enabled: true };
    const uw_enabled = update_worker_enabled.current;
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
          if (uw_enabled.enabled) {
            setState({ data: result });
            update_worker.current = setTimeout(updateHistory, update_interval);
          }
        })
        .catch((err: EvaError) => {
          if (uw_enabled.enabled) {
            setState({ data: null, error: err });
            update_worker.current = setTimeout(updateHistory, update_interval);
          }
        });
    } else {
      setState({ data: null });
      update_worker.current = setTimeout(updateHistory, update_interval);
    }
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
      if (eva_engine) {
        if (params.oid) {
          updateHistory();
        } else {
          setState({
            data: null,
            error: new EvaError(
              EvaErrorKind.INVALID_PARAMS,
              "OID not specified"
            )
          });
        }
      } else {
        throw new Error("EVA ICS WebEngine not set");
      }
    }
    return () => {
      visible.current = false;
      clearTimeout(update_worker.current);
      setState({ data: null });
      update_worker.current = null;
      update_worker_enabled.current.enabled = false;
      update_worker_enabled.current = { enabled: false };
    };
  }, [
    params.oid,
    params.timeframe,
    params.prop,
    params.fill,
    params.args,
    update_interval,
    updateHistory
  ]);
  return state;
};

interface EvaAPICallParams {
  method?: string;
  params?: object;
  update?: number;
  engine?: Eva;
}

interface APICallData {
  data: any;
  error?: EvaError;
}

const useEvaAPICall = (params: EvaAPICallParams) => {
  const [state, setState] = useState<APICallData>({ data: null });
  const visible = useRef(false);
  const update_worker: any = useRef(null);
  const update_worker_enabled = useRef<UpdateWorkerEnabled>({ enabled: true });

  const eva_engine: Eva = params.engine || (eva as Eva);
  let update_interval = params.update ? params.update * 1000 : 1000;
  if (isNaN(update_interval)) {
    update_interval = 1000;
  } else if (update_interval < 100) {
    update_interval = 100;
  }

  const updateData = useCallback(() => {
    if (!visible.current) {
      update_worker.current = null;
      update_worker_enabled.current.enabled = false;
      update_worker_enabled.current = { enabled: false };
      setState({ data: null });
      return;
    }
    update_worker_enabled.current = { enabled: true };
    const uw_enabled = update_worker_enabled.current;
    if (eva_engine && eva_engine.logged_in && params.method) {
      eva_engine!
        .call(params.method, params.params)
        .then((result: any) => {
          if (uw_enabled.enabled) {
            setState({ data: result });
            update_worker.current = setTimeout(updateData, update_interval);
          }
        })
        .catch((err: EvaError) => {
          if (uw_enabled.enabled) {
            setState({ data: null, error: err });
            update_worker.current = setTimeout(updateData, update_interval);
          }
        });
    } else {
      setState({ data: null });
      update_worker.current = setTimeout(updateData, update_interval);
    }
  }, [params.method, params.params, update_interval]);

  useEffect(() => {
    visible.current = true;
    if (!update_worker.current) {
      if (eva_engine) {
        if (params.method) {
          updateData();
        } else {
          setState({
            data: null
          });
        }
      } else {
        throw new Error("EVA ICS WebEngine not set");
      }
    }
    return () => {
      visible.current = false;
      clearTimeout(update_worker.current);
      setState({ data: null });
      update_worker.current = null;
      update_worker_enabled.current.enabled = false;
      update_worker_enabled.current = { enabled: false };
    };
  }, [params.method, params.params, updateData]);
  return state;
};

enum EvaSubscriptionState {
  Working,
  Active,
  Failed
}

interface EvaStateUpdatesParams {
  engine?: Eva;
  state_updates: Array<string> | boolean;
  clear_existing?: boolean;
  keep?: boolean;
  append?: boolean;
}

const useEvaStateUpdates = (
  params: EvaStateUpdatesParams,
  dependencies?: any
) => {
  const [state, setState] = useState(EvaSubscriptionState.Working);

  const eva_engine: Eva = params.engine || (eva as Eva);

  useEffect(() => {
    let previous: Array<string> | boolean = false;
    if (eva_engine) {
      setState(EvaSubscriptionState.Working);
      subscription_mutex.acquire().then((release) => {
        if (params.keep) {
          previous = eva_engine.state_updates;
        }
        let state_updates = params.state_updates;
        if (params.append) {
          if (eva_engine.state_updates === true) {
            state_updates = true;
          } else if (
            Array.isArray(eva_engine.state_updates) &&
            Array.isArray(state_updates)
          ) {
            state_updates = []
              .concat(eva_engine.state_updates as any)
              .concat(state_updates as any);
          }
        }
        if (eva_engine.state_updates === state_updates) {
          release();
          setState(EvaSubscriptionState.Active);
        } else {
          eva_engine
            .set_state_updates(state_updates, params.clear_existing)
            .then(() => setState(EvaSubscriptionState.Active))
            .catch((e) => {
              eva_engine.log.error(e);
              setState(EvaSubscriptionState.Failed);
            })
            .finally(() => release());
        }
      });
    } else {
      throw new Error("EVA ICS WebEngine not set");
    }
    return () => {
      if (eva_engine) {
        subscription_mutex.acquire().then((release) => {
          if (previous === eva_engine.state_updates) {
            release();
          } else {
            eva_engine
              .set_state_updates(previous, params.clear_existing)
              .catch((e) => eva_engine.log.error(e))
              .finally(() => release());
          }
        });
      }
    };
  }, dependencies);
  return state;
};

const COLOR_NORMAL = "progress-color";
const COLOR_WARNING = "warning-progress-color";
const COLOR_CRITICAL = "critical-progress-color";

const calculateProgressColor = (
  kind: string,
  value?: number,
  warnValue?: number,
  critValue?: number,
  lowWarnValue?: number,
  lowCritValue?: number
) => {
  if (value === undefined || isNaN(value)) {
    return `${kind}-${COLOR_NORMAL}`;
  }
  if (lowCritValue !== undefined && value <= lowCritValue) {
    return `${kind}-${COLOR_CRITICAL}`;
  }
  if (lowWarnValue !== undefined && value <= lowWarnValue) {
    return `${kind}-${COLOR_WARNING}`;
  }
  if (critValue !== undefined && value >= critValue) {
    return `${kind}-${COLOR_CRITICAL}`;
  }
  if (warnValue !== undefined && value >= warnValue) {
    return `${kind}-${COLOR_WARNING}`;
  }
  return `${kind}-${COLOR_NORMAL}`;
};

export {
  get_engine,
  set_engine,
  CanvasPosition,
  useEvaState,
  useEvaStateHistory,
  useEvaAPICall,
  EvaStateParams,
  EvaStateHistoryParams,
  StateHistoryData,
  EvaAPICallParams,
  APICallData,
  EvaSubscriptionState,
  EvaStateUpdatesParams,
  useEvaStateUpdates,
  calculateProgressColor
};
