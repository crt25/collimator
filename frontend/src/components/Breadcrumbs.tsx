import { Breadcrumb, HStack, Icon } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import React from "react";
import { LuHouse } from "react-icons/lu";
import BreadcrumbItem from "./BreadcrumbItem";

interface BreadcrumbsProps {
  children?: React.ReactNode;
}

const Breadcrumbs = ({ children }: BreadcrumbsProps) => (
  <Breadcrumb.Root>
    <Breadcrumb.List>
      <HStack>
        <BreadcrumbItem href="/">
          <Icon as={LuHouse} />
          <FormattedMessage id="Breadcrumbs.home" defaultMessage="Home" />
        </BreadcrumbItem>
        {children}
      </HStack>
    </Breadcrumb.List>
  </Breadcrumb.Root>
);

export default Breadcrumbs;
