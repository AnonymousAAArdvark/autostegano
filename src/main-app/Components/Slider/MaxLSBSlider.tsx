import * as React from "react";
import Slider from "rc-slider";
import styles from "../../Styles/Slider.module.css";

interface MaxLSBSliderState {

}

export interface MaxLSBSliderProps {
  value: number,
  onChange: (value: number) => void;
  onAuto: () => number;
}

export class MaxLSBSlider extends React.Component<MaxLSBSliderProps, MaxLSBSliderState> {
  constructor(props: MaxLSBSliderProps) {
    super(props);
  }

  onChange(value: number | number[]) {
    this.props.onChange(value as number)
  }

  render(): JSX.Element {
    const { value, onChange } = this.props;

    return (
      <div>
        <div className={styles.slider_label_container}>
          <p className={styles.slider_label}>Maximum Bits Encoded: { value }</p>
          <button className={`${styles.auto_button}`}>Auto</button>
        </div>
        <Slider
          value={value}
          onChange={this.onChange.bind(this)}
          min={1}
          max={8}
          defaultValue={1}
          step={1}
          activeDotStyle={{ borderColor: "#0072da" }}
          marks={{ 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8 }}
          className={styles.slider}
        />
      </div>
    );
  }
}