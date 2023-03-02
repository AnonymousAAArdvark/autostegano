import * as React from "react";
import { getImageData, imageDataToPixels, loadImage } from "../image-functions";
import { SvdComputationManager } from "../ComputationManager/svdComputationManager";
import { ResizeComputationManager } from "../ComputationManager/resizeComputationManager";
import { ImageContainer } from "./ImageContainer";
import { ResizeSlider } from "./Slider/ResizeSlider";
import { SingularValuesSlider } from "./Slider/SingularValuesSlider";
import { SvdState, SvdStatus } from "../svdstate";
import { ResizeState, ResizeStatus } from "../resizestate";
import { RGB } from "../rgb";
import styles from "../Styles/Image.module.css";

function RgbToSrc(
  rgbArray: RGB<[Uint8ClampedArray, Uint16Array, Uint16Array]>,
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const imageData = ctx.createImageData(width, height);

  const { red, green, blue } = rgbArray;
  let j = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const l = height * x + y;
      imageData.data[j] = red[0][l];
      imageData.data[j + 1] = green[0][l];
      imageData.data[j + 2] = blue[0][l];
      imageData.data[j + 3] = 255;
      j += 4;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL();
}

interface HiddenImageState {
  resizeState: null | ResizeState;
  warnSize: boolean;
  img: null | HTMLImageElement;
}

export interface HiddenImageProps {
  hiddenWidth: number;
  hiddenHeight: number;
  onUpdateHiddenDimensions: (hiddenWidth: number, hiddenHeight: number) => void;
  hiddenScale: number;
  onUpdateHiddenScale: (hiddenScale: number) => void;
  rawNumSvs: number;
  numSvs: number;
  onUpdateNumSvs: (numSvs: number) => void;
  autoHiddenScale: () => number;
  autoNumSvs: () => number;
  svdState: SvdState;
  onUpdateSvdState: (svdState: SvdState) => void;
  getCoverSize: () => number;
  getHiddenSize: () => number;
  decodedImageSrc: string;
  mode: string;
}

export class HiddenImage extends React.Component<HiddenImageProps, HiddenImageState> {
  private svdComputationManager: SvdComputationManager;
  private resizeComputationManager: ResizeComputationManager;

  constructor(props: HiddenImageProps) {
    super(props);
    this.state = {
      resizeState: null,
      warnSize: true,
      img: null,
    };

    this.svdComputationManager = new SvdComputationManager((svdInfo) => {
      this.props.onUpdateSvdState({ status: SvdStatus.COMPUTED, ...svdInfo });
    });

    this.resizeComputationManager = new ResizeComputationManager((url) => {
      this.updateScaledImageData(url);
    });

    this.svdComputationManager.setRank(this.props.numSvs);

    this.onAutoNumSvs = this.onAutoNumSvs.bind(this);
    this.onAutoScale = this.onAutoScale.bind(this);
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

    if (width > 2000 || height > 2000) {
      const msg = "Your image is quite large. Computing the SVD may take a while. Continue?";
      if (!window.confirm(msg)) {
        return;
      }
      this.setState({ warnSize: false });
    }

    const pxls = imageDataToPixels(imageData);
    this.props.onUpdateHiddenDimensions(width, height);
    this.props.onUpdateSvdState({ status: SvdStatus.CURRENTLY_COMPUTING });
    this.setState({
      resizeState: { status: ResizeStatus.COMPUTED, sImg: img },
      img,
    } as HiddenImageState);
    const numSvs = Math.min(img.width, img.height);
    this.onUpdateSvs(numSvs);
    this.svdComputationManager.computeSvd(height, width, pxls, numSvs);
  }

