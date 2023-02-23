import * as React from "react";
import { getImageData, imageDataToPixels, loadImage } from "../image-functions";
import { FileInputField } from "./FileInputField";
import { SvdApproximation } from "../CanvasView/SvdApproximation";
import { SvdComputationManager } from "../ComputationManager/svdComputationManager";
import { ResizeComputationManager } from "../ComputationManager/resizeComputationManager";
import { SvdState, SvdStatus } from "../svdstate";
import { ResizeState, ResizeStatus } from "../resizestate";

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

interface HiddenImageState {
  placeholderImg: null | string;
  showSvs: boolean;
  error: string;
  resizeState: ResizeState;
  hoverToSeeOriginal: boolean;
  guessingPage: boolean;
  hover: boolean;
  warnSize: boolean;
  img: null | HTMLImageElement;
}

export interface HiddenImageProps {
  hiddenWidth: number;
  hiddenHeight: number;
  onUpdateHiddenDimensions: (hiddenWidth: number, hiddenHeight: number) => void;
  hiddenScale: number;
  onUpdateHiddenScale: (hiddenScale: number) => void;
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
      placeholderImg: firstImg.approxSrc,
      showSvs: false,
      error: "",
      resizeState: { status: ResizeStatus.CURRENTLY_COMPUTING },
      hoverToSeeOriginal: true,
      guessingPage: false,
      hover: false,
      warnSize: true,
      img: null,
    };
    this.props.onUpdateHiddenDimensions(firstImg.w, firstImg.h);
    this.props.onUpdateNumSvs(firstImg.h);

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

  componentDidMount(): void {
    window.ondragover = this.onDragOver.bind(this);
    this.loadImage(firstImg.src, firstImg.approxSrc);
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
      error: "",
    } as HiddenImageState);
    this.svdComputationManager.computeSvd(height, width, pxls, this.props.numSvs);
  }

  updateScaledImage(scale: number): void {
    const { width, height } = this.state.img as HTMLImageElement;
    const ImageData = getImageData(this.state.img as HTMLImageElement);

    if ((width * scale > 2000 || height * scale > 2000) && this.state.warnSize) {
      const msg = "Your image will be quite large. Computing the SVD may take a while. Continue?";
      if (!window.confirm(msg)) {
        this.props.onUpdateHiddenScale(this.props.hiddenScale)
        return;
      }
      this.setState({ warnSize: false });
    }

    this.props.onUpdateHiddenScale(scale);
      this.setState({
      resizeState: { status: ResizeStatus.CURRENTLY_COMPUTING },
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

  loadImage(url: string, placeholderImg: null | string = null): void {
    this.setState({ placeholderImg } as HiddenImageState);
    loadImage(url, this.initializeImage.bind(this));
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
      this.setState({ hover: true, error } as HiddenImageState);
    }
  }

  onDragLeave(): void {
    this.setState({ hover: false, error: "" } as HiddenImageState);
  }

  onDrop(evt: React.DragEvent<HTMLElement>): void {
    this.setState({ hover: false } as HiddenImageState);
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
      this.setState({ error } as HiddenImageState);
      return;
    }
    this.setState({ error: "" } as HiddenImageState);
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

  onUpdateSvs(numSvs: number): void {
    this.svdComputationManager.setRank(numSvs);
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

  clickShowSvs(evt: React.MouseEvent<HTMLElement>): void {
    evt.preventDefault();
    this.setState({ showSvs: !this.state.showSvs } as HiddenImageState);
  }

  clickHoverToSeeOriginal(evt: React.MouseEvent<HTMLElement>): void {
    evt.preventDefault();
    this.setState({ hoverToSeeOriginal: !this.state.hoverToSeeOriginal } as HiddenImageState);
  }

  render(): JSX.Element {
    const { numSvs } = this.props;
    const { img, resizeState, placeholderImg } = this.state;
    const { hiddenScale: scale, hiddenWidth: width, hiddenHeight: height } = this.props;
    const w = Math.trunc(width * scale);
    const h = Math.trunc(height * scale);

    let infoBar: null | string | JSX.Element = null;
    if (this.state.error) {
      infoBar = this.state.error;
    } else if (this.state.hover) {
      infoBar = "Drop now!";
    } else if (resizeState.status === ResizeStatus.CURRENTLY_COMPUTING) {
      infoBar = (
        <span>
          Computing Resize &nbsp;
          <img src="spinner.gif" width="16" height="16" />
        </span>
      );
    } else if (this.props.svdState.status === SvdStatus.CURRENTLY_COMPUTING) {
      infoBar = (
        <span>
          Computing SVD &nbsp;
          <img src="spinner.gif" width="16" height="16" />
        </span>
      );
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
    let maxSvs: number;
    if (
      this.props.svdState.status === SvdStatus.COMPUTED &&
      this.props.svdState.lowRankApproximation !== undefined &&
      resizeState.status === ResizeStatus.COMPUTED &&
      img
    ) {
      mainImageView = (
        <SvdApproximation
          ref={this.svdViewRef}
          lowRankApproximation={this.props.svdState.lowRankApproximation}
          width={w}
          height={h}
          img={img}
          hoverToSeeOriginal={this.state.hoverToSeeOriginal}
        />
      );
      maxSvs = this.props.svdState.singularValues.red.length;
    } else {
      // the SVDs have not been computed yet
      maxSvs = Math.min(img?.width as number, img?.height as number);
      if (resizeState.status === ResizeStatus.COMPUTED) {
        mainImageView = <img className="main-image" src={resizeState.sImg.src} />;
      } else if (img) {
        mainImageView = <img className="main-image" src={img.src} />;
      } else if (placeholderImg) {
        mainImageView = <img className="main-image" src={placeholderImg} />;
      }
    }

    const compressedSize = h * numSvs + numSvs + numSvs * w;
    const stats = (
      <div className="stats">
        <table>
          <tbody>
            <tr>
              <th className="label">Image size</th>
              <td>
                {w} &times; {h}
              </td>
            </tr>
            <tr>
              <th className="label">#pixels</th>
              <td>= {w * h}</td>
            </tr>
          </tbody>
        </table>
        <p>
          <span className="label">Uncompressed size</span>
          <br />
          proportional to number of pixels
        </p>
        <p>
          <span className="label">Compressed size</span>
          <br />
          approximately proportional to <br />
          {h}&thinsp;&times;&thinsp;{numSvs} + {numSvs} + {numSvs}&thinsp;&times;&thinsp;{w} <br />={" "}
          {compressedSize}
        </p>
        <p>
          <span className="label">Compression ratio</span>
          <br />
          {w * h} / {compressedSize} = {((w * h) / compressedSize).toFixed(2)}
        </p>
        <p>
          <a
            className={"button toggle-show-svs " + (this.state.showSvs ? "active" : "")}
            href=".#"
            onClick={this.clickShowSvs.bind(this)}
          >
            Show singular values
          </a>
        </p>
        <p className="hint">
          <a
            className={"toggle-hover-original " + (this.state.hoverToSeeOriginal ? "active" : "")}
            href=".#"
            onClick={this.clickHoverToSeeOriginal.bind(this)}
          >
            <span className="check-box">
              {this.state.hoverToSeeOriginal ? <span>☑</span> : <span>☐</span>}
            </span>
            <span className="text">hover to see the original picture</span>
          </a>
        </p>
      </div>
    );

    return (
      <div>
        {this.state.hover ? dropTarget : ""}
        <div className="image-container">
          <div className="main-image-container">{mainImageView ? mainImageView : ""}</div>
          {infoBar ? <p className="info-bar">{infoBar}</p> : ""}
          {stats}
        </div>
        <div className="wrapper">
          <div className="options">
            {/*<SingularValuesSlider*/}
            {/*  value={numSvs}*/}
            {/*  maxSvs={maxSvs}*/}
            {/*  onUpdate={this.onUpdateSvs.bind(this)}*/}
            {/*  max={Math.min(w, h)}*/}
            {/*/>*/}
          </div>
          <div className="options">
            {/*<ResizeSlider value={scale} onUpdate={this.onUpdateScale.bind(this)} />*/}
          </div>
          <button onClick={this.onAutoScale}>Auto Scale</button>
          <button onClick={this.onAutoNumSvs}>Auto NumSvs</button>
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
