import styled from "@emotion/styled";
import { MessageDescriptor, useIntl } from "react-intl";
import PrimeRange from "./PrimeRange";

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
  valueMin,
  valueMax,
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
  children: React.ReactNode;
}) => {
  const intl = useIntl();

  return (
    <>
      <Label>{intl.formatMessage(label)}</Label>
      <InputWrapper>
        <CurrentValues>
          {valueMin} - {valueMax}
        </CurrentValues>
        <PrimeRange
          min={min}
          max={max}
          step={step ?? 1}
          value={[valueMin, valueMax]}
          onChange={(e) => {
            const [n1, n2] = e.value as [number, number];
            const min = Math.min(n1, n2);
            const max = Math.max(n1, n2);

            onChange(min, max);
          }}
          range
        />
      </InputWrapper>
      {children}
    </>
  );
};

export default MinMaxRange;
