import * as React from "react";
import Slider from "rc-slider";
import styles from "../../Styles/Slider.module.css";

interface ResizeSliderState {

}

export interface ResizeSliderProps {
  imageType: string,
  value: number,
  onChange: (value: number) => void;
}

export class ResizeSlider extends React.Component<ResizeSliderProps, ResizeSliderState> {
  constructor(props: ResizeSliderProps) {
    super(props);
  }

  toScale(index: number) {
    return Math.round((index > 17 ? ((index - 17) * .25 + 1) : (index * .05 + .15)) * 100) / 100;
  }

  toIndex(scale: number) {
    return scale > 1 ? ((scale - 1) / .25 + 17) : ((scale - .15) / .05);
  }

  onChange(value: number | number[]) {
    this.props.onChange(this.toScale(value as number));
  }

  generateMarks(n: number, min: number, max: number): { [key: number]: number } {
    const interval = (max - min) / (n);
    const marks: { [key: number]: number } = {};
    for (let i = 0; i <= n; i++) {
      const value = min + interval * i;
      marks[value] = this.toScale(value);
    }
    return marks;
  }

  render(): JSX.Element {
    const { imageType, value } = this.props;

    return (
      <div>
        <div className={styles.slider_label_container}>
          <p className={styles.slider_label}>{ imageType } Image Scale: { value }x</p>
          <button className={`${styles.auto_button}`}>Auto</button>
        </div>
        <Slider
          value={this.toIndex(value)}
          onChange={this.onChange.bind(this)}
          min={1}
          max={33}
          defaultValue={16}
          activeDotStyle={{ borderColor: "#0072da" }}
          marks={this.generateMarks(8, 1, 33)}
          className={styles.slider}
        />
      </div>
    );
  }
}