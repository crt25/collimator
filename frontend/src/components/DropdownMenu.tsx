import { Menu, Portal, Icon, chakra, HStack } from "@chakra-ui/react";
import React, { useState } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import Link from "next/link";

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

const MenuTrigger = chakra(Menu.Trigger, {
  base: {
    borderWidth: "thin",
    borderStyle: "solid",
    borderRadius: "sm !important",
    borderColor: "gray.200",
    padding: "sm",
    fontWeight: "semibold",
  },
});

const MenuContent = chakra(Menu.Content, {
  base: {
    backgroundColor: "bg",
    borderColor: "headerBorder",
  },
});

export type DropdownProps = {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  testId?: string;
};

const DropdownMenuItem = ({
  href,
  onClick,
  children,
  icon,
}: DropdownItemProps) => {
  const content = (
    <>
      {icon && <span>{icon}</span>}
      {children}
    </>
  );

  let element;
  if (href) {
    element = <Link href={href}>{content}</Link>;
  } else {
    element = <span>{content}</span>;
  }

  return (
    <Menu.Item asChild value={children?.toString() ?? ""} onClick={onClick}>
      {element}
    </Menu.Item>
  );
};

const DropdownMenu = ({ trigger, children, testId }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Menu.Root
      open={isOpen}
      onOpenChange={(details) => setIsOpen(details.open)}
    >
      <MenuTrigger data-testid={testId}>
        <HStack>
          {trigger}
          <Icon as={isOpen ? LuChevronUp : LuChevronDown} />
        </HStack>
      </MenuTrigger>
      <Portal>
        <Menu.Positioner>
          <MenuContent>{children}</MenuContent>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

DropdownMenu.Item = DropdownMenuItem;

export default DropdownMenu;
