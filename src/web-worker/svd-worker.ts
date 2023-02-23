import { SvdResult } from "svd-image-compression-worker";
import {
  makeLowRankApproximationRes,
  makeSingularValuesRes,
  WorkerReq,
  WorkerReqType,
} from "../shared/svd-worker-protocol";

let struct: SvdResult | undefined = undefined;

function svd(a: Uint8ClampedArray, m: number, n: number): void {
  import("svd-image-compression-worker").then(
    (wasm) => {
      wasm.set_panic_hook();
      struct?.free();
      const svdStruct = (struct = wasm.svd(a, m, n));
      const singularValues = svdStruct.singular_values();
      // Have to create a copy because otherwise the next line fails in Chrome with error
      // > DOMException: Failed to execute 'postMessage' on 'DedicatedWorkerGlobalScope':
      // > ArrayBuffer is not detachable and could not be cloned.
      postMessage(makeSingularValuesRes(new Uint8ClampedArray(singularValues)));
    },
    (e) => {
      console.log("Could not load WASM module! Error: ", e);
    },
  );
}

onmessage = (event: MessageEvent): void => {
  const data = event.data as WorkerReq;
  const type = data.msg;
  switch (data.msg) {
    case WorkerReqType.COMPUTE_SVD: {
      svd(new Uint8ClampedArray(data.a), data.m, data.n);
      break;
    }
    case WorkerReqType.COMPUTE_LOW_RANK_APPROXIMATION: {
      if (struct === undefined) {
        throw new Error(`'${WorkerReqType.COMPUTE_SVD}' must come first!`);
      }
      const lowRankApproximation = struct.compute_low_rank_approximation(data.rank);
      const lhs = struct.get_lhs(data.rank);
      const rhs = struct.get_rhs(data.rank).map((x: number) => {
        return Math.round(x * 10000);
      });

      // Have to create a copy because otherwise the next line fails in Chrome with error
      // > DOMException: Failed to execute 'postMessage' on 'DedicatedWorkerGlobalScope':
      // > ArrayBuffer is not detachable and could not be cloned.
      postMessage(
        makeLowRankApproximationRes(
          new Uint8ClampedArray(lowRankApproximation),
          new Uint16Array(lhs),
          new Uint16Array(rhs),
        ),
      );
      break;
    }
    default:
      throw new Error(`unrecognized command '${type}'!`);
  }
};
