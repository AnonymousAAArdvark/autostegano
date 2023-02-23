import { HoverCanvasView, HoverCanvasViewState, HoverCanvasViewProps } from "./HoverCanvasView";

export interface StegViewProps extends HoverCanvasViewProps {
  hoverToSeeOriginal: boolean;
  img: HTMLImageElement;
  stegResult: Uint8ClampedArray;
}

export class StegView extends HoverCanvasView<StegViewProps, HoverCanvasViewState> {
  private imageData: null | ImageData = null;
  constructor(props: StegViewProps) {
    super(props);
    this.state = { hover: false };
  }
  shouldComponentUpdate(nextProps: StegViewProps): boolean {
    if (nextProps.width !== this.props.width || nextProps.height !== this.props.height) {
      // invalidate cached image data
      this.imageData = null;
    }
    return true;
  }
  paint(ctx: CanvasRenderingContext2D): void {
    const n = this.props.width,
      m = this.props.height;
    if (!ctx) {
      return;
    }
    if (this.state.hover && this.props.hoverToSeeOriginal) {
      ctx.drawImage(this.props.img, 0, 0, ctx.canvas.width, ctx.canvas.height);
    } else {
      if (!this.imageData) {
        // storing image data saves ~10ms
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, n, m);
        this.imageData = ctx.getImageData(0, 0, n, m);
      }
      const data = this.imageData.data;
      const stegResult = this.props.stegResult;
      let j = 0;
      for (let y = 0; y < m; y++) {
        for (let x = 0; x < n; x++) {
          data[j] = stegResult[j];
          data[j + 1] = stegResult[j + 1];
          data[j + 2] = stegResult[j + 2];
          j += 4;
        }
      }
      ctx.putImageData(this.imageData, 0, 0);
    }
  }
}
