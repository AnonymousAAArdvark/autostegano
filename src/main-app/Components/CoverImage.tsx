import * as React from "react";
import { getImageData, loadImage } from "../image-functions";
import { FileInputField } from "./FileInputField";
import { StegView } from "../CanvasView/StegView";
import { StegComputationManager, StegInfo } from "../ComputationManager/stegComputationManager";
import { MaxLSBSlider } from "./Slider/MaxLSBSlider";
import { ResizeSlider } from "./Slider/ResizeSlider";
import { SvdState, SvdStatus } from "../svdstate";
import { ResizeState, ResizeStatus } from "../resizestate";
import { rgbMap } from "../rgb";
import { ResizeComputationManager } from "../ComputationManager/resizeComputationManager";

const firstImg = {
  w: 600,
  h: 402,
  src: "example-images/mountains_sea.jpg",
  approxSrc: "example-images/mountains_sea_5svs.jpg",
};

type Indexable<V> = {
  [key: number]: V;
  length: number;
};

function contains<V, L extends Indexable<V>>(list: L, el: V): boolean {
  for (let i = 0; i < list.length; i++) {
    if (list[i] === el) {
      return true;
    }
  }
  return false;
}

interface CoverImageState {
  placeholderImg: null | string;
  error: string;
  resizeState: ResizeState;
  hoverToSeeOriginal: boolean;
  guessingPage: boolean;
  hover: boolean;
  warnSize: boolean;
  img: null | HTMLImageElement;
  stegState: null | StegInfo;
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
}

export class CoverImage extends React.Component<CoverImageProps, CoverImageState> {
  private stegViewRef: React.RefObject<StegView>;
  private stegComputationManager: StegComputationManager;
  private resizeComputationManager: ResizeComputationManager;

  constructor(props: CoverImageProps) {
    super(props);
    this.state = {
      placeholderImg: firstImg.approxSrc,
      error: "",
      resizeState: { status: ResizeStatus.CURRENTLY_COMPUTING },
      hoverToSeeOriginal: true,
      guessingPage: false,
      hover: false,
      warnSize: true,
      img: null,
      stegState: null,
    };
    this.props.onUpdateMaxLsb(4);
    this.props.onUpdateCoverDimensions(firstImg.w, firstImg.h);

    this.stegViewRef = React.createRef();
    this.stegComputationManager = new StegComputationManager((stegResult) => {
      this.setState({ stegState: stegResult });
      if (stegResult.mode == "encdode") {
        this.stegComputationManager.computeDecode(
          new ImageData(stegResult.data, stegResult.width, stegResult.height),
        );
      }
    });

    this.resizeComputationManager = new ResizeComputationManager((url) => {
      this.updateScaledImageData(url);
    });

    this.onAutoScale = this.onAutoScale.bind(this);
    this.onAutoMaxLsb = this.onAutoMaxLsb.bind(this);
  }

  componentDidMount(): void {
    window.ondragover = this.onDragOver.bind(this);
    this.loadImage(firstImg.src, firstImg.approxSrc);
  }

