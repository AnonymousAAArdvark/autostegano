import * as React from "react";
import styles from "../Styles/Zoom.module.css";

interface ZoomState {
  backgroundImage: string;
  backgroundPosition: string;
}

export interface ZoomProps {

}
export class Zoom extends React.Component<ZoomProps, ZoomState> {
  private src = 'example-images/mountains_sea.jpg';
  private srcOrig = 'example-images/mountains_sea_5svs.jpg';

  constructor(props: ZoomProps) {
    super(props);
    this.state = {
      backgroundImage: `url(${this.src})`,
      backgroundPosition: "0% 0%",
    }
  }

  handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width * 100;
    const y = (e.clientY - top) / height * 100;
    this.setState({ backgroundPosition: `${x}% ${y}%` });
  }

  handleMouseClick(e: React.MouseEvent<HTMLElement>) {
    if (this.state.backgroundImage === `url(${this.src})`) {
      this.setState({ backgroundImage: `url(${this.srcOrig})`});
    } else {
      this.setState({ backgroundImage: `url(${this.src})`});
    }
  }

  handleMouseLeave(e: React.MouseEvent<HTMLElement>) {
    this.setState({ backgroundImage: `url(${this.src})`});
  }

  render(): JSX.Element {
    return (
      <figure
        onMouseMove={(e) => this.handleMouseMove(e)}
        onClick={(e) => this.handleMouseClick(e)}
        onMouseLeave={(e) => this.handleMouseLeave(e)}
        style={this.state}
        className={styles.figure}
      >
        <img src={this.src} className={styles.img}/>
      </figure>
    );
  }
}