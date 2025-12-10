import styled from "@emotion/styled";
import { MessageDescriptor, useIntl } from "react-intl";
import { useMemo } from "react";
import ChakraRange from "./ChakraRange";

const Label = styled.span`
  display: block;
  margin-bottom: 0.25rem;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const CurrentValues = styled.span`
  margin-bottom: 0.25rem;
  text-align: right;
`;

const MinMaxRange = ({
  valueMin: valueMinIn,
  valueMax: valueMaxIn,
  min,
  max,
  step,
  onChange,
  label,
  children,
}: {
  valueMin: number;
  valueMax: number;
  min: number;
  max: number;
  step?: number;
  onChange: (min: number, max: number) => void;
  label: MessageDescriptor;
  children?: React.ReactNode;
}) => {
  const intl = useIntl();

  const valueMin = useMemo(
    () => Math.min(Math.max(valueMinIn, min), max),
    [min, max, valueMinIn],
  );

  const valueMax = useMemo(
    () => Math.min(Math.max(valueMaxIn, min), max),
    [min, max, valueMaxIn],
  );

  return (
    <>
      <Label>{intl.formatMessage(label)}</Label>
      <InputWrapper>
        <CurrentValues>
          {valueMin} - {valueMax}
        </CurrentValues>
        <ChakraRange
          min={min}
          max={max}
          step={step ?? 1}
          value={[valueMin, valueMax]}
          onChange={([min, max]) => onChange(min, max)}
        />
      </InputWrapper>
      {children}
    </>
  );
};

export default MinMaxRange;
