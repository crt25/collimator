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

const CurrentValue = styled.span`
  margin-bottom: 0.25rem;
  text-align: right;
`;

const Range = ({
  value,
  min,
  max,
  step,
  onChange,
  label,
  children,
}: {
  value?: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label: MessageDescriptor;
  children: React.ReactNode;
}) => {
  const intl = useIntl();

  return (
    <>
      <Label>{intl.formatMessage(label)}</Label>
      <InputWrapper>
        <CurrentValue>{value}</CurrentValue>
        <PrimeRange
          min={min}
          max={max}
          step={step ?? 1}
          value={value}
          onChange={(e) => {
            onChange(e.value as number);
          }}
        />
      </InputWrapper>
      {children}
    </>
  );
};

export default Range;
