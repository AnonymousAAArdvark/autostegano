import * as React from "react";
import Navbar from "./Components/Navbar";
import { HiddenImage } from "./Components/HiddenImage";
import { CoverImage } from "./Components/CoverImage";
import { ImageContainer } from "./Components/ImageContainer";
import { SvdStatus, SvdState } from "./svdstate";
import Slider from "rc-slider";
import { MaxLSBSlider } from "./Components/Slider/MaxLSBSlider";
import { ResizeSlider } from "./Components/Slider/ResizeSlider";
import { SingularValuesSlider } from "./Components/Slider/SingularValuesSlider";
import { VscChevronRight } from "react-icons/vsc";
import styles from "./Styles/App.module.css";

interface AppState {
  hiddenWidth: number;
  hiddenHeight: number;
  coverWidth: number;
  coverHeight: number;
  hiddenScale: number;
  coverScale: number;
  rawNumSvs: number;
  numSvs: number;
  maxLsb: number;
  svdState: SvdState;
  decodedImageSrc: string;
  mode: string;
  coverDownloadStatus: string;
  hiddenDownloadStatus: string;
  downloadCoverImage: () => void;
  downloadHiddenImage: () => void;
}

type AppProps = Record<string, unknown>;

export class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      hiddenWidth: 0,
      hiddenHeight: 0,
      coverWidth: 0,
      coverHeight: 0,
      hiddenScale: 1,
      coverScale: 1,
      rawNumSvs: 0,
      numSvs: 0,
      maxLsb: 1,
      svdState: { status: SvdStatus.CURRENTLY_COMPUTING },
      decodedImageSrc: "",
      mode: "encode",
      coverDownloadStatus: "inactive",
      hiddenDownloadStatus: "inactive",
      downloadCoverImage: () => {},
      downloadHiddenImage: () => {},
    };
  }

  clamp(val: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, val));
  }

  onUpdateHiddenDimensions(hiddenWidth: number, hiddenHeight: number): void {
    this.setState({ hiddenWidth, hiddenHeight });
  }

  onUpdateCoverDimensions(coverWidth: number, coverHeight: number): void {
    this.setState({ coverWidth, coverHeight });
  }

  onUpdateHiddenScale(hiddenScale: number): void {
    this.setState({ hiddenScale });
  }

  onUpdateCoverScale(coverScale: number): void {
    this.setState({ coverScale });
  }

  onUpdateNumSvs(rawNumSvs: number): void {
    this.setState({ rawNumSvs, numSvs: Math.ceil(rawNumSvs) });
  }

  onUpdateSvdState(svdState: SvdState): void {
    this.setState({ svdState });
  }

  onUpdateMaxLsb(maxLsb: number): void {
    this.setState({ maxLsb });
  }

  getCoverSize(): number {
    const { coverWidth, coverHeight, coverScale, maxLsb } = this.state;
    return Math.trunc(
      Math.trunc(coverWidth * coverScale) * Math.trunc(coverHeight * coverScale) * 3 * maxLsb / 8);
  }

  getHiddenSize(): number {
    const { hiddenWidth, hiddenHeight, hiddenScale, numSvs } = this.state;
    return (
      Math.trunc((hiddenWidth + hiddenHeight) * hiddenScale) * numSvs * 3 * 2 +
      (hiddenWidth ? 6 : 0)
    );
  }

  autoHiddenScale(): number {
    const { numSvs, hiddenWidth, hiddenHeight, hiddenScale } = this.state;
    if (this.getCoverSize() === 0) {
      return hiddenScale;
    }
    let reqScale = (this.getCoverSize() - 6) / (3 * 2 * numSvs * (hiddenWidth + hiddenHeight));
    if (reqScale * Math.min(hiddenWidth, hiddenHeight) < numSvs) {
      reqScale = Math.sqrt(
        (this.getCoverSize() - 6) /
          (3 * 2 * Math.min(hiddenWidth, hiddenHeight) * (hiddenWidth + hiddenHeight)),
      );
    }
    if (reqScale < 1) {
      return this.clamp(Math.round(Math.floor(reqScale / 0.05) * 0.05 * 100) / 100, 0.2, 5);
    } else {
      return this.clamp(Math.round(Math.floor(reqScale / 0.25) * 0.25 * 100) / 100, 0.2, 5);
    }
  }

  autoCoverScale(): number {
    const { maxLsb, coverWidth, coverHeight, coverScale } = this.state;
    if (this.getHiddenSize() === 0) {
      return coverScale;
    }
    const reqScale = Math.sqrt(
      (this.getHiddenSize() * 8) / (coverWidth * coverHeight * 3 * maxLsb),
    );
    if (reqScale < 1) {
      return this.clamp(Math.round(Math.ceil(reqScale / 0.05) * 0.05 * 100) / 100, 0.2, 5);
    } else {
      return this.clamp(Math.round(Math.ceil(reqScale / 0.25) * 0.25 * 100) / 100, 0.2, 5);
    }
  }

  autoNumSvs(): number {
    const { hiddenScale, hiddenWidth, hiddenHeight, numSvs } = this.state;
    if (this.getCoverSize() === 0) {
      return numSvs;
    }
    const reqNumSvs =
      (this.getCoverSize() - 6) / (3 * 2 * hiddenScale * (hiddenWidth + hiddenHeight));
    return this.clamp(Math.floor(reqNumSvs), 1, Math.min(hiddenWidth, hiddenHeight));
  }

  autoMaxLsb(): number {
    const { coverScale, coverWidth, coverHeight, maxLsb } = this.state;
    if (this.getHiddenSize() === 0) {
      return maxLsb;
    }
    const reqMaxLsb =
      (this.getHiddenSize() * 8) / (coverWidth * coverScale * coverHeight * coverScale * 3);
    return this.clamp(Math.ceil(reqMaxLsb), 1, 8);
  }

  onUpdateDecodedImage(src: string): void {
    this.setState({ decodedImageSrc: src });
  }

  handleModeChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const mode = event.target.value;
    this.setState({ mode });
  }

  onUpdateCoverDownloadStatus(status: string) {
    this.setState({ coverDownloadStatus: status });
  }

  onUpdateHiddenDownloadStatus(status: string) {
    this.setState({ hiddenDownloadStatus: status });
  }

  onClickDownload() {
    if (this.state.mode === "encode" && this.state.coverDownloadStatus === "allow") {
      this.state.downloadCoverImage();
    } else if (this.state.mode === "decode" && this.state.hiddenDownloadStatus === "allow") {
      this.state.downloadHiddenImage();
    }
  }

  render(): JSX.Element {
    let allowDownload: boolean;
    if (this.state.mode === "encode") {
      allowDownload = this.state.coverDownloadStatus === "allow";
    } else {
      allowDownload = this.state.hiddenDownloadStatus === "allow";
    }

    return (
      <div>
        <Navbar />
        <div className={styles.header_container}>
          <div className={styles.section_label_container}>
            <h2 className={styles.section_label}>Hidden Image</h2>
          </div>
          <div className={styles.group_btn_container}>
            <div className={styles.group_btn}>
              <input
                type={"radio"}
                id={"encode"}
                name={"mode"}
                value={"encode"}
                checked={this.state.mode === "encode"}
                onChange={this.handleModeChange.bind(this)}
              />
              <label className={styles.mode_btn} htmlFor={"encode"}>
                Encode
              </label>
              <input
                type={"radio"}
                id={"decode"}
                name={"mode"}
                value={"decode"}
                checked={this.state.mode === "decode"}
                onChange={this.handleModeChange.bind(this)}
              />
              <label className={styles.mode_btn} htmlFor={"decode"}>
                Decode
              </label>
            </div>
          </div>
          <div className={styles.section_label_container}>
            <h2 className={styles.section_label}>Cover Image</h2>
          </div>
        </div>
        <div className={styles.main}>
          <div className={styles.hidden_image_container}>
            <HiddenImage
              hiddenWidth={this.state.hiddenWidth}
              hiddenHeight={this.state.hiddenHeight}
              onUpdateHiddenDimensions={this.onUpdateHiddenDimensions.bind(this)}
              hiddenScale={this.state.hiddenScale}
              onUpdateHiddenScale={this.onUpdateHiddenScale.bind(this)}
              rawNumSvs={this.state.rawNumSvs}
              numSvs={this.state.numSvs}
              onUpdateNumSvs={this.onUpdateNumSvs.bind(this)}
              autoHiddenScale={this.autoHiddenScale.bind(this)}
              autoNumSvs={this.autoNumSvs.bind(this)}
              svdState={this.state.svdState}
              onUpdateSvdState={this.onUpdateSvdState.bind(this)}
              getCoverSize={this.getCoverSize.bind(this)}
              getHiddenSize={this.getHiddenSize.bind(this)}
              decodedImageSrc={this.state.decodedImageSrc}
              mode={this.state.mode}
            />
          </div>
          <div className={styles.info_container}>
            <div
              className={`${styles.ratio_container} ${
                this.state.mode === "encode" ? "" : styles.disabled
              }`}
            >
              <h2 className={styles.top_ratio}>{this.getHiddenSize().toExponential(3)}</h2>
              <h2 className={styles.bottom_ratio}>{this.getCoverSize().toExponential(3)}</h2>
            </div>
            <VscChevronRight
              className={
                `${styles.status_arrow} ` +
                `${this.state.mode === "encode" ? "" : styles.rotate} ` +
                `${
                  this.getCoverSize() >= this.getHiddenSize() || this.state.mode !== "encode"
                    ? styles.green
                    : styles.red
                } `
              }
            />
          </div>
          <div className={styles.cover_image_container}>
            <CoverImage
              coverWidth={this.state.coverWidth}
              coverHeight={this.state.coverHeight}
              onUpdateCoverDimensions={this.onUpdateCoverDimensions.bind(this)}
              coverScale={this.state.coverScale}
              onUpdateCoverScale={this.onUpdateCoverScale.bind(this)}
              maxLsb={this.state.maxLsb}
              onUpdateMaxLsb={this.onUpdateMaxLsb.bind(this)}
              autoCoverScale={this.autoCoverScale.bind(this)}
              autoMaxLsb={this.autoMaxLsb.bind(this)}
              numSvs={this.state.numSvs}
              svdState={this.state.svdState}
              getCoverSize={this.getCoverSize.bind(this)}
              getHiddenSize={this.getHiddenSize.bind(this)}
              onUpdateCoverDownloadStatus={this.onUpdateCoverDownloadStatus.bind(this)}
              setDownloadCoverImage={(downloadCoverImage) => this.setState({ downloadCoverImage })}
              onUpdateHiddenDownloadStatus={this.onUpdateHiddenDownloadStatus.bind(this)}
              setDownloadHiddenImage={(downloadHiddenImage) => this.setState({ downloadHiddenImage })}
              onUpdateDecodedImage={this.onUpdateDecodedImage.bind(this)}
              decodedImageSrc={this.state.decodedImageSrc}
              mode={this.state.mode}
            />
          </div>
        </div>
        <div className={styles.download_container}>
          <button
            onClick={this.onClickDownload.bind(this)}
            className={`${styles.download_btn} ${
              allowDownload ? styles.download_allow : ""
            }`}
          >
            Download { this.state.mode === "encode" ? "Encoded Cover" : "Decoded Hidden"} Image
          </button>
        </div>
      </div>
    );
  }
}
