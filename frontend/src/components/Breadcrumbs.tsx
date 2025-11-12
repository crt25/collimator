import { Breadcrumb, chakra } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import { Children, Fragment, isValidElement } from "react";
import BreadcrumbItem from "./BreadcrumbItem";

const BreadcrumbRoot = chakra(Breadcrumb.Root, {
  base: {
    marginTop: "xl !important",
    padding: "sm",
    fontWeight: "semiBold",
  },
});

const BreadcrumbList = chakra(Breadcrumb.List, {
  base: {
    gap: "md !important",
    margin: "0 !important",
    padding: "0 !important",
    fontSize: "xl",
    color: "fgTertiary",
  },
});

const Breadcrumbs = ({
  homeHref,
  children,
}: {
  homeHref?: string;
  children?: React.ReactNode;
}) => (
  <BreadcrumbRoot>
    <BreadcrumbList>
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
    </BreadcrumbList>
  </BreadcrumbRoot>
);

export default Breadcrumbs;
