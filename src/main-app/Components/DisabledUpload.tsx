import * as React from "react";
import { IoEllipsisHorizontalSharp } from "react-icons/io5";
import styles from "../Styles/DisabledUpload.module.css";

interface DisabledUploadState {

}

export interface DisabledUploadProps {

}

export class DisabledUpload extends React.Component<DisabledUploadProps, DisabledUploadState> {
  render(): JSX.Element {
    return (
      <div className={styles.disabled_upload_container}>
        <IoEllipsisHorizontalSharp className={styles.ellipsis_icon}/>
        <p className={styles.upload_text}>Waiting for cover image upload</p>
      </div>
    )
  }
}