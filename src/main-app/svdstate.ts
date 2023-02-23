import { SvdInfo } from "./ComputationManager/svdComputationManager";

export enum SvdStatus {
  CURRENTLY_COMPUTING = "CURRENTLY_COMPUTING",
  COMPUTED = "COMPUTED",
}

interface SvdStateCurrentlyComputing {
  status: SvdStatus.CURRENTLY_COMPUTING;
}

interface SvdStateComputed extends SvdInfo {
  status: SvdStatus.COMPUTED;
}

export type SvdState = SvdStateCurrentlyComputing | SvdStateComputed;
