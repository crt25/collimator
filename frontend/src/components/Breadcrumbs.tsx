import styled from "@emotion/styled";
import BreadcrumbItem from "./BreadcrumbItem";
import { FormattedMessage } from "react-intl";

const StyledNav = styled.nav`
  margin-top: 1rem;
  padding: 0.5rem;
  border: var(--foreground-color) 1px solid;
  border-radius: var(--border-radius);
`;

const StyledOl = styled.ol`
  margin: 0;
`;

const Breadcrumbs = ({
  homeHref,
  children,
}: {
  homeHref?: string;
  children?: React.ReactNode;
}) => (
  <StyledNav aria-label="breadcrumb">
    <StyledOl className="breadcrumb">
      <BreadcrumbItem href={homeHref ?? "/"}>
        <FormattedMessage id="Breadcrumbs.home" defaultMessage="Home" />
      </BreadcrumbItem>
      {children}
    </StyledOl>
  </StyledNav>
);

export default Breadcrumbs;
