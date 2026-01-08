import { LuUser, LuSettings, LuLogOut } from "react-icons/lu";
import DropdownMenu from "./DropdownMenu";
// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  component: DropdownMenu,
  title: "Components/DropdownMenu",
  tags: ["autodocs"],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: "Menu",
    children: (
      <>
        <DropdownMenu.Item onClick={() => console.log("Profile clicked")}>
          Profile
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => console.log("Settings clicked")}>
          Settings
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => console.log("Logout clicked")}>
          Logout
        </DropdownMenu.Item>
      </>
    ),
  },
};

export const WithIcons: Story = {
  args: {
    trigger: "Account",
    children: (
      <>
        <DropdownMenu.Item
          icon={<LuUser />}
          onClick={() => console.log("Profile clicked")}
        >
          Profile
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<LuSettings />}
          onClick={() => console.log("Settings clicked")}
        >
          Settings
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<LuLogOut />}
          onClick={() => console.log("Logout clicked")}
        >
          Logout
        </DropdownMenu.Item>
      </>
    ),
  },
};

export const WithLinks: Story = {
  args: {
    trigger: "Navigation",
    children: (
      <>
        <DropdownMenu.Item href="/profile">Profile</DropdownMenu.Item>
        <DropdownMenu.Item href="/settings">Settings</DropdownMenu.Item>
        <DropdownMenu.Item href="/help">Help</DropdownMenu.Item>
      </>
    ),
  },
};