  updateScaledImage(scale: number): void {
    const { width, height } = this.state.img as HTMLImageElement;
    const ImageData = getImageData(this.state.img as HTMLImageElement);

    if ((width * scale > 2000 || height * scale > 2000) && this.state.warnSize) {
      const handle = document.getElementsByClassName("rc-slider-handle")[3];
      const mouseUpEvent = new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        button: 0,
      });
      handle.dispatchEvent(mouseUpEvent); // hacky
      const msg = "Your image will be quite large. Computing the SVD may take a while. Continue?";
      if (!window.confirm(msg)) {
        this.props.onUpdateHiddenScale(this.props.hiddenScale);
        return;
      }
      this.setState({ warnSize: false });
    }

    this.props.onUpdateHiddenScale(scale);
    this.setState({
      resizeState: { ...this.state.resizeState, status: ResizeStatus.CURRENTLY_COMPUTING },
    } as HiddenImageState);
    this.resizeComputationManager.computeResize(ImageData, scale);
  }

  updateScaledImageData(url: string): void {
    const resizedImageElement = new Image();
    resizedImageElement.src = url;

    resizedImageElement.onload = () => {
      const scaledImageData = getImageData(resizedImageElement);
      const resizedPixels = imageDataToPixels(scaledImageData);

      this.props.onUpdateSvdState({ status: SvdStatus.CURRENTLY_COMPUTING });
      if (this.props.numSvs > Math.min(scaledImageData.width, scaledImageData.height)) {
        this.props.onUpdateNumSvs(scaledImageData.height);
      }
      this.setState({
        resizeState: { status: ResizeStatus.COMPUTED, sImg: resizedImageElement },
      } as HiddenImageState);
      this.svdComputationManager.computeSvd(
        scaledImageData.height,
        scaledImageData.width,
        resizedPixels,
        this.props.numSvs,
      );
    };
  }

  loadImage(url: string): void {
    loadImage(url, this.initializeImage.bind(this));
  }

  onUpdateScale(scale: number): void {
    this.updateScaledImage(scale);
  }

  onUpdateSvs(numSvs: number): void {
    this.svdComputationManager.setRank(Math.ceil(numSvs));
    this.props.onUpdateNumSvs(numSvs);
  }

  onAutoScale(): void {
    this.updateScaledImage(this.props.autoHiddenScale());
  }

  onAutoNumSvs(): void {
    const numSvs = this.props.autoNumSvs();
    this.svdComputationManager.setRank(numSvs);
    this.props.onUpdateNumSvs(numSvs);
  }

  makeEncodeImageView(): JSX.Element {
    const { img, resizeState } = this.state;
    const { svdState, mode } = this.props;

    if (
      img &&
      svdState.status === SvdStatus.COMPUTED &&
      svdState.lowRankApproximation !== undefined &&
      resizeState
    ) {
      return (
        <ImageContainer
          origSrc={img.src}
          src={RgbToSrc(
            svdState.lowRankApproximation,
            resizeState.sImg.width,
            resizeState.sImg.height,
          )}
          imgType={"hidden"}
          computingMsg={""}
          onUploadImage={this.loadImage.bind(this)}
          mode={mode}
        />
      );
    } else if (img && resizeState) {
      return (
        <ImageContainer
          origSrc={img.src}
          src={resizeState.sImg.src}
          imgType={"hidden"}
          computingMsg={
            resizeState.status === ResizeStatus.CURRENTLY_COMPUTING
              ? "Computing Resize..."
              : "Computing SVD..."
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
          imgType={"hidden"}
          computingMsg={""}
          onUploadImage={this.loadImage.bind(this)}
          mode={mode}
        />
      );
    }
  }

  makeDecodeImageView(): JSX.Element {
    const { decodedImageSrc, mode } = this.props;
    if (decodedImageSrc !== "") {
      return (
        <ImageContainer
          origSrc={"empty"}
          src={decodedImageSrc}
          imgType={"hidden"}
          computingMsg={""}
          onUploadImage={this.loadImage.bind(this)}
          mode={mode}
        />
      )
    } else {
      return (
        <ImageContainer
          origSrc={"disabled"}
          src={""}
          imgType={"hidden"}
          computingMsg={""}
          onUploadImage={this.loadImage.bind(this)}
          mode={mode}
        />
      )
    }
  }

  render(): JSX.Element {
    const { numSvs, rawNumSvs, mode } = this.props;
    const { img } = this.state;
    const {
      hiddenScale: scale,
      hiddenWidth: width,
      hiddenHeight: height,
      getCoverSize,
      getHiddenSize,
    } = this.props;
    const canEncode = getCoverSize() >= getHiddenSize();
    const w = Math.trunc(width * scale);
    const h = Math.trunc(height * scale);

    let mainImageView = mode === "encode" ? this.makeEncodeImageView() : this.makeDecodeImageView();

    return (
      <div>
        {mainImageView}
        <div
          className={`${styles.calc_container} ${styles.left} ${mode === "encode" ? "" : styles.disabled}`}
        >
          <p className={styles.calc}>
            (<b>{w.toLocaleString()}</b> width + <b>{h.toLocaleString()}</b> height) *{" "}
            <b>{numSvs.toLocaleString()}</b> rank * <b>3</b> channels * <b>2</b> bytes-per-float32 +{" "}
            <b>{width ? 6 : 0}</b> bytes of metadata
          </p>
          <div className={styles.result_container}>
            =
            <span
              className={
                `${canEncode ? styles.green : styles.red} ` +
                `${mode === "encode" ? "" : styles.disabled}`
              }
            >
              {" "}
              {getHiddenSize().toLocaleString()} bytes
            </span>
          </div>
        </div>
        <div className={styles.options_container}>
          <SingularValuesSlider
            value={rawNumSvs}
            max={Math.min(w, h)}
            onChange={this.onUpdateSvs.bind(this)}
            onAuto={this.onAutoNumSvs.bind(this)}
            disabled={img === null || mode !== "encode"}
          />
          <ResizeSlider
            imageType={"Hidden"}
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
