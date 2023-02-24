import * as React from "react";
import { Zoom } from "./Zoom";
import styles from "../Styles/ImageContainer.module.css";

interface ImageContainerState {
  tipStatus: string[];
}

export interface ImageContainerProps {
  origSrc: string,
  src: string,
  imgType: string,
}

export class ImageContainer extends React.Component<ImageContainerProps, ImageContainerState> {
  constructor(props: ImageContainerProps) {
    super(props);
    this.state = {
      tipStatus: [styles.active, styles.inactive, styles.inactive],
    };
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

  render(): JSX.Element {
    const { src, origSrc, imgType } = this.props;
    const { tipStatus } = this.state
    let image_top: JSX.Element;

    if (imgType === "hidden") {
      image_top = (
        <div className={styles.image_top}>
          <div className={styles.hover_container}>
            <p className={`${styles.hover_tip} ${styles.left} ${tipStatus[0]}`}>Hover to zoom in</p>
            <p className={`${styles.hover_tip} ${styles.left} ${tipStatus[1]}`}>Click to see original image</p>
            <p className={`${styles.hover_tip} ${styles.left} ${tipStatus[2]}`}>Click to see modified image</p>
          </div>
          <input type="file" id="hiddenImg" style={{display: "none"}}/>
          <button className={styles.upload_btn}>Upload Image</button>
        </div>
      );
    } else {
      image_top = (
        <div className={styles.image_top}>
          <button className={styles.upload_btn}>Upload Image</button>
          <div className={styles.hover_container}>
            <p className={`${styles.hover_tip} ${styles.right} ${tipStatus[0]}`}>Hover to zoom in</p>
            <p className={`${styles.hover_tip} ${styles.right} ${tipStatus[1]}`}>Click to see original image</p>
            <p className={`${styles.hover_tip} ${styles.right} ${tipStatus[2]}`}>Click to see modified image</p>
          </div>
          <input type="file" id="hiddenImg" style={{display: "none"}}/>
        </div>
      );
    }

    return (
      <div>
        { image_top }
        <Zoom
          src={src}
          origSrc={origSrc}
          imgType={imgType}
          onUpdateStatus={this.onUpdateStatus.bind(this)}
        />
      </div>
    );
  }
}