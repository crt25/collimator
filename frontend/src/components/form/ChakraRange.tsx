import styled from "@emotion/styled";
import { Slider } from "@chakra-ui/react";
import React from "react";

const ChakraSliderWrapper = styled.div`
  margin-bottom: 1rem;
`;

interface ChakraSliderProps {
  min: number;
  max: number;
  step?: number;
  value?: number[];
  defaultValue?: number[];
  onChange: (value: number[]) => void;
  onChangeEnd?: (value: number[]) => void;
  disabled?: boolean;
  label?: string;
}

const ChakraRange = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onChange,
  onChangeEnd,
  disabled = false,
  label,
}: ChakraSliderProps) => (
  <ChakraSliderWrapper>
    <Slider.Root
      min={min}
      max={max}
      step={step}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(details) => onChange?.(details.value)}
      onValueChangeEnd={(details) => onChangeEnd?.(details.value)}
      disabled={disabled}
    >
      {label && <Slider.Label>{label}</Slider.Label>}
      <Slider.Control>
        <Slider.Track
          bg="var(--background-color-secondary)"
          borderColor="var(--foreground-color)"
        >
          <Slider.Range bg="var(--accent-color)" />
        </Slider.Track>
        <Slider.Thumbs />
      </Slider.Control>
    </Slider.Root>
  </ChakraSliderWrapper>
);

export default ChakraRange;
