import { defineMessages } from "react-intl";
import MinMaxRange from "./MinMaxRange";

export default { component: MinMaxRange };

const messages = defineMessages({
  defaultLabel: {
    id: "MinMaxRange.defaultLabel",
    defaultMessage: "Default MinMax Range",
  },
  withValuesLabel: {
    id: "MinMaxRange.withValuesLabel",
    defaultMessage: "MinMax Range with Values",
  },
});

type Args = Parameters<typeof MinMaxRange>[0];

export const Default = {
  args: {
    min: 0,
    max: 100,
    valueMin: 0,
    valueMax: 100,
    label: messages.defaultLabel,
    onChange: (min: number, max: number) => {
      console.log("Changed:", min, max);
    },
  } as Args,
};

export const WithValues = {
  args: {
    min: 0,
    max: 100,
    valueMin: 20,
    valueMax: 80,
    label: messages.withValuesLabel,
    onChange: (min: number, max: number) => {
      console.log("Changed:", min, max);
    },
  } as Args,
};
