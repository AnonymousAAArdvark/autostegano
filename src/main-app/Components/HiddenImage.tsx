import * as React from "react";
import { getImageData, imageDataToPixels, loadImage } from "../image-functions";
import { SvdApproximation } from "../CanvasView/SvdApproximation";
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
}

export class HiddenImage extends React.Component<HiddenImageProps, HiddenImageState> {
  private svdViewRef: React.RefObject<SvdApproximation>;
  private svdComputationManager: SvdComputationManager;
  private resizeComputationManager: ResizeComputationManager;

  constructor(props: HiddenImageProps) {
    super(props);
    this.state = {
      resizeState: null,
      warnSize: true,
      img: null,
    };

    this.svdViewRef = React.createRef();
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

  render(): JSX.Element {
    const { numSvs, rawNumSvs, autoNumSvs, autoHiddenScale } = this.props;
    const { img, resizeState } = this.state;
    const { hiddenScale: scale, hiddenWidth: width, hiddenHeight: height, svdState } = this.props;
    const w = Math.trunc(width * scale);
    const h = Math.trunc(height * scale);

    let mainImageView: JSX.Element;
    if (
      img &&
      svdState.status === SvdStatus.COMPUTED &&
      svdState.lowRankApproximation !== undefined &&
      resizeState
    ) {
      mainImageView = (
        <ImageContainer
          origSrc={img}
          src={RgbToSrc(
            svdState.lowRankApproximation,
            resizeState.sImg.width,
            resizeState.sImg.height,
          )}
          imgType={"hidden"}
          computingMsg={""}
          onUploadImage={this.loadImage.bind(this)}
        />
      );
    } else if (img && resizeState) {
      mainImageView = (
        <ImageContainer
          origSrc={img}
          src={resizeState.sImg.src}
          imgType={"hidden"}
          computingMsg={
            resizeState.status === ResizeStatus.CURRENTLY_COMPUTING
              ? "Computing Resize..."
              : "Computing SVD..."
          }
          onUploadImage={this.loadImage.bind(this)}
        />
      );
    } else {
      mainImageView = (
        <ImageContainer
          origSrc={null}
          src={""}
          imgType={"hidden"}
          computingMsg={""}
          onUploadImage={this.loadImage.bind(this)}
        />
      );
    }

    return (
      <div>
        { mainImageView }
        <div className={`${styles.calc_container} ${styles.calc_container_left}`}>
          <p className={styles.calc}>
            [{w}(width) + {h}(height)] * {numSvs}(rank) * 3(channels) * 2(bytes/float32) + 6(bytes
            of metadata) =
            <span className={styles.calc_result}> {(w + h) * numSvs * 3 * 2 + 6} bytes</span>
          </p>
        </div>
        <div className={styles.options_container}>
          <SingularValuesSlider
            value={rawNumSvs}
            max={Math.min(w, h)}
            onChange={this.onUpdateSvs.bind(this)}
            onAuto={this.onAutoNumSvs.bind(this)}
          />
          <ResizeSlider
            imageType={"Hidden"}
            value={scale}
            onChange={this.onUpdateScale.bind(this)}
            onAuto={this.onAutoScale.bind(this)}
          />
        </div>
      </div>
    );
  }
}
