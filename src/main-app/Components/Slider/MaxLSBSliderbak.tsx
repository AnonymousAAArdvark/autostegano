// import * as React from "react";
// import * as noUiSlider from "nouislider";
//
// export interface MaxLSBSliderProps {
//   value: number;
//   onUpdate: (maxLsb: number) => void;
// }
//
// export class MaxLSBSlider extends React.Component<MaxLSBSliderProps> {
//   private sliderElRef: React.RefObject<HTMLDivElement>;
//   constructor(props: MaxLSBSliderProps) {
//     super(props);
//     this.sliderElRef = React.createRef();
//   }
//   render(): JSX.Element {
//     return <div ref={this.sliderElRef} className="slider" />;
//   }
//   private getNoUiSlider(): noUiSlider.noUiSlider | undefined {
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     const instance = (this.sliderElRef.current! as HTMLElement) as noUiSlider.Instance;
//     return instance.noUiSlider;
//   }
//   componentDidUpdate(prevProps: MaxLSBSliderProps): void {
//     const slider = this.getNoUiSlider();
//     if (!slider) {
//       return;
//     }
//     if (this.props.value !== MaxLSBSlider.getSliderValue(slider)) {
//       // hacky
//       slider.set(this.props.value);
//     }
//   }
//   componentDidMount(): void {
//     this.buildSlider();
//   }
//   private static getSliderValue(noUiSlider: noUiSlider.noUiSlider): number {
//     return Math.round(parseInt(noUiSlider.get() as string, 10));
//   }
//   private buildSlider(): void {
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     const sliderEl = this.sliderElRef.current! as HTMLElement;
//     noUiSlider.create(sliderEl, this.getSliderOptions());
//     const slider = (sliderEl as noUiSlider.Instance).noUiSlider;
//     const getSliderValue = (): number => MaxLSBSlider.getSliderValue(slider);
//     slider.on("update", () => {
//       const val = getSliderValue();
//       if (val !== this.props.value) {
//         if (this.props.onUpdate) {
//           this.props.onUpdate(val);
//         }
//       }
//     });
//   }
//   private getSliderOptions(): noUiSlider.Options {
//     const values: number[] = [];
//     for (let i = 1; i <= 8; i++) {
//       values.push(i);
//     }
//     return {
//       // TODO: adapt to image size
//       behaviour: "snap",
//       range: {
//         min: [1, 1],
//         max: [8],
//       },
//       start: this.props.value,
//       tooltips: {
//         // tooltips are output only, so only a "to" is needed
//         to: function (numericValue: number) {
//           return numericValue.toFixed(2);
//         },
//       },
//       pips: {
//         mode: "values",
//         values: values,
//         density: 10,
//       },
//     };
//   }
// }
