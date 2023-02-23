import StegWorker from "worker-loader!../../web-worker/steg-worker.ts";
import {
  makeComputeEncodeReq,
  makeComputeDecodeReq,
  WorkerRes,
  WorkerResType,
} from "../../shared/steg-worker-protocol";
import { RGB } from "../rgb";

class StegWorkerManager {
  private worker: Worker;
  private nextMessageHandlers: ((res: WorkerRes) => void)[] = [];

  constructor() {
    this.worker = this.createWorker();
  }

  private createWorker(): Worker {
    const worker = new StegWorker();
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

  computeEncode(
    coverImg: ImageData,
    lhs: RGB<Uint16Array>,
    rhs: RGB<Uint16Array>,
    hr: number,
    maxLsb: number,
  ): Promise<Uint8ClampedArray> {
    const cd = coverImg.data;
    if (this.nextMessageHandlers.length > 0) {
      // currently computing something
      this.worker.onmessage = () => {
        // do nothing
      };
      this.worker.terminate();
      this.worker = this.createWorker();
      this.nextMessageHandlers = [];
    }
    this.worker.postMessage(
      makeComputeEncodeReq({
        cd,
        cw: coverImg.width,
        ch: coverImg.height,
        lhs,
        rhs,
        hr,
        maxLsb,
      }),
    );
    return new Promise((resolve, reject) => {
      this.nextMessageHandlers.push((res) => {
        if (res.msg !== WorkerResType.ENCODED) {
          return reject(
            new Error(`expected to get response of type '${WorkerResType.ENCODED}' from worker!`),
          );
        }
        resolve(res.ed);
      });
    });
  }

  computeDecode(combinedImg: ImageData): Promise<[Uint8ClampedArray, number, number]> {
    const d = combinedImg.data;
    if (this.nextMessageHandlers.length > 0) {
      // currently computing something
      this.worker.onmessage = () => {
        // do nothing
      };
      this.worker.terminate();
      this.worker = this.createWorker();
      this.nextMessageHandlers = [];
    }
    this.worker.postMessage(
      makeComputeDecodeReq({
        d,
        w: combinedImg.width,
        h: combinedImg.height,
      }),
    );
    return new Promise((resolve, reject) => {
      this.nextMessageHandlers.push((res) => {
        if (res.msg !== WorkerResType.DECODED) {
          return reject(
            new Error(`expected to get response of type '${WorkerResType.DECODED}' from worker!`),
          );
        }
        resolve([res.dd, res.dw, res.dh]);
      });
    });
  }
}

export interface StegInfo {
  mode: string;
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export class StegComputationManager {
  private workerManager: StegWorkerManager;

  constructor(private onUpdate: (stegResult: StegInfo) => void) {
    this.workerManager = new StegWorkerManager();
  }

  computeEncode(
    coverImg: ImageData,
    lhs: RGB<Uint16Array>,
    rhs: RGB<Uint16Array>,
    hr: number,
    maxLsb: number,
  ): void {
    const encodedPromise = this.workerManager.computeEncode(coverImg, lhs, rhs, hr, maxLsb);
    encodedPromise.then((res) => {
      this.onUpdate({
        mode: "encode",
        data: res,
        width: coverImg.width,
        height: coverImg.height,
      });
    });
  }

  computeDecode(combinedImg: ImageData): void {
    const decodedPromise = this.workerManager.computeDecode(combinedImg);
    decodedPromise.then((res) => {
      this.onUpdate({
        mode: "decode",
        data: res[0],
        width: res[1],
        height: res[2],
      });
    });
  }
}
