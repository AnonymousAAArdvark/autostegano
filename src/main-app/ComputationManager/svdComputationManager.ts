import SvdWorker from "worker-loader!../../web-worker/svd-worker.ts";
import {
  makeComputeLowRankApproximationReq,
  makeComputeSvdReq,
  WorkerRes,
  WorkerResType,
} from "../../shared/svd-worker-protocol";
import { createRGB, RGB, rgbAp, rgbMap, rgbPromiseAll } from "../rgb";

class SvdWorkerManager {
  private worker: Worker;
  private nextMessageHandlers: ((res: WorkerRes) => void)[] = [];

  constructor() {
    this.worker = this.createWorker();
  }

  private createWorker(): Worker {
    const worker = new SvdWorker();
    worker.onmessage = (event) => {
      this.onMessage(event);
    };
    return worker;
  }

  onMessage(event: MessageEvent) {
    if (this.nextMessageHandlers.length > 0) {
      this.nextMessageHandlers.shift()?.(event.data as WorkerRes);
    }
  }

  computeSvd(m: number, n: number, channel: Uint8ClampedArray): Promise<Uint8ClampedArray> {
    const buffer = channel.buffer;
    if (this.nextMessageHandlers.length > 0) {
      // currently computing something
      this.worker.onmessage = () => {
        // do nothing
      };
      this.worker.terminate();
      this.worker = this.createWorker();
      this.nextMessageHandlers = [];
    }
    this.worker.postMessage(makeComputeSvdReq({ a: buffer, m: m, n: n }), [buffer]);
    return new Promise((resolve, reject) => {
      this.nextMessageHandlers.push((res) => {
        if (res.msg !== WorkerResType.SINGULAR_VALUES) {
          return reject(
            new Error(
              `expected to get response of type '${WorkerResType.SINGULAR_VALUES}' from worker!`,
            ),
          );
        }
        resolve(res.singularValues);
      });
    });
  }

  computeLowRankApproximation(
    rank: number,
  ): Promise<[Uint8ClampedArray, Uint16Array, Uint16Array]> {
    return new Promise((resolve, reject) => {
      this.nextMessageHandlers.push((res) => {
        if (res.msg !== WorkerResType.LOW_RANK_APPROXIMATION) {
          return reject(
            new Error(
              `expected to get response of type '${WorkerResType.LOW_RANK_APPROXIMATION}' from worker!`,
            ),
          );
        }
        resolve([res.lowRankApproximation, res.lhs, res.rhs]);
      });
      this.worker.postMessage(makeComputeLowRankApproximationReq(rank));
    });
  }
}

export interface SvdInfo {
  singularValues: RGB<Uint8ClampedArray>;
  lowRankApproximation: RGB<[Uint8ClampedArray, Uint16Array, Uint16Array]>;
}

export class SvdComputationManager {
  private exactWorkerManagers: RGB<SvdWorkerManager>;
  private requestedRank = 0;
  private exactResult:
    | (Pick<SvdInfo, "singularValues"> & {
        computedLowRankApproximation: boolean;
        currentlyComputingLowRankApproximation: boolean;
      })
    | undefined = undefined;

  constructor(private onUpdate: (info: SvdInfo) => void) {
    this.exactWorkerManagers = createRGB(() => new SvdWorkerManager());
  }

  computeSvd(m: number, n: number, channels: RGB<Uint8ClampedArray>, initialRank: number): void {
    this.exactResult = undefined;

    const singularValuesExactPromises = rgbAp(
      (workerManager, channel) => workerManager.computeSvd(m, n, channel),
      this.exactWorkerManagers,
      channels,
    );
    rgbPromiseAll(singularValuesExactPromises).then((singularValues) => {
      this.exactResult = {
        singularValues,
        computedLowRankApproximation: false,
        currentlyComputingLowRankApproximation: false,
      };
      this.setRank(initialRank);
    });
  }

  private computeLowRankApproximation(
    workerManagers: RGB<SvdWorkerManager>,
    rank: number,
  ): Promise<RGB<[Uint8ClampedArray, Uint16Array, Uint16Array]>> {
    const promises = rgbMap(
      (workerManager) => workerManager.computeLowRankApproximation(rank),
      workerManagers,
    );
    return rgbPromiseAll(promises);
  }

  setRank(rank: number = this.requestedRank): void {
    this.requestedRank = rank;
    if (this.exactResult !== undefined) {
      if (this.exactResult.currentlyComputingLowRankApproximation) {
        return;
      }
      this.exactResult = { ...this.exactResult, currentlyComputingLowRankApproximation: true };
      this.computeLowRankApproximation(this.exactWorkerManagers, rank).then(
        (lowRankApproximation) => {
          if (this.exactResult !== undefined) {
            this.exactResult = {
              ...this.exactResult,
              computedLowRankApproximation: true,
              currentlyComputingLowRankApproximation: false,
            };
            this.onUpdate({
              lowRankApproximation,
              singularValues: this.exactResult.singularValues,
            });
            if (this.requestedRank !== rank) {
              this.setRank(this.requestedRank);
            }
          }
        },
      );
    }
  }
}
