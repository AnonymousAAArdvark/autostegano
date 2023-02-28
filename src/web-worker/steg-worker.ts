import { LSBStego } from "image-steganography-worker";
import {
  makeEncodedRes,
  makeDecodedRes,
  WorkerReq,
  WorkerReqType,
} from "../shared/steg-worker-protocol";
import { RGB } from "../main-app/rgb";

function encode(
  cd: Uint8ClampedArray,
  cw: number,
  ch: number,
  lhs: RGB<Uint16Array>,
  rhs: RGB<Uint16Array>,
  hr: number,
  maxLsb: number,
): void {
  import("image-steganography-worker").then(
    (wasm) => {
      wasm.set_panic_hook();
      const stegStruct = LSBStego.new(cd, cw, ch);
      const hh = lhs.red.length / hr;
      const hw = rhs.red.length / hr;

      if (Math.trunc((cw * ch * 3 * maxLsb) / 8) <= (hw + hh) * hr * 3 * 2 + 6) {
        postMessage(
          makeEncodedRes(
            new Uint8ClampedArray(),
            "Cover image not large enough to hold hidden image! Adjust the image parameters until it fits!",
          ),
        );
        return;
      }

      stegStruct.init_encode(hw, hh, hr, maxLsb);
      stegStruct.encode_channel(
        new Uint8ClampedArray(lhs.red.buffer),
        new Uint8ClampedArray(rhs.red.buffer),
      );
      stegStruct.encode_channel(
        new Uint8ClampedArray(lhs.green.buffer),
        new Uint8ClampedArray(rhs.green.buffer),
      );
      stegStruct.encode_channel(
        new Uint8ClampedArray(lhs.blue.buffer),
        new Uint8ClampedArray(rhs.blue.buffer),
      );

      const ed = stegStruct.get_image() as Uint8ClampedArray;

      postMessage(makeEncodedRes(ed, ""));
    },
    (e) => {
      console.log("Could not load WASM module! Error: ", e);
    },
  );
}

function decode(d: Uint8ClampedArray, w: number, h: number): void {
  import("image-steganography-worker").then(
    (wasm) => {
      wasm.set_panic_hook();
      const stegStruct = LSBStego.new(d, w, h);
      const [dw, dh, dr] = stegStruct.decode_properties();

      if (w * h * 3 < (dw + dr + dh * dr) * 3 * 2 + 48) {
        postMessage(
          makeDecodedRes(
            new Uint8ClampedArray(),
            0,
            0,
            "Cover image not large enough to hold hidden image! Has the hidden image actually been encoded?",
          ),
        );
        return;
      }

      const dd = stegStruct.decode_approximation(dw, dh, dr);

      postMessage(makeDecodedRes(dd, dw, dh, ""));
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
    case WorkerReqType.ENCODE: {
      const { cd, cw, ch, lhs, rhs, hr, maxLsb } = data;
      encode(cd, cw, ch, lhs, rhs, hr, maxLsb);
      break;
    }
    case WorkerReqType.DECODE: {
      const { d, w, h } = data;
      decode(d, w, h);
      break;
    }
    default:
      throw new Error(`unrecognized command '${type}'!`);
  }
};
