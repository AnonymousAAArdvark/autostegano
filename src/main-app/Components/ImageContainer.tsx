import * as React from "react";
import { Zoom } from "./Zoom";
import { DragDropUpload } from "./DragDropUpload";
import { DisabledUpload } from "./DisabledUpload";
import styles from "../Styles/ImageContainer.module.css";
import windowResizeStyles from "../Styles/WindowResize.module.css";

interface ImageContainerState {
  tipStatus: string[];
}

export interface ImageContainerProps {
  origSrc: string;
  src: string;
  imgType: string;
  computingMsg: string;
  onUploadImage: (src: string) => void;
  mode: string;
}

export class ImageContainer extends React.Component<ImageContainerProps, ImageContainerState> {
  private fileInput: React.RefObject<HTMLInputElement>;
  constructor(props: ImageContainerProps) {
    super(props);
    this.state = {
      tipStatus: [styles.active, styles.inactive, styles.inactive],
    };
    this.fileInput = React.createRef();
  }

  onUpdateStatus(status: string) {
    if (status === "click") {
      if (this.state.tipStatus[1] === styles.inactive) {
        this.setState({ tipStatus: [styles.inactive, styles.active, styles.inactive] });
      } else {
        this.setState({ tipStatus: [styles.inactive, styles.inactive, styles.active] });
      }
    } else if (status === "tap") {
      if (this.state.tipStatus[1] === styles.inactive) {
        this.setState({ tipStatus: [styles.inactive, styles.active, styles.inactive] });
      } else {
        this.setState( { tipStatus: [styles.active, styles.inactive, styles.inactive] });
      }
    } else if (status === "hover" && this.props.mode === "encode") {
      this.setState({ tipStatus: [styles.inactive, styles.active, styles.inactive] });
    } else {
      this.setState({ tipStatus: [styles.active, styles.inactive, styles.inactive] });
    }
  }

  handleClick() {
    if (this.fileInput.current) {
      this.fileInput.current.click();
    }
  }

  handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      this.props.onUploadImage(URL.createObjectURL(e.target.files[0]));
    }
  }

  render(): JSX.Element {
    const { src, origSrc, imgType, computingMsg, onUploadImage, mode } = this.props;
    const { tipStatus } = this.state;
    let image_top: JSX.Element;
    let main: JSX.Element;
    const hoverTipAlign = imgType === "hidden" ? styles.left : styles.right;
    const disableUploadButton = imgType === "hidden" && mode === "decode";

    const hoverTipContainer = (
      <div className={styles.hover_tip_container}>
        <p className={`${styles.hover_tip} ${hoverTipAlign} ${tipStatus[0]} ${windowResizeStyles.desktop}`}>
          Hover to zoom in
        </p>
        {mode === "encode" && (
          <>
            <p className={`${styles.hover_tip} ${hoverTipAlign} ${tipStatus[0]} ${windowResizeStyles.mobile}`}>
              Tap image to see original
            </p>
            <p className={`${styles.hover_tip} ${hoverTipAlign} ${tipStatus[1]} ${windowResizeStyles.mobile}`}>
              Tap image to see modified
            </p>
            <p className={`${styles.hover_tip} ${hoverTipAlign} ${tipStatus[1]} ${windowResizeStyles.desktop}`}>
              Click to see original image
            </p>
            <p className={`${styles.hover_tip} ${hoverTipAlign} ${tipStatus[2]} ${windowResizeStyles.desktop}`}>
              Click to see modified image
            </p>
          </>
        )}
      </div>
    );

    const uploadButton = (
      <div>
        <input
          ref={this.fileInput}
          type="file"
          id={`${imgType}Img`}
          accept={"image/jpeg, image/png"}
          multiple={false}
          onChange={(e) => this.handleInputChange(e)}
          style={{ display: "none" }}
        />
        <button
          onClick={this.handleClick.bind(this)}
          className={`${styles.upload_btn} ${
            disableUploadButton ? styles.disabled : styles.enabled
          }`}
          disabled={disableUploadButton}
        >
          Upload Image
        </button>
      </div>
    );

    if (imgType === "hidden") {
      image_top = (
        <div className={`${styles.image_top} ${styles.mobile_flip}`}>
          {hoverTipContainer}
          {uploadButton}
        </div>
      );
    } else {
      image_top = (
        <div className={styles.image_top}>
          {uploadButton}
          {hoverTipContainer}
        </div>
      );
    }

    if (origSrc === "") {
      main = <DragDropUpload imgType={imgType} onUploadImage={onUploadImage.bind(this)} />;
    } else if (origSrc === "disabled") {
      main = <DisabledUpload />;
    } else {
      main = (
        <Zoom
          src={src}
          origSrc={origSrc}
          imgType={imgType}
          computingMsg={computingMsg}
          onUpdateStatus={this.onUpdateStatus.bind(this)}
          mode={mode}
        />
      );
    }

    return (
      <div>
        {image_top}
        {main}
      </div>
    );
  }
}
