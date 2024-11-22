import styled from "@emotion/styled";
import { Slider, SliderProps } from "primereact/slider";
import React from "react";

const PrimeRangeWrapper = styled.div`
  /* copied and adapted from https://github.com/primefaces/primereact/blob/c7e467303753acd008309d08fb673be2424adc91/public/themes/bootstrap4-dark-blue/theme.css*/

  .p-slider {
    background-color: var(--background-color-secondary);
    border: var(--foreground-color) 1px solid;
    border-radius: var(--border-radius);

    margin-bottom: 1rem;
  }

  .p-slider.p-slider-horizontal {
    height: 0.286rem;
  }

  .p-slider.p-slider-horizontal .p-slider-handle {
    margin-top: -0.5715rem;
    margin-left: -0.5715rem;
  }

  .p-slider.p-slider-vertical {
    width: 0.286rem;
  }

  .p-slider.p-slider-vertical .p-slider-handle {
    margin-left: -0.5715rem;
    margin-bottom: -0.5715rem;
  }

  .p-slider .p-slider-handle {
    height: 1.143rem;
    width: 1.143rem;
    background: var(--accent-color);
    border-radius: 50%;
    transition:
      background-color 0.15s,
      border-color 0.15s,
      box-shadow 0.15s;
  }

  .p-slider .p-slider-range {
    background: var(--accent-color);
  }

  .p-slider:not(.p-disabled) .p-slider-handle:hover {
    background: var(--accent-color-highlight);
  }
`;

const PrimeRange = (props: SliderProps) => (
  <PrimeRangeWrapper>
    <Slider {...props} />
  </PrimeRangeWrapper>
);

export default PrimeRange;
