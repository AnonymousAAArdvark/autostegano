import { makeResizeRes, ResizeReq } from "../shared/resize-worker-protocol";
import { resizeImageData } from "../main-app/image-functions";

function resize(img: ImageData, s: number): void {
  const scaledImageData = resizeImageData(img, s);
  const resizeCanvas = new OffscreenCanvas(scaledImageData.width, scaledImageData.height);
  const resizeContext = resizeCanvas.getContext("bitmaprenderer");

  if (resizeContext === null) {
    throw new Error("Failed to get 2D rendering context for canvas");
  }

  createImageBitmap(img, {
    resizeWidth: img.width * s,
    resizeHeight: img.height * s,
  }).then((btmp: ImageBitmap) => {
    resizeContext.transferFromImageBitmap(btmp);
    resizeContext.canvas.convertToBlob().then((blob: Blob) => {
      function blob_to_base64(blob: Blob): Promise<string> {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      blob_to_base64(blob).then((d_url: string) => {
        postMessage(makeResizeRes(d_url));
      });
    });
  });
}

onmessage = (event: MessageEvent): void => {
  const data = event.data as ResizeReq;
  const { img, s } = data;
  resize(img, s);
};
