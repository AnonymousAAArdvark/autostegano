import * as React from "react";
import Slider from "rc-slider";
import styles from "../../Styles/Slider.module.css";

interface SingularValuesSliderState {}

export interface SingularValuesSliderProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  onAuto: () => void;
  disabled: boolean;
}

export class SingularValuesSlider extends React.Component<
  SingularValuesSliderProps,
  SingularValuesSliderState
> {
  constructor(props: SingularValuesSliderProps) {
    super(props);
  }

  toSvs(index: number) {
    return index > Math.floor((this.props.max * 3) / 4)
      ? index - Math.floor(this.props.max / 2)
      : index / 3;
  }

  toIndex(svs: number) {
    return svs > Math.floor(this.props.max / 4) ? svs + Math.floor(this.props.max / 2) : svs * 3;
  }

  onChange(value: number | number[]) {
    this.props.onChange(this.toSvs(value as number));
  }

  generateMarks(n: number, min: number, max: number): { [key: number]: number } {
    const interval = (max - min) / n;
    const marks: { [key: number]: number } = {};
    for (let i = 0; i <= n; i++) {
      const value = min + interval * i;
      marks[Math.ceil(value)] = Math.ceil(this.toSvs(value));
    }
    return marks;
  }

  render(): JSX.Element {
    const { value, max, onAuto, disabled } = this.props;

    return (
      <div>
        <div className={`${styles.slider_label_container} ${disabled ? styles.disabled : ""}`}>
          <p className={styles.slider_label}>Number of Singular Values: {Math.ceil(value)}</p>
          <button
            onClick={onAuto}
            disabled={disabled}
            className={`${styles.auto_button} ${disabled ? styles.button_disabled : styles.button_enabled}`}
          >
            Auto
          </button>
        </div>
        <div className={styles.slider_container}>
          <Slider
              value={this.toIndex(value)}
              onChange={this.onChange.bind(this)}
              min={1}
              max={this.toIndex(max)}
              defaultValue={this.toIndex(max)}
              activeDotStyle={{ borderColor: `${disabled ? "#cae0f4" : "#0072da"}` }}
              marks={this.generateMarks(8, 1, this.toIndex(max))}
              disabled={disabled}
              className={`${styles.slider} ${disabled ? styles.slider_disabled : styles.slider_enabled}`}
            />
        </div>
      </div>
    );
  }
}
