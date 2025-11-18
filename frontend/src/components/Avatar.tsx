import {
  Menu,
  Portal,
  Icon,
  chakra,
  Avatar as ChakraAvatar,
} from "@chakra-ui/react";
import React, { useState } from "react";
import Link from "next/link";

interface AvatarMenuItemProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

interface AvatarMenuProps {
  children: React.ReactNode;
  testId?: string;
  icon: React.ReactNode;
}

const MenuContent = chakra(Menu.Content, {
  base: {
    borderColor: "headerBorder",
  },
});

const AvatarMenuItem = ({
  href,
  onClick,
  children,
  icon,
}: AvatarMenuItemProps) => {
  const content = (
    <>
      {icon && <Icon>{icon}</Icon>}
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

const AvatarMenu = ({ children, testId, icon }: AvatarMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Menu.Root
      open={isOpen}
      onOpenChange={(details) => setIsOpen(details.open)}
    >
      <Menu.Trigger data-testid={testId}>
        <ChakraAvatar.Root variant="solid">
          <ChakraAvatar.Fallback>{icon}</ChakraAvatar.Fallback>
        </ChakraAvatar.Root>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <MenuContent>{children}</MenuContent>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

AvatarMenu.Item = AvatarMenuItem;

export default AvatarMenu;
