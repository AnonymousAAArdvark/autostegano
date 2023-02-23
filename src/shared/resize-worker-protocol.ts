export interface ResizeReq {
  img: ImageData;
  s: number;
}

export function makeResizeReq(img: ImageData, s: number): ResizeReq {
  return {
    img,
    s,
  }
}

export interface ResizeRes {
  url: string;
}

export function makeResizeRes(url: string): ResizeRes {
  return {
    url,
  }
}