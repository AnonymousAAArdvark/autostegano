import { RGB } from "../main-app/rgb";

export enum WorkerReqType {
  ENCODE = "encode",
  DECODE = "decode",
}

interface BaseReq<s extends WorkerReqType> {
  msg: s;
}

interface ComputeEncodeArgs {
  cd: Uint8ClampedArray; // Cover data
  cw: number; // Cover width
  ch: number; // Cover height
  lhs: RGB<Uint16Array>; // Left hand side of svd-approx
  rhs: RGB<Uint16Array>; // Right hand side of svd-approx
  hr: number; // Hidden rank
  maxLsb: number; // Maximum amount of bits to encode
}

export type ComputeEncodeReq = BaseReq<WorkerReqType.ENCODE> & ComputeEncodeArgs;

export function makeComputeEncodeReq(args: ComputeEncodeArgs): ComputeEncodeReq {
  return {
    msg: WorkerReqType.ENCODE,
    ...args,
  }
}

interface ComputeDecodeArgs {
  d: Uint8ClampedArray;
  w: number;
  h: number;
}

export type ComputeDecodeReq = BaseReq<WorkerReqType.DECODE> & ComputeDecodeArgs;

export function makeComputeDecodeReq(args: ComputeDecodeArgs): ComputeDecodeReq {
  return {
    msg: WorkerReqType.DECODE,
    ...args,
  };
}

export type WorkerReq = ComputeEncodeReq | ComputeDecodeReq;

export enum WorkerResType {
  ENCODED = "ENCODED",
  DECODED = "DECODED",
}

interface BaseRes<s extends WorkerResType> {
  msg: s;
}

interface EncodedRes extends BaseRes<WorkerResType.ENCODED> {
  ed: Uint8ClampedArray;
  err: string;
}

export function makeEncodedRes(ed: Uint8ClampedArray, err: string): EncodedRes {
  return {
    msg: WorkerResType.ENCODED,
    ed,
    err,
  };
}

interface DecodedRes extends BaseRes<WorkerResType.DECODED> {
  dd: Uint8ClampedArray;
  dw: number;
  dh: number;
  err: string;
}

export function makeDecodedRes(dd: Uint8ClampedArray, dw: number, dh: number, err: string): DecodedRes {
  return {
    msg: WorkerResType.DECODED,
    dd,
    dw,
    dh,
    err,
  };
}

export type WorkerRes = EncodedRes | DecodedRes;
