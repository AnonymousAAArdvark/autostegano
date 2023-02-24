import * as React from "react";
import styles from "../Styles/Zoom.module.css";

interface ZoomState {
  backgroundImage: string;
  backgroundPosition: string;
  transformOrigin: string;
}

export interface ZoomProps {
  origSrc: string;
  src: string;
  imgType: string;
  onUpdateStatus: (status: string) => void;
}
export class Zoom extends React.Component<ZoomProps, ZoomState> {
  private resizeObserver: ResizeObserver;
  private figure: React.RefObject<any>;
  private resizeBox: React.RefObject<any>;

  constructor(props: ZoomProps) {
    super(props);
    this.figure = React.createRef();
    this.resizeBox = React.createRef();
    this.resizeObserver = new ResizeObserver(this.updateFigureSize);
    this.state = {
      backgroundImage: `url(${this.props.src})`,
      backgroundPosition: "0% 0%",
      transformOrigin: this.props.imgType === "hidden" ? "top left" : "top right",
    }
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
    const figureAspectRatio = this.figure.current.firstChild.offsetWidth / this.figure.current.firstChild.offsetHeight;
    const resizeBoxAspectRatio = resizeBox.offsetWidth / resizeBox.offsetHeight;

    if (figureAspectRatio < resizeBoxAspectRatio) {
      this.figure.current.style.width = 'auto';
      this.figure.current.style.height = '100%';
      this.figure.current.firstChild.style.width = 'auto';
      this.figure.current.firstChild.style.height = '100%';
    } else {
      this.figure.current.style.width = '100%';
      this.figure.current.style.height = 'auto';
      this.figure.current.firstChild.style.width = '100%';
      this.figure.current.firstChild.style.height = 'auto';
    }
  }

  handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width * 100;
    const y = (e.clientY - top) / height * 100;
    this.setState({ backgroundPosition: `${x}% ${y}%` });
  }

  handleMouseClick(e: React.MouseEvent<HTMLElement>) {
    if (this.state.backgroundImage === `url(${this.props.src})`) {
      this.setState({ backgroundImage: `url(${this.props.origSrc})`});
    } else {
      this.setState({ backgroundImage: `url(${this.props.src})`});
    }
    this.props.onUpdateStatus("click");
  }

  handleMouseEnter(e: React.MouseEvent<HTMLElement>) {
    this.props.onUpdateStatus("hover");
  }

  handleMouseLeave(e: React.MouseEvent<HTMLElement>) {
    this.setState({ backgroundImage: `url(${this.props.src})`});
    this.props.onUpdateStatus("leave");
  }

  render(): JSX.Element {
    const { imgType } = this.props;
    return (
      // <div className={styles.resize_box} ref={this.resizeBox}>
      <div ref={this.resizeBox} className={styles.image_container}>
      <figure
          onMouseMove={(e) => this.handleMouseMove(e)}
          onClick={(e) => this.handleMouseClick(e)}
          onMouseEnter={(e) => this.handleMouseEnter(e)}
          onMouseLeave={(e) => this.handleMouseLeave(e)}
          style={this.state}
          ref={this.figure}
          className={styles.figure}
        >
          <img src={this.props.src} onLoad={this.updateFigureSize} className={styles.img}/>
         </figure>
       </div>
    );
  }
}