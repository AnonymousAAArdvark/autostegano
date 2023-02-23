import { RGB } from "./rgb";

export function imageDataToPixels(imageData: ImageData): RGB<Uint8ClampedArray> {
  const n = imageData.width,
    m = imageData.height;
  const red = new Uint8ClampedArray(m * n);
  const green = new Uint8ClampedArray(m * n);
  const blue = new Uint8ClampedArray(m * n);
  let i = 0;
  for (let y = 0; y < m; y++) {
    for (let x = 0; x < n; x++) {
      const q = x * m + y;
      red[q] = imageData.data[i];
      green[q] = imageData.data[i + 1];
      blue[q] = imageData.data[i + 2];
      i += 4; // skip alpha value
    }
  }
  return { red: red, green: green, blue: blue };
}

export function loadImage(src: string, callback: (img: HTMLImageElement) => void): void {
  const img = new Image();
  img.onload = (): void => {
    callback(img);
  };
  if (/^http/.test(src)) {
    console.log("cors");
    // absolute url: use CORS proxy http://crossorigin.me
    img.crossOrigin = "anonymous";
    img.src = "http://crossorigin.me/" + src;
  } else {
    // relative url: load directly
    img.src = src;
  }
}

export function getImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}

export function resizeImageData(imageData: ImageData, scale: number) {
  const originalWidth = imageData.width;
  const originalHeight = imageData.height;
  const newWidth = Math.round(originalWidth * scale);
  const newHeight = Math.round(originalHeight * scale);
  const newImageData = new ImageData(newWidth, newHeight);
  const originalData = imageData.data;
  const newData = newImageData.data;

  for (let y = 0; y < newHeight; y++) {
    const originalY = ((y + 0.5) / scale - 0.5) | 0;
    for (let x = 0; x < newWidth; x++) {
      const originalX = ((x + 0.5) / scale - 0.5) | 0;
      const originalIndex = (originalY * originalWidth + originalX) * 4;
      const newIndex = (y * newWidth + x) * 4;

      newData[newIndex + 0] = originalData[originalIndex + 0];
      newData[newIndex + 1] = originalData[originalIndex + 1];
      newData[newIndex + 2] = originalData[originalIndex + 2];
      newData[newIndex + 3] = originalData[originalIndex + 3];
    }
  }

  return newImageData;
}
