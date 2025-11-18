import {
  Menu,
  Portal,
  Icon,
  chakra,
  Avatar as ChakraAvatar,
} from "@chakra-ui/react";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUserName } from "@/hooks/useUserName";
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

const UsernameItem = chakra(Menu.Item, {
  base: {
    fontWeight: "semibold",
    cursor: "pointer",
    _hover: {
      bg: "gray.100",
    },
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
  const username = useUserName();
  const router = useRouter();

  const handleUsernameClick = () => {
    router.push("/");
    setIsOpen(false);
  };

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
          <MenuContent>
            <UsernameItem
              value="username"
              onClick={handleUsernameClick}
              data-testid="current-user"
            >
              {username}
            </UsernameItem>
            <Menu.Separator />
            {children}
          </MenuContent>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

AvatarMenu.Item = AvatarMenuItem;

export default AvatarMenu;
