import * as React from "react";
import Slider from "rc-slider";
import styles from "../../Styles/Slider.module.css";

interface MaxLSBSliderState {}

export interface MaxLSBSliderProps {
  value: number;
  onChange: (value: number) => void;
  onAuto: () => void;
  disabled: boolean;
}

export class MaxLSBSlider extends React.Component<MaxLSBSliderProps, MaxLSBSliderState> {
  constructor(props: MaxLSBSliderProps) {
    super(props);
  }

  onChange(value: number | number[]) {
    this.props.onChange(value as number);
  }

  render(): JSX.Element {
    const { value, onAuto, disabled } = this.props;

    return (
      <div>
        <div className={`${styles.slider_label_container} ${disabled ? styles.disabled : ""}`}>
          <p className={styles.slider_label}>Maximum Bits Encoded: {value}</p>
          <button
            onClick={onAuto.bind(this)}
            disabled={disabled}
            className={`${styles.auto_button} ${disabled ? styles.button_disabled : styles.button_enabled}`}
          >
            Auto
          </button>
        </div>
        <div className={styles.slider_container}>
          <Slider
            value={value}
            onChange={this.onChange.bind(this)}
            min={1}
            max={8}
            defaultValue={1}
            step={1}
            activeDotStyle={{ borderColor: `${disabled ? "#cae0f4" : "#0072da"}` }}
            marks={{ 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8 }}
            disabled={disabled}
            className={`${styles.slider} ${disabled ? styles.slider_disabled : styles.slider_enabled}`}
          />
        </div>
      </div>
    );
  }
}
