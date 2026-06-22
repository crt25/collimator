import ChakraRange from "./ChakraRange";

export default { component: ChakraRange };

type Args = Parameters<typeof ChakraRange>[0];

export const Default = {
  args: {
    min: 0,
    max: 100,
    label: "Default Range",
    onChange: () => {},
  } as Args,
};

export const WithValue = {
  args: {
    min: 0,
    max: 100,
    value: [50],
    label: "Range with Value",
    onChange: () => {},
  } as Args,
};
