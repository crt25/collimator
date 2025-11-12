import { Breadcrumb, HStack, Icon } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import { Children, Fragment, isValidElement } from "react";
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

        {Children.map(children, (child, index) => {
          if (!isValidElement(child)) {
            return null;
          }

          const childKey = child.key ?? `breadcrumb-${index}`;

          return (
            <Fragment key={childKey}>
              <Breadcrumb.Separator />
              {child}
            </Fragment>
          );
        })}
      </HStack>
    </Breadcrumb.List>
  </Breadcrumb.Root>
);

export default Breadcrumbs;
