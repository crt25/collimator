import { Menu, Portal, Icon, chakra, HStack } from "@chakra-ui/react";
import React, { useState } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import Link from "next/link";

type ClickHandler = (e: React.MouseEvent) => void;

export type DropdownItemProps = {
  children?: React.ReactNode;
  testId?: string;
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
  },
});

const DropdownMenuItem = ({
  href,
  onClick,
  children,
  icon,
  testId,
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
    <Menu.Item
      data-testid={testId}
      asChild
      value={children?.toString() ?? ""}
      onClick={onClick}
    >
      {element}
    </Menu.Item>
  );
};

export type DropdownProps = {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  testId?: string;
  isButton?: boolean;
  variant?: React.ComponentProps<typeof Menu.Root>["variant"];
};

const DropdownMenu = ({
  trigger,
  children,
  testId,
  variant,
  isButton = false,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isButton) {
    return (
      <Menu.Root
        open={isOpen}
        onOpenChange={(details) => setIsOpen(details.open)}
        variant={variant}
      >
        <Menu.Trigger data-testid={testId}>{trigger}</Menu.Trigger>
        {children && (
          <Portal>
            <Menu.Positioner>
              <MenuContent>{children}</MenuContent>
            </Menu.Positioner>
          </Portal>
        )}
      </Menu.Root>
    );
  }

  return (
    <Menu.Root
      open={isOpen}
      onOpenChange={(details) => setIsOpen(details.open)}
      variant={variant}
    >
      <MenuTrigger data-testid={testId} variant={variant}>
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
