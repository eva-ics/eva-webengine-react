import {
  EvaLivePlayerAutoSize,
  type EvaVideoStreamInfo,
  EvaLivePlayer as EvaLivePlayerC
} from "@eva-ics/webengine-multimedia";
import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Eva, EvaError } from "@eva-ics/webengine";

export interface EvaLivePlayerParams {
  oid: string;
  streamName?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  autoSize?: EvaLivePlayerAutoSize;
  engine?: Eva;
  onError?: (error: EvaError) => void;
  onFrame?: () => void;
  onEOS?: () => void;
  onChange?: (info: EvaVideoStreamInfo) => void;
  onInit?: (canvas: HTMLCanvasElement) => void;
  setPlayer?: (player: EvaLivePlayerC) => void;
  decoderHardwareAcceleration?: boolean;
  decoderFallbackToSoftware?: boolean;
}

export const EvaLivePlayer = (params: EvaLivePlayerParams) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const streamName = params.streamName || `${params.oid}::${uuidv4()}`;
    const player = new EvaLivePlayerC({
      canvas: canvas,
      name: streamName,
      engine: params.engine,
      onError: params.onError,
      onFrame: params.onFrame,
      onEOS: params.onEOS,
      onChange: params.onChange,
      decoderHardwareAcceleration: params.decoderHardwareAcceleration,
      decoderFallbackToSoftware: params.decoderFallbackToSoftware,
      autoSize: params.autoSize || EvaLivePlayerAutoSize.None
    });

    if (params.setPlayer) {
      params.setPlayer(player);
    }

    if (params.onInit) {
      params.onInit(canvas);
    }

    player.start(params.oid);

    return () => {
      player.close();
    };
  }, [
    canvasRef,
    params.autoSize,
    params.decoderFallbackToSoftware,
    params.decoderHardwareAcceleration,
    params.engine,
    params.oid,
    params.streamName
  ]);

  let width = params.width;
  let height = params.height;

  if (!width && !params.className && !params.style) {
    width = 320; // Default width
  }

  if (!height && !params.className && !params.style) {
    height = 240; // Default height
  }

  return (
    <canvas
      width={width}
      height={height}
      className={params.className}
      style={params.style}
      ref={canvasRef}
    ></canvas>
  );
};
