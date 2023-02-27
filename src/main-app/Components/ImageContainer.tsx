import * as React from "react";
import { Zoom } from "./Zoom";
import { DragDropUpload } from "./DragDropUpload";
import styles from "../Styles/ImageContainer.module.css";
import {StegView} from "../CanvasView/StegView";

interface ImageContainerState {
  tipStatus: string[];
}

export interface ImageContainerProps {
  origSrc: null | HTMLImageElement,
  src: string,
  imgType: string,
  computingMsg: string,
  onUploadImage: (src: string) => void;
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
    } else if (status === "hover") {
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
    const { src, origSrc, imgType, computingMsg, onUploadImage } = this.props;
    const { tipStatus } = this.state
    let image_top: JSX.Element;
    let main: JSX.Element;

    if (imgType === "hidden") {
      image_top = (
        <div className={styles.image_top}>
          <div className={styles.hover_container}>
            <p className={`${styles.hover_tip} ${styles.left} ${tipStatus[0]}`}>Hover to zoom in</p>
            <p className={`${styles.hover_tip} ${styles.left} ${tipStatus[1]}`}>Click to see original image</p>
            <p className={`${styles.hover_tip} ${styles.left} ${tipStatus[2]}`}>Click to see modified image</p>
          </div>
          <input
            ref={this.fileInput}
            type="file"
            id="hiddenImg"
            accept={"image/jpeg, image/png"}
            multiple={false}
            onChange={(e) => this.handleInputChange(e)}
            style={{display: "none"}}
          />
          <button onClick={this.handleClick.bind(this)} className={styles.upload_btn}>Upload Image</button>
        </div>
      );
    } else {
      image_top = (
        <div className={styles.image_top}>
          <input
            ref={this.fileInput}
            type="file"
            id="coverImg"
            accept={"image/jpeg, image/png"}
            multiple={false}
            onChange={(e) => this.handleInputChange(e)}
            style={{display: "none"}}
          />
          <button onClick={this.handleClick.bind(this)} className={styles.upload_btn}>Upload Image</button>
          <div className={styles.hover_container}>
            <p className={`${styles.hover_tip} ${styles.right} ${tipStatus[0]}`}>Hover to zoom in</p>
            <p className={`${styles.hover_tip} ${styles.right} ${tipStatus[1]}`}>Click to see original image</p>
            <p className={`${styles.hover_tip} ${styles.right} ${tipStatus[2]}`}>Click to see modified image</p>
          </div>
        </div>
      );
    }

    if (origSrc === null) {
      main = (
        <DragDropUpload imgType={imgType} onUploadImage={onUploadImage.bind(this)} />
      );
    } else {
      main = (
        <Zoom
          src={src}
          origSrc={origSrc.src}
          imgType={imgType}
          computingMsg={computingMsg}
          onUpdateStatus={this.onUpdateStatus.bind(this)}
        />
      );
    }

    return (
      <div>
        { image_top }
        { main }
      </div>
    );
  }
}