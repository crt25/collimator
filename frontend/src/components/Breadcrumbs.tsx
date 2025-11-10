import { Breadcrumb } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import { Children, Fragment, isValidElement } from "react";
import styled from "@emotion/styled";
import BreadcrumbItem from "./BreadcrumbItem";

const BreadcrumbRoot = styled(Breadcrumb.Root)`
  margin-top: 1rem;
  padding: 0.5rem;
  font-weight: bold;
`;

const BreadcrumbList = styled(Breadcrumb.List)`
  gap: 0.25rem;

  && {
    margin: 0;
    padding: 0;
  }
`;

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
