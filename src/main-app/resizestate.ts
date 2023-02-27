export enum ResizeStatus {
  CURRENTLY_COMPUTING = "CURRENTLY_COMPUTING",
  COMPUTED = "COMPUTED",
}

interface ResizeStateCurrentlyComputing {
  sImg: HTMLImageElement;
  status: ResizeStatus.CURRENTLY_COMPUTING;
}

interface ResizeStateComputed {
  sImg: HTMLImageElement;
  status: ResizeStatus.COMPUTED;
}

export type ResizeState = ResizeStateCurrentlyComputing | ResizeStateComputed;
