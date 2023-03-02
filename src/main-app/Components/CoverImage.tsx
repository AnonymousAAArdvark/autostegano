import * as React from "react";
import { getImageData, loadImage } from "../image-functions";
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
  decodeImg: null | HTMLImageElement;
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
  onUpdateCoverDownloadStatus: (status: string) => void;
  setDownloadCoverImage: (downloadCoverImage: () => void) => void;
  onUpdateHiddenDownloadStatus: (status: string) => void;
  setDownloadHiddenImage: (downloadHiddenImage: () => void) => void;
  onUpdateDecodedImage: (decodedImg: string) => void;
  decodedImageSrc: string;
  mode: string;
}

export class CoverImage extends React.Component<CoverImageProps, CoverImageState> {
  private stegComputationManager: StegComputationManager;
  private resizeComputationManager: ResizeComputationManager;

  constructor(props: CoverImageProps) {
    super(props);
    this.state = {
      resizeState: null,
      warnSize: true,
      img: null,
      stegState: null,
      decodeImg: null,
    };

    this.stegComputationManager = new StegComputationManager((stegResult) => {
      if (stegResult.mode === "encode") {
        this.setState({ stegState: stegResult });
        this.props.onUpdateCoverDownloadStatus(stegResult.data.length !== 0 ? "allow" : "block");
      } else {
        if (stegResult.data.length !== 0) {
          this.props.onUpdateDecodedImage(
            arrToSrc(stegResult.data, stegResult.width, stegResult.height),
          );
          this.props.onUpdateHiddenDownloadStatus("allow");
        } else {
          this.props.onUpdateDecodedImage("");
          this.props.onUpdateHiddenDownloadStatus("block");
        }
      }
    });

    this.resizeComputationManager = new ResizeComputationManager((url) => {
      this.updateScaledImageData(url);
    });

    this.onAutoScale = this.onAutoScale.bind(this);
    this.onAutoMaxLsb = this.onAutoMaxLsb.bind(this);
    this.downloadCoverImage = this.downloadCoverImage.bind(this);
    this.downloadHiddenImage = this.downloadHiddenImage.bind(this);
  }

  componentDidMount() {
    this.props.setDownloadCoverImage(this.downloadCoverImage);
    this.props.setDownloadHiddenImage(this.downloadHiddenImage);
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

    if (this.props.mode === "encode") {
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
    } else {
      this.setState({ decodeImg: img } as CoverImageState);
      this.stegComputationManager.computeDecode(imageData);
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
    this.props.onUpdateCoverDownloadStatus("block");
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

  downloadCoverImage(): void {
    const { stegState } = this.state;
    if (stegState) {
      const link = document.createElement("a");
      link.download = "cover_image.png";
      link.href = arrToSrc(stegState.data, stegState.width, stegState.height);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  downloadHiddenImage(): void {
    if (this.props.decodedImageSrc !== "") {
      const link = document.createElement("a");
      link.download = "hidden_image.png";
      link.href = this.props.decodedImageSrc;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  makeEncodeImageView(): JSX.Element {
    const { img, resizeState, stegState } = this.state;
    const { coverScale: scale, coverWidth: width, mode, getHiddenSize } = this.props;
    const w = Math.trunc(width * scale);

    const hasValidStegState =
      img && stegState && stegState.width === w && stegState.data.length !== 0;
    const hasComputedResizeState = resizeState && resizeState.status === ResizeStatus.COMPUTED;
    const hasEmptyStegState = img && stegState && stegState.data.length === 0;
    const hasImgAndResizeState = img && resizeState;

    if (hasValidStegState && hasComputedResizeState) {
      return (
        <ImageContainer
          origSrc={img.src}
          src={arrToSrc(stegState.data, stegState.width, stegState.height)}
          imgType={"cover"}
          computingMsg={""}
          onUploadImage={this.loadImage.bind(this)}
          mode={mode}
        />
      );
    } else {
      if (hasEmptyStegState && hasComputedResizeState) {
        return (
          <ImageContainer
            origSrc={img.src}
            src={resizeState.sImg.src}
            imgType={"cover"}
            computingMsg={
              "Adjust the settings so that the hidden image data fits into the cover image!"
            }
            onUploadImage={this.loadImage.bind(this)}
            mode={mode}
          />
        );
      } else if (hasImgAndResizeState) {
        return (
          <ImageContainer
            origSrc={img.src}
            src={resizeState.sImg.src}
            imgType={"cover"}
            computingMsg={
              resizeState.status === ResizeStatus.CURRENTLY_COMPUTING
                ? "Computing Resize..."
                : getHiddenSize() !== 0
                ? "Computing Steg..."
                : "Waiting for hidden image upload..."
            }
            onUploadImage={this.loadImage.bind(this)}
            mode={mode}
          />
        );
      } else {
        return (
          <ImageContainer
            origSrc={""}
            src={""}
            imgType={"cover"}
            computingMsg={""}
            onUploadImage={this.loadImage.bind(this)}
            mode={mode}
          />
        );
      }
    }
  }

  makeDecodeImageView() {
    const { decodeImg } = this.state;
    const { mode, decodedImageSrc } = this.props;

    if (decodeImg && decodedImageSrc !== "") {
      return (
        <ImageContainer
          origSrc={"none"}
          src={decodeImg.src}
          imgType={"cover"}
          computingMsg={""}
          onUploadImage={this.loadImage.bind(this)}
          mode={mode}
        />
      );
    } else if (decodeImg) {
      return (
        <ImageContainer
          origSrc={"none"}
          src={decodeImg.src}
          imgType={"cover"}
          computingMsg={
            "Cover image not large enough to hold supposed hidden image bytes! Has the hidden image actually been encoded?"
          }
          onUploadImage={this.loadImage.bind(this)}
          mode={mode}
        />
      );
    } else {
      return (
        <ImageContainer
          origSrc={""}
          src={""}
          imgType={"cover"}
          computingMsg={""}
          onUploadImage={this.loadImage.bind(this)}
          mode={mode}
        />
      );
    }
  }

  render(): JSX.Element {
    const { maxLsb, mode } = this.props;
    const { img } = this.state;
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

    const mainImageView =
      mode === "encode" ? this.makeEncodeImageView() : this.makeDecodeImageView();

    return (
      <div>
        {mainImageView}
        <div className={`${styles.calc_container} ${mode === "encode" ? "" : styles.disabled}`}>
          <div className={styles.result_container}>
            <span
              className={
                `${canEncode ? styles.green : styles.red} ` +
                `${mode === "encode" ? "" : styles.disabled}`
              }
            >
              {getCoverSize().toLocaleString()} bytes{" "}
            </span>
            =
          </div>
          <p className={styles.calc}>
            <b>{w.toLocaleString()}</b> width * <b>{h.toLocaleString()}</b> height *{" "}
            <b>{maxLsb.toLocaleString()}</b> maximum bits encoded * <b>3</b> channels / <b>8</b>{" "}
            bit-per-byte
          </p>
        </div>
        <div className={styles.options_container}>
          <MaxLSBSlider
            value={maxLsb}
            onChange={this.onUpdateMaxLSB.bind(this)}
            onAuto={this.onAutoMaxLsb.bind(this)}
            disabled={img === null || mode !== "encode"}
          />
          <ResizeSlider
            imageType={"Cover"}
            value={scale}
            onChange={this.onUpdateScale.bind(this)}
            onAuto={this.onAutoScale.bind(this)}
            disabled={img === null || mode !== "encode"}
          />
        </div>
      </div>
    );
  }
}
