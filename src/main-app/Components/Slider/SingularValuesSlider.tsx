import * as React from "react";
import Slider from "rc-slider";
import styles from "../../Styles/Slider.module.css";

interface SingularValuesSliderState {

}

export interface SingularValuesSliderProps {
  value: number,
  max: number,
  onChange: (value: number) => void;
}

export class SingularValuesSlider extends React.Component<SingularValuesSliderProps, SingularValuesSliderState> {
  constructor(props: SingularValuesSliderProps) {
    super(props);
  }

  toSvs(index: number) {
    return index > Math.floor(this.props.max * 3 / 4) ? (index - Math.floor(this.props.max / 2)) : index / 3;
  }

  toIndex(svs: number) {
    return svs > Math.floor(this.props.max / 4) ? (svs + Math.floor(this.props.max / 2)) : (svs * 3);
  }

  onChange(value: number | number[]) {
    this.props.onChange(this.toSvs(value as number));
  }

  generateMarks(n: number, min: number, max: number): { [key: number]: number } {
    const interval = (max - min) / (n);
    const marks: { [key: number]: number } = {};
    for (let i = 0; i <= n; i++) {
      const value = min + interval * i;
      marks[Math.ceil(value)] = Math.ceil(this.toSvs(value));
    }
    return marks;
  }

  render(): JSX.Element {
    const { value, max } = this.props;

    return (
      <div>
        <div className={styles.slider_label_container}>
          <p className={styles.slider_label}>Number of Singular Values: { Math.ceil(value) }</p>
          <button className={`${styles.auto_button}`}>Auto</button>
        </div>
        <Slider
          value={this.toIndex(value)}
          onChange={this.onChange.bind(this)}
          min={1}
          max={this.toIndex(max)}
          defaultValue={this.toIndex(max)}
          activeDotStyle={{ borderColor: "#0072da" }}
          marks={this.generateMarks(8, 1, this.toIndex(max))}
          className={styles.slider}
        />
      </div>
    );
  }
}