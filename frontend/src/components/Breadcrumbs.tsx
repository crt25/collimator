import { Breadcrumb } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import { Children, Fragment, isValidElement } from "react";
import BreadcrumbItem from "./BreadcrumbItem";

const Breadcrumbs = ({
  homeHref,
  children,
}: {
  homeHref?: string;
  children?: React.ReactNode;
}) => (
  <Breadcrumb.Root mt="4" p="2" fontWeight="bold">
    <Breadcrumb.List gap="3">
      <BreadcrumbItem href={homeHref ?? "/"}>
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
    </Breadcrumb.List>
  </Breadcrumb.Root>
);

export default Breadcrumbs;
