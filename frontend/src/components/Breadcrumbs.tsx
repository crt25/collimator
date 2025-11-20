import { Breadcrumb, HStack, Icon } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import React, { ComponentProps } from "react";
import { LuHouse } from "react-icons/lu";
import BreadcrumbItem from "./BreadcrumbItem";

type BreadcrumbsProps = ComponentProps<typeof Breadcrumb.Root> & {
  topLevel?: React.ReactNode;
  children?: React.ReactNode;
};

const Breadcrumbs = ({ topLevel, children, ...rest }: BreadcrumbsProps) => (
  <Breadcrumb.Root {...rest}>
    <Breadcrumb.List>
      <HStack>
        {topLevel ?? (
          <BreadcrumbItem href="/">
            <Icon as={LuHouse} />
            <FormattedMessage id="Breadcrumbs.home" defaultMessage="Home" />
          </BreadcrumbItem>
        )}
        {children}
      </HStack>
    </Breadcrumb.List>
  </Breadcrumb.Root>
);

export default Breadcrumbs;
