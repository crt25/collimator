import Checkbox from "./Checkbox";

export default { component: Checkbox };

type Args = Parameters<typeof Checkbox>[0];

export const Default = {
  args: {
    checked: false,
    onCheckedChange: () => {},
  } as Args,
};

export const CheckedCheckbox = {
  args: {
    checked: true,
    onCheckedChange: () => {},
  } as Args,
};
