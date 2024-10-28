import { Dropdown } from "react-bootstrap";
import DropdownLinkItem from "./DropdownLinkItem";

export default {
  component: DropdownLinkItem,
  title: "DropdownLinkItem",
};

export const Default = {
  args: {
    href: "https://example.com",
    children: "Some string content",
  },
  parameters: {
    layout: "centered",
  },
  render: (args: Parameters<typeof DropdownLinkItem>[0]) => (
    <Dropdown show>
      <Dropdown.Toggle>Toggle Dropdown to see item</Dropdown.Toggle>

      <Dropdown.Menu>
        <DropdownLinkItem {...args} />
      </Dropdown.Menu>
    </Dropdown>
  ),
};
