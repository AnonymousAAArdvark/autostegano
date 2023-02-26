// import * as React from "react";
// import * as noUiSlider from "nouislider";
//
// export interface SVSliderProps {
//   value: number;
//   onUpdate: (svs: number) => void;
// }
//
// export class ResizeSlider extends React.Component<SVSliderProps> {
//   private sliderElRef: React.RefObject<HTMLDivElement>;
//   constructor(props: SVSliderProps) {
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
//   componentDidUpdate(prevProps: SVSliderProps): void {
//     const slider = this.getNoUiSlider();
//     if (!slider) {
//       return;
//     }
//     if (this.props.value !== ResizeSlider.getSliderValue(slider)) {
//       // hacky
//       slider.set(this.props.value);
//     }
//   }
//   componentDidMount(): void {
//     this.buildSlider();
//   }
//   private static getSliderValue(noUiSlider: noUiSlider.noUiSlider): number {
//     return parseFloat(noUiSlider.get() as string);
//   }
//   private buildSlider(): void {
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     const sliderEl = this.sliderElRef.current! as HTMLElement;
//     noUiSlider.create(sliderEl, this.getSliderOptions());
//     const slider = (sliderEl as noUiSlider.Instance).noUiSlider;
//     const getSliderValue = (): number => ResizeSlider.getSliderValue(slider);
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
//     for (let i = 0.25; i < 1; i += 0.5) {
//       values.push(i);
//     }
//     for (let i = 1; i < 4; i += 0.2) {
//       values.push(i);
//     }
//     values.push(4.0);
//     return {
//       // TODO: adapt to image size
//       behaviour: "snap",
//       range: {
//         min: [0.2, 0.05],
//         "50%": [1, 0.25],
//         max: [5],
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
//       },
//     };
//   }
// }
