import { Menu, Portal, Icon } from "@chakra-ui/react";
import React, { useState, MouseEvent as MouseEventReact } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";

type ClickHandler = () => void;

export type DropdownItemProps = {
  children?: React.ReactNode;
  icon?: React.ReactNode;
} & (
  | {
      href: string;
      onClick?: ClickHandler;
    }
  | {
      href?: undefined;
      onClick: ClickHandler;
    }
);

const DropdownItem = ({ href, onClick, children, icon }: DropdownItemProps) => {
  const handleClick = (e: MouseEventReact<HTMLElement>) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
  };

  const content = (
    <>
      {icon && <span>{icon}</span>}
      {children}
    </>
  );

  let element;
  if (href) {
    element = <a href={href}>{content}</a>;
  } else {
    element = <span>{content}</span>;
  }

  return (
    <Menu.Item asChild value={children?.toString() ?? ""} onClick={handleClick}>
      {element}
    </Menu.Item>
  );
};

export type DropdownProps = {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
};

const Dropdown = ({ trigger, children }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const triggerStyleProp = {
    backgroundColor: "var(--button-background-color)",
    color: "var(--button-foreground-color)",
    borderRadius: "var(--border-radius)",
    padding: "0.5rem 1rem",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    "&:hover": {
      backgroundColor: "var(--accent-color-highlight)",
    },
  };

  const contentStyleProp = {
    backgroundColor: "var(--background-color)",
    borderColor: "var(--header-border-color)",
  };

  return (
    <Menu.Root
      open={isOpen}
      onOpenChange={(details) => setIsOpen(details.open)}
    >
      <Menu.Trigger css={triggerStyleProp}>
        {trigger}
        <Icon as={isOpen ? LuChevronUp : LuChevronDown} />
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content css={contentStyleProp}>{children}</Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default Dropdown;
export { DropdownItem };
