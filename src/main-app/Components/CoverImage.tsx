import * as React from "react";
import { getImageData, loadImage } from "../image-functions";
import { StegView } from "../CanvasView/StegView";
import { StegComputationManager, StegInfo } from "../ComputationManager/stegComputationManager";
import { ResizeComputationManager } from "../ComputationManager/resizeComputationManager";
import { ImageContainer } from "./ImageContainer";
import { MaxLSBSlider } from "./Slider/MaxLSBSlider";
import { ResizeSlider } from "./Slider/ResizeSlider";
import { SvdState, SvdStatus } from "../svdstate";
import { ResizeState, ResizeStatus } from "../resizestate";
import { rgbMap } from "../rgb";
import styles from "../Styles/Image.module.css";

function arrToSrc(data: Uint8ClampedArray, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const imageData = new ImageData(data, width, height);
  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL();
}

interface CoverImageState {
  resizeState: null | ResizeState;
  stegState: null | StegInfo;
  warnSize: boolean;
  img: null | HTMLImageElement;
}

export interface CoverImageProps {
  coverWidth: number;
  coverHeight: number;
  onUpdateCoverDimensions: (coverWidth: number, coverHeight: number) => void;
  coverScale: number;
  onUpdateCoverScale: (coverScale: number) => void;
  maxLsb: number;
  onUpdateMaxLsb: (maxLsb: number) => void;
  autoCoverScale: () => number;
  autoMaxLsb: () => number;
  numSvs: number;
  svdState: SvdState;
  getCoverSize: () => number;
  getHiddenSize: () => number;
}

export class CoverImage extends React.Component<CoverImageProps, CoverImageState> {
  private stegViewRef: React.RefObject<StegView>;
  private stegComputationManager: StegComputationManager;
  private resizeComputationManager: ResizeComputationManager;

  constructor(props: CoverImageProps) {
    super(props);
    this.state = {
      resizeState: null,
      warnSize: true,
      img: null,
      stegState: null,
    };

    this.stegViewRef = React.createRef();
    this.stegComputationManager = new StegComputationManager((stegResult) => {
      this.setState({ stegState: stegResult });
      // if (stegResult.mode == "encode") {
      //   this.stegComputationManager.computeDecode(
      //     new ImageData(stegResult.data, stegResult.width, stegResult.height),
      //   );
      // }
    });

    this.resizeComputationManager = new ResizeComputationManager((url) => {
      this.updateScaledImageData(url);
    });

    this.onAutoScale = this.onAutoScale.bind(this);
    this.onAutoMaxLsb = this.onAutoMaxLsb.bind(this);
  }

  componentDidUpdate(prevProps: CoverImageProps): void {
    if (
      prevProps.svdState !== this.props.svdState &&
      this.state.resizeState &&
      this.state.resizeState.status === ResizeStatus.COMPUTED
    ) {
      this.computeEncode(getImageData(this.state.resizeState.sImg), this.props.maxLsb);
    }
  }

  initializeImage(img: HTMLImageElement): void {
    const { width, height } = img;

    let imageData: ImageData;
    try {
      imageData = getImageData(img);
    } catch (exc) {
      if (exc instanceof Error && exc.message.match(/(tainted|cross-origin|insecure)/)) {
        return window.alert(
          "Due to browser limitations (cross-origin policy), it isn't possible use pictures dragged from other sites. You have to save the image locally before you can use it.",
        );
      }
      throw exc; // rethrow
    }

    if (width > 4000 || height > 4000) {
      const msg =
        "Your image is quite large. Computing the Steganography may take a while. Continue?";
      if (!window.confirm(msg)) {
        return;
      }
      this.setState({ warnSize: false });
    }

    this.setState({ img } as CoverImageState);
    if (this.props.coverScale === 1) {
      this.props.onUpdateCoverDimensions(width, height);
      this.setState({
        resizeState: { status: ResizeStatus.COMPUTED, sImg: img },
      } as CoverImageState);
      this.computeEncode(imageData, this.props.maxLsb);
    } else {
      this.setState({
        resizeState: null,
      } as CoverImageState);
      this.resizeComputationManager.computeResize(imageData, this.props.coverScale);
    }
  }

