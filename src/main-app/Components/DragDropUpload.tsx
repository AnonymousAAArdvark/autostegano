import * as React from "react";
import { MdUpload } from "react-icons/md";
import styles from "../Styles/DragDropUpload.module.css";

interface DragDropUploadState {
  dragActive: boolean;
}

export interface DragDropUploadProps {
  imgType: string;
  onUploadImage: (src: string) => void;
}

export class DragDropUpload extends React.Component<DragDropUploadProps, DragDropUploadState> {
  constructor(props: DragDropUploadProps) {
    super(props);
    this.state = {
      dragActive: false,
    };
  }

  handleDrag(e: React.DragEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      this.setState({ dragActive: true });
    } else if (e.type === "dragleave") {
      this.setState({ dragActive: false });
    }
  }

  handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    this.setState( { dragActive: false });
    const imageTypes = ["image/png", "image/jpeg"];
    if (e.dataTransfer.files && e.dataTransfer.files[0] && imageTypes.includes(e.dataTransfer.files[0].type)) {
      this.props.onUploadImage(URL.createObjectURL(e.dataTransfer.files[0]));
    }
  }

  handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      this.props.onUploadImage(URL.createObjectURL(e.target.files[0]));
    }
  }

  render(): JSX.Element {
    const { dragActive } = this.state;
    const { imgType } = this.props;
    return (
      <form
        onDragEnter={(e) => this.handleDrag(e)}
        onSubmit={(e) => e.preventDefault()}
        className={styles.form_image_upload}
      >
        <input
          id={`input-${ imgType }-image-upload`}
          type={"file"}
          accept={"image/jpeg, image/png"}
          multiple={false}
          onChange={(e) => this.handleChange(e)}
          className={styles.input_image_upload}
        />
        <label
          htmlFor={`input-${ imgType }-image-upload`}
          className={`${styles.label_image_upload} ${dragActive ? styles.drag_active : ""}`}
        >
          <div>
            <MdUpload className={styles.upload_icon}/>
            <p className={styles.upload_text}>Drag and drop your image here,</p>
            <p className={styles.upload_text}>or click to upload</p>
            <p className={styles.upload_tip}>(only .png, .jpg, and .jpeg files allowed)</p>
          </div>
        </label>
        { dragActive &&
          <div
            onDragEnter={(e) => this.handleDrag(e)}
            onDragLeave={(e) => this.handleDrag(e)}
            onDragOver={(e) => this.handleDrag(e)}
            onDrop={(e) => this.handleDrop(e)}
            className={styles.drag_file_element}
          >
          </div>
        }
      </form>
    );
  }
}
