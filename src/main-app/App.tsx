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
import { VscChevronRight } from "react-icons/vsc"
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
  mode: string;
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
      mode: "encode",
    };
  }

  clamp(val: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, val));
  }

  onUpdateHiddenDimensions(hiddenWidth: number, hiddenHeight: number): void {
    this.setState( { hiddenWidth, hiddenHeight });
  }

  onUpdateCoverDimensions(coverWidth: number, coverHeight: number): void {
    this.setState( { coverWidth, coverHeight });
  }

  onUpdateHiddenScale(hiddenScale: number): void {
    this.setState( {hiddenScale });
  }

  onUpdateCoverScale(coverScale: number): void {
    this.setState( {coverScale });
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
    return Math.trunc(coverWidth * coverScale)
      * Math.trunc(coverHeight * coverScale) * 3 * maxLsb / 8;
  }

  getHiddenSize(): number {
    const { hiddenWidth, hiddenHeight, hiddenScale, numSvs } = this.state;
    return (Math.trunc(hiddenWidth * hiddenScale)
      + Math.trunc(hiddenHeight * hiddenScale))
      * numSvs * 3 * 2 + 48;
  }

  autoHiddenScale(): number {
    const { numSvs, hiddenWidth, hiddenHeight } = this.state;
    let reqScale = (this.getCoverSize() - 48) / (3 * 2 * numSvs * (hiddenWidth + hiddenHeight));
    if (reqScale * Math.min(hiddenWidth, hiddenHeight) < numSvs) {
      reqScale = Math.sqrt((this.getCoverSize() - 48) / (3 * 2 * Math.min(hiddenWidth, hiddenHeight) * (hiddenWidth + hiddenHeight)));
    }
    if (reqScale < 1) {
      return this.clamp(Math.floor(reqScale / .05) * .05, .2, 5);
    } else {
      return this.clamp(Math.floor(reqScale / .25) * .25, .2, 5);
    }
  }

  autoCoverScale(): number {
    const { maxLsb, coverWidth, coverHeight } = this.state
    const reqScale = Math.sqrt(this.getHiddenSize() * 8 / (coverWidth * coverHeight * 3 * maxLsb));
    if (reqScale < 1) {
      return this.clamp(Math.ceil(reqScale / .05) * .05, .2, 5);
    } else {
      return this.clamp(Math.ceil(reqScale / .25) * .25, .2, 5);
    }
  }

  autoNumSvs(): number {
    const { hiddenScale, hiddenWidth, hiddenHeight } = this.state;
    const reqNumSvs = (this.getCoverSize() - 48) / (3 * 2 * hiddenScale * (hiddenWidth + hiddenHeight));
    return this.clamp(Math.floor(reqNumSvs), 1, Math.min(hiddenWidth, hiddenHeight));
  }

  autoMaxLsb(): number {
    const { coverScale, coverWidth, coverHeight } = this.state
    const reqMaxLsb = this.getHiddenSize() * 8 / (coverWidth * coverScale * coverHeight * coverScale * 3);
    return this.clamp(Math.ceil(reqMaxLsb), 1, 8);
  }

  handleModeChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const mode = event.target.value;
    this.setState({ mode });
  }

  render(): JSX.Element {
    const { maxLsb, numSvs, hiddenScale, coverScale } = this.state;

    return (
      <div>
        {/*<Navbar/>*/}
        {/*<div className={styles.header_container}>*/}
        {/*  <div className={styles.section_label_container}>*/}
        {/*    <h2 className={styles.section_label}>Hidden Image</h2>*/}
        {/*  </div>*/}
        {/*  <div className={styles.group_btn_container}>*/}
        {/*    <div className={styles.group_btn}>*/}
        {/*      <input type={"radio"} id={"encode"} name={"mode"} value={"encode"} checked={this.state.mode === "encode"} onChange={this.handleModeChange.bind(this)}/>*/}
        {/*      <label className={styles.mode_btn} htmlFor={"encode"}>Encode</label>*/}
        {/*      <input type={"radio"} id={"decode"} name={"mode"} value={"decode"} checked={this.state.mode === "decode"} onChange={this.handleModeChange.bind(this)}/>*/}
        {/*      <label className={styles.mode_btn} htmlFor={"decode"}>Decode</label>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*  <div className={styles.section_label_container}>*/}
        {/*    <h2 className={styles.section_label}>Cover Image</h2>*/}
        {/*  </div>*/}
        {/*</div>*/}
        {/*<div className={styles.main}>*/}
        {/*  <div className={styles.hidden_image_container}>*/}
        {/*    <ImageContainer*/}
        {/*      src={"example-images/hidden-image.jpg"}*/}
        {/*      origSrc={"example-images/mountains_sea_5svs.jpg"}*/}
        {/*      imgType={"hidden"}*/}
        {/*      computingMsg={"Computing Resize..."}*/}
        {/*    />*/}
        {/*    <div className={`${styles.calc_container} ${styles.calc_container_left}`}>*/}
        {/*      <p className={styles.calc}>643(width) * 439(height) * 3(channels) =*/}
        {/*        <span className={styles.calc_result}> 29455 bits</span>*/}
        {/*      </p>*/}
        {/*    </div>*/}
        {/*    <div className={styles.options_container}>*/}
        {/*      <SingularValuesSlider value={numSvs} max={500} onChange={this.onUpdateNumSvs.bind(this)} />*/}
        {/*      <ResizeSlider imageType={"Hidden"} value={hiddenScale} onChange={this.onUpdateHiddenScale.bind(this)} />*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*  <div className={styles.info_container}>*/}
        {/*    <div className={styles.ratio_container}>*/}
        {/*      <h2 className={styles.top_ratio}>12,344</h2>*/}
        {/*      <h2 className={styles.bottom_ratio}>32,445</h2>*/}
        {/*    </div>*/}
        {/*    <VscChevronRight className={`${styles.status_arrow} ${this.state.mode === "encode" ? "" : styles.rotate}`}/>*/}
        {/*  </div>*/}
        {/*  <div className={styles.cover_image_container}>*/}
        {/*    <ImageContainer*/}
        {/*      src={"example-images/mountains_sea.jpg"}*/}
        {/*      origSrc={"example-images/mountains_sea_5svs.jpg"}*/}
        {/*      imgType={"cover"}*/}
        {/*      computingMsg={"Computing Resize..."}*/}
        {/*    />*/}
        {/*    <div className={`${styles.calc_container}`}>*/}
        {/*      <p className={styles.calc}>*/}
        {/*        <span className={styles.calc_result}>29455 bits </span>*/}
        {/*        = 643(width) * 439(height) * 3(channels)*/}
        {/*      </p>*/}
        {/*    </div>*/}
        {/*    <div className={styles.options_container}>*/}
        {/*      <MaxLSBSlider value={maxLsb} onChange={this.onUpdateMaxLsb.bind(this)}/>*/}
        {/*      <ResizeSlider imageType={"Cover"} value={coverScale} onChange={this.onUpdateCoverScale.bind(this)} />*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
        {/*<div className={styles.download_container}>*/}
        {/*  <button className={styles.download_btn}>Download Encoded Cover Image</button>*/}
        {/*</div>*/}
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
          />
        </div>
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
        />
      </div>
    );
  }
}
