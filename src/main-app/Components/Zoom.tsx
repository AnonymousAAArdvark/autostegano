import * as React from "react";
import { SpinningCircles, TailSpin } from "react-loading-icons";
import styles from "../Styles/Zoom.module.css";
import windowResizeStyles from "../Styles/WindowResize.module.css";

interface ZoomState {
  backgroundImage: string;
  backgroundPosition: string;
  transformOrigin: string;
}

export interface ZoomProps {
  origSrc: string;
  src: string;
  imgType: string;
  computingMsg: string;
  onUpdateStatus: (status: string) => void;
  mode: string;
}
export class Zoom extends React.Component<ZoomProps, ZoomState> {
  private resizeObserver: ResizeObserver;
  private figure: React.RefObject<any>;
  private figureMobile: React.RefObject<any>;
  private resizeBox: React.RefObject<any>;
  private mobileShowOrig: boolean;

  constructor(props: ZoomProps) {
    super(props);
    this.figure = React.createRef();
    this.figureMobile = React.createRef();
    this.resizeBox = React.createRef();
    this.resizeObserver = new ResizeObserver(this.updateFigureSize);
    this.mobileShowOrig = false;
    this.state = {
      backgroundImage: `url(${this.props.src})`,
      backgroundPosition: "0% 0%",
      transformOrigin: this.props.imgType === "hidden" ? "top left" : "top right",
    };
  }

  componentDidMount() {
    this.resizeObserver = new ResizeObserver(this.updateFigureSize);
    this.resizeObserver.observe(this.resizeBox.current);
    this.updateFigureSize();
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();
  }

  updateFigureSize = () => {
    const resizeBox = this.figure.current.parentElement as HTMLElement;
    const figureAspectRatio =
      this.figure.current.firstChild.offsetWidth / this.figure.current.firstChild.offsetHeight;
    const figureMobileAspectRatio =
      this.figureMobile.current.firstChild.offsetWidth / this.figureMobile.current.firstChild.offsetHeight;
    const resizeBoxAspectRatio = resizeBox.offsetWidth / resizeBox.offsetHeight;

    if (figureAspectRatio < resizeBoxAspectRatio) {
      this.setAutoWidth(this.figure);
    } else {
      this.setAutoHeight(this.figure);
    }

    if (figureMobileAspectRatio < resizeBoxAspectRatio) {
      this.setAutoWidth(this.figureMobile);
    } else {
      this.setAutoHeight(this.figureMobile);
    }
  };

  setAutoWidth(figure: React.RefObject<any>) {
    figure.current.style.width = "auto";
    figure.current.style.height = "100%";
    figure.current.firstChild.style.width = "auto";
    figure.current.firstChild.style.height = "100%";
  }

  setAutoHeight(figure: React.RefObject<any>) {
    figure.current.style.width = "100%";
    figure.current.style.height = "auto";
    figure.current.firstChild.style.width = "100%";
    figure.current.firstChild.style.height = "auto";
  }

  handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (this.props.computingMsg === "") {
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      this.setState({ backgroundPosition: `${x}% ${y}%` });
    }
  }

  handleMouseClick(e: React.MouseEvent<HTMLElement>) {
    if (this.props.computingMsg === "" && this.props.mode === "encode") {
      if (this.state.backgroundImage === `url(${this.props.src})`) {
        this.setState({ backgroundImage: `url(${this.props.origSrc})` });
      } else {
        this.setState({ backgroundImage: `url(${this.props.src})` });
      }
      this.props.onUpdateStatus("click");
    }
  }

  handleMouseEnter(e: React.MouseEvent<HTMLElement>) {
    if (this.props.computingMsg === "") {
      this.setState({ backgroundImage: `url(${this.props.src})` });
      this.props.onUpdateStatus("hover");
    }
  }

  handleMouseLeave(e: React.MouseEvent<HTMLElement>) {
    if (this.props.computingMsg === "") {
      this.setState({ backgroundImage: `url(${this.props.src})` });
      this.props.onUpdateStatus("leave");
    }
  }

  handleTap(e: React.MouseEvent<HTMLElement>) {
    if (this.props.computingMsg === "" && this.props.mode === "encode") {
      if (!this.mobileShowOrig) {
        this.mobileShowOrig = true;
        this.setState({ backgroundImage: `url(${this.props.origSrc})` });
      } else {
        this.mobileShowOrig = false;
        this.setState({ backgroundImage: `url(${this.props.src})` });
      }
      this.props.onUpdateStatus("tap");
    }
  }

  render(): JSX.Element {
    const { computingMsg, mode } = this.props;
    let computingMsgElement: JSX.Element;

    if (computingMsg !== "") {
      computingMsgElement = (
        <div className={styles.computing_msg_container}>
          <TailSpin height={20} stroke={"#fbfbfb"} strokeWidth={3} className={styles.spinner}/>
          <p className={styles.computing_msg}>{computingMsg}</p>
        </div>
      );
    } else {
      computingMsgElement = <></>;
    }

    let figureContent = (
      <>
        <img
          src={this.props.src}
          onLoad={this.updateFigureSize}
          className={`${styles.img} ${this.mobileShowOrig ? styles.mobile_show_orig : ""}`}
        />
        {computingMsgElement}
      </>
    );

    return (
      <div ref={this.resizeBox} className={styles.image_container}>
        <figure
          onMouseMove={(e) => this.handleMouseMove(e)}
          onClick={(e) => this.handleMouseClick(e)}
          onMouseEnter={(e) => this.handleMouseEnter(e)}
          onMouseLeave={(e) => this.handleMouseLeave(e)}
          style={this.state}
          ref={this.figure}
          className={
            `${styles.figure} ` +
            `${computingMsg !== "" ? styles.figure_inactive : styles.figure_active} ` +
            `${mode === "encode" ? "" : styles.decode} ` +
            `${windowResizeStyles.desktop}`
          }
        >
          { figureContent }
        </figure>
        <figure
          onClick={(e) => this.handleTap(e)}
          style={this.state}
          ref={this.figureMobile}
          className={
            `${styles.figure} ` +
            `${computingMsg !== "" ? styles.figure_inactive : styles.figure_active} ` +
            `${mode === "encode" ? "" : styles.decode} ` +
            `${windowResizeStyles.mobile}`
          }
        >
          { figureContent }
        </figure>
      </div>
    );
  }
}