  updateScaledImage(scale: number): void {
    const { width, height } = this.state.img as HTMLImageElement;
    const ImageData = getImageData(this.state.img as HTMLImageElement);

    if ((width * scale > 4000 || height * scale > 4000) && this.state.warnSize) {
      const handle = document.getElementsByClassName("rc-slider-handle")[3];
      const mouseUpEvent = new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        button: 0,
      });
      handle.dispatchEvent(mouseUpEvent); // hacky
      const msg = "Your image will be quite large. Computing the SVD may take a while. Continue?";
      if (!window.confirm(msg)) {
        this.props.onUpdateCoverScale(this.props.coverScale);
        return;
      }
      this.setState({ warnSize: false });
    }

    this.props.onUpdateCoverScale(scale);
    this.setState({
      resizeState: { ...this.state.resizeState, status: ResizeStatus.CURRENTLY_COMPUTING },
    } as CoverImageState);
    this.resizeComputationManager.computeResize(ImageData, scale);
  }

  updateScaledImageData(url: string): void {
    const resizedImageElement = new Image();
    resizedImageElement.src = url;

    resizedImageElement.onload = () => {
      const scaledImageData = getImageData(resizedImageElement);

      this.setState({
        resizeState: { status: ResizeStatus.COMPUTED, sImg: resizedImageElement },
      } as CoverImageState);
      this.computeEncode(scaledImageData, this.props.maxLsb);
    };
  }

  loadImage(url: string): void {
    loadImage(url, this.initializeImage.bind(this));
  }

  computeEncode(imageData: ImageData, maxLsb: number): void {
    if (
      this.props.svdState.status === SvdStatus.COMPUTED &&
      this.props.svdState.lowRankApproximation !== undefined
    ) {
      const lhs = rgbMap(
        (lowRankApproximation) => lowRankApproximation[1],
        this.props.svdState.lowRankApproximation,
      );
      const rhs = rgbMap(
        (lowRankApproximation) => lowRankApproximation[2],
        this.props.svdState.lowRankApproximation,
      );
      const { numSvs } = this.props;
      this.stegComputationManager.computeEncode(imageData, lhs, rhs, numSvs, maxLsb);
    }
  }

  onUpdateScale(scale: number): void {
    this.updateScaledImage(scale);
  }

  onUpdateMaxLSB(maxLsb: number): void {
    if (this.state.resizeState && this.state.resizeState.status === ResizeStatus.COMPUTED) {
      const scaledImageData = getImageData(this.state.resizeState.sImg as HTMLImageElement);
      this.computeEncode(scaledImageData, maxLsb);
    }
    this.props.onUpdateMaxLsb(maxLsb);
  }

  onAutoScale(): void {
    this.updateScaledImage(this.props.autoCoverScale());
  }

  onAutoMaxLsb(): void {
    const maxLsb = this.props.autoMaxLsb();
    if (this.state.resizeState && this.state.resizeState.status === ResizeStatus.COMPUTED) {
      const scaledImageData = getImageData(this.state.resizeState.sImg as HTMLImageElement);
      this.computeEncode(scaledImageData, maxLsb);
    }
    this.props.onUpdateMaxLsb(maxLsb);
  }

  render(): JSX.Element {
    const { maxLsb, autoMaxLsb, autoCoverScale } = this.props;
    const { img, resizeState, stegState } = this.state;
    const {
      coverScale: scale,
      coverWidth: width,
      coverHeight: height,
      getCoverSize,
      getHiddenSize,
    } = this.props;
    const canEncode = getCoverSize() >= getHiddenSize();
    const w = Math.trunc(width * scale);
    const h = Math.trunc(height * scale);

    let mainImageView: JSX.Element;
    if (
      img &&
      stegState &&
      resizeState &&
      resizeState.status === ResizeStatus.COMPUTED &&
      stegState.data.length === 0
    ) {
      mainImageView = (
        <ImageContainer
          origSrc={img}
          src={resizeState.sImg.src}
          imgType={"cover"}
          computingMsg={
            "Adjust the settings so that the hidden image data fits into the cover image!"
          }
          onUploadImage={this.loadImage.bind(this)}
        />
      );
    } else if (
      img &&
      stegState &&
      stegState.width === w &&
      resizeState &&
      resizeState.status === ResizeStatus.COMPUTED
    ) {
      mainImageView = (
        <ImageContainer
          origSrc={img}
          src={arrToSrc(stegState.data, w, h)}
          imgType={"cover"}
          computingMsg={""}
          onUploadImage={this.loadImage.bind(this)}
        />
      );
    } else if (img && resizeState) {
      mainImageView = (
        <ImageContainer
          origSrc={img}
          src={resizeState.sImg.src}
          imgType={"cover"}
          computingMsg={
            resizeState.status === ResizeStatus.CURRENTLY_COMPUTING
              ? "Computing Resize..."
              : "Computing Steg..."
          }
          onUploadImage={this.loadImage.bind(this)}
        />
      );
    } else {
      mainImageView = (
        <ImageContainer
          origSrc={null}
          src={""}
          imgType={"cover"}
          computingMsg={""}
          onUploadImage={this.loadImage.bind(this)}
        />
      );
    }

    return (
      <div>
        {mainImageView}
        <div className={`${styles.calc_container}`}>
          <div className={styles.result_container}>
            <span className={canEncode ? styles.green : styles.red}>
              {getCoverSize().toLocaleString()} bytes{" "}
            </span>
            =
          </div>
          <p className={styles.calc}>
            <b>{w.toLocaleString()}</b> width * <b>{h.toLocaleString()}</b> height *{" "}
              <b>{maxLsb.toLocaleString()}</b>
            {" "}maximum bits encoded * <b>3</b> channels / <b>8</b> bit-per-byte
          </p>
        </div>
        <div className={styles.options_container}>
          <MaxLSBSlider
            value={maxLsb}
            onChange={this.onUpdateMaxLSB.bind(this)}
            onAuto={this.onAutoMaxLsb.bind(this)}
          />
          <ResizeSlider
            imageType={"Cover"}
            value={scale}
            onChange={this.onUpdateScale.bind(this)}
            onAuto={this.onAutoScale.bind(this)}
          />
        </div>
      </div>
    );
  }
}