  componentDidUpdate(prevProps: CoverImageProps): void {
    if (
      prevProps.svdState !== this.props.svdState &&
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

    this.props.onUpdateCoverDimensions(width, height);
    this.setState({
      resizeState: { status: ResizeStatus.COMPUTED, sImg: img },
      img,
      error: "",
    } as CoverImageState);
    this.computeEncode(imageData, this.props.maxLsb);
  }

  updateScaledImage(scale: number): void {
    const { width, height } = this.state.img as HTMLImageElement;
    const ImageData = getImageData(this.state.img as HTMLImageElement);

    if ((width * scale > 4000 || height * scale > 4000) && this.state.warnSize) {
      const msg = "Your image will be quite large. Computing the SVD may take a while. Continue?";
      if (!window.confirm(msg)) {
        this.props.onUpdateCoverScale(this.props.coverScale);
        return;
      }
      this.setState({ warnSize: false });
    }

    this.props.onUpdateCoverScale(scale);
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

  loadImage(url: string, placeholderImg: null | string = null): void {
    this.setState({ placeholderImg } as CoverImageState);
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

  onDragOver(evt: React.DragEvent<HTMLElement> | DragEvent): void {
    // without this, the drop event would not fire on the element!
    evt.preventDefault();

    if (!this.state.hover && evt.dataTransfer !== null) {
      const types = evt.dataTransfer.types;
      const error =
        contains(types, "text/uri-list") || contains(types, "Files")
          ? ""
          : "The dragged object is not an image!";
      this.setState({ hover: true, error } as CoverImageState);
    }
  }

  onDragLeave(): void {
    this.setState({ hover: false, error: "" } as CoverImageState);
  }

  onDrop(evt: React.DragEvent<HTMLElement>): void {
    this.setState({ hover: false } as CoverImageState);
    evt.preventDefault();

    const files = evt.dataTransfer.files;
    if (files && files.length > 0) {
      this.onFileChosen(files[0]);
    } else if (contains(evt.dataTransfer.types, "text/uri-list")) {
      this.loadImage(evt.dataTransfer.getData("text/uri-list"));
    }
  }

  onFileChosen(file: File): void {
    if (!file.type.match(/^image\/.*/)) {
      const error = "The chosen file is not an image! Try another file ...";
      this.setState({ error } as CoverImageState);
      return;
    }
    this.setState({ error: "" } as CoverImageState);
    const reader = new FileReader();
    reader.onload = (evt: Event): void => {
      const target = evt.target as EventTarget & { result: string };
      this.loadImage(target.result);
    };
    reader.readAsDataURL(file);
  }

  onUpdateScale(scale: number): void {
    this.updateScaledImage(scale);
  }

  onUpdateMaxLSB(maxLsb: number): void {
    if (this.state.resizeState.status === ResizeStatus.COMPUTED) {
      const scaledImageData = getImageData(this.state.resizeState.sImg as HTMLImageElement);
      this.computeEncode(scaledImageData, maxLsb);
    }
    this.props.onUpdateMaxLsb(maxLsb)
  }

  onAutoScale(): void {
    this.updateScaledImage(this.props.autoCoverScale());
  }

  onAutoMaxLsb(): void {
    const maxLsb = this.props.autoMaxLsb();
    if (this.state.resizeState.status === ResizeStatus.COMPUTED) {
      const scaledImageData = getImageData(this.state.resizeState.sImg as HTMLImageElement);
      this.computeEncode(scaledImageData, maxLsb);
    }
    this.props.onUpdateMaxLsb(maxLsb)
  }

  render(): JSX.Element {
    const { img, resizeState, placeholderImg } = this.state;
    const { coverScale: scale, coverWidth: width, coverHeight: height, maxLsb } = this.props;
    const w = Math.trunc(width * scale);
    const h = Math.trunc(height * scale);

    let infoBar: null | string | JSX.Element = null;
    if (this.state.error) {
      infoBar = this.state.error;
    } else if (this.state.hover) {
      infoBar = "Drop now!";
    }

    const dropTarget = (
      <div
        className={"drop-target " + (this.state.error ? "" : "active")}
        onDragOver={this.onDragOver.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}
        onDrop={this.onDrop.bind(this)}
      />
    );

    let mainImageView: null | React.Component | JSX.Element = null;
    if (this.state.stegState && resizeState.status === ResizeStatus.COMPUTED && img) {
      mainImageView = (
        <StegView
          ref={this.stegViewRef}
          stegResult={this.state.stegState.data}
          width={w}
          height={h}
          img={img}
          hoverToSeeOriginal={this.state.hoverToSeeOriginal}
        />
      );
    } else {
      // the SVDs have not been computed yet
      if (placeholderImg) {
        mainImageView = <img src={placeholderImg} />;
      } else if (resizeState.status === ResizeStatus.COMPUTED) {
        mainImageView = <img src={resizeState.sImg.src} />;
      } else if (img) {
        mainImageView = <img src={img.src} />;
      }
    }

    return (
      <div>
        {this.state.hover ? dropTarget : ""}
        <div className="image-container">
          <div className="main-image-container">{mainImageView ? mainImageView : ""}</div>
          {infoBar ? <p className="info-bar">{infoBar}</p> : ""}
        </div>
        <div className="wrapper">
          <div className="options">
            <MaxLSBSlider value={maxLsb} onChange={this.onUpdateMaxLSB.bind(this)} />
          </div>
          <div className="options">
            <ResizeSlider imageType={"Cover"} value={scale} onChange={this.onUpdateScale.bind(this)} />
          </div>
          <button onClick={this.onAutoScale}>Auto Scale</button>
          <button onClick={this.onAutoMaxLsb}>Auto MaxLsb</button>
          <p>
            {"Change the number of singular values using the slider. Click on one of these images to compress it:"}
          </p>
          <p>
            <span className="valign">You can compress your own images by using the</span>
            <FileInputField onChange={this.onFileChosen.bind(this)} label="file picker" />
            <span className="valign">or by dropping them on this page.</span>
          </p>
        </div>
      </div>
    );
  }
}
