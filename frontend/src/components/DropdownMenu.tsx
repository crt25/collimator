import { Menu, Portal, Icon } from "@chakra-ui/react";
import React, { useState } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import Link from "next/link";
import styled from "@emotion/styled";

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


const StyledMenuContent = styled(Menu.Content)`
  background-color: var(--background-color);
  border-color: var(--header-border-color);
`;

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

export type DropdownProps = {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  testId?: string;
  isButton?: boolean;
};

const DropdownMenu = ({
  trigger,
  children,
  testId,
  isButton = false,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isButton) {
    return (
      <Menu.Root
        open={isOpen}
        onOpenChange={(details) => setIsOpen(details.open)}
      >
        <Menu.Trigger asChild data-testid={testId}>
          {trigger}
        </Menu.Trigger>
        {children && (
          <Portal>
            <Menu.Positioner>
              <StyledMenuContent>{children}</StyledMenuContent>
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
    >
      <Menu.Trigger css={triggerStyleProp} data-testid={testId}>
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

DropdownMenu.Item = DropdownMenuItem;

export default DropdownMenu;
