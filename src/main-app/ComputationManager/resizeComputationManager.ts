import ResizeWorker from "worker-loader!../../web-worker/resize-worker.ts";
import { ResizeRes, makeResizeReq } from "../../shared/resize-worker-protocol";

class ResizeWorkerManager {
  private worker: Worker;
  private nextMessageHandlers: ((res: ResizeRes) => void)[] = [];

  constructor() {
    this.worker = this.createWorker();
  }

  private createWorker(): Worker {
    const worker = new ResizeWorker();
    worker.onmessage = (event) => {
      this.onMessage(event);
    };
    return worker;
  }

  onMessage(event: MessageEvent) {
    if (this.nextMessageHandlers.length > 0) {
      this.nextMessageHandlers.shift()?.(event.data as ResizeRes);
    }
  }

  computeResize(img: ImageData, scale: number): Promise<string> {
    if (this.nextMessageHandlers.length > 0) {
      // currently computing something
      this.worker.onmessage = () => {
        // do nothing
      };
      this.worker.terminate();
      this.worker = this.createWorker();
      this.nextMessageHandlers = [];
    }
    this.worker.postMessage(makeResizeReq(img, scale));
    return new Promise((resolve) => {
      this.nextMessageHandlers.push((res) => {
        resolve(res.url);
      });
    });
  }
}

export class ResizeComputationManager {
  private workerManager: ResizeWorkerManager;

  constructor(private onUpdate: (url: string) => void) {
    this.workerManager = new ResizeWorkerManager();
  }

  computeResize(img: ImageData, initialScale: number): void {
    this.workerManager.computeResize(img, initialScale).then((url) => {
      this.onUpdate(url);
    });
  }
}
