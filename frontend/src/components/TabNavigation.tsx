import styled from "@emotion/styled";
import Link from "next/link";
import { useRouter } from "next/router";
import { Nav } from "react-bootstrap";
import { IntlShape, useIntl } from "react-intl";
import BreadcrumbItem from "./BreadcrumbItem";

const StyledNav = styled(Nav)`
  margin: 1rem 0;

  .nav-item {
  }

  .nav-link {
    &.active {
    }
  }
`;

export interface NavigationTab<T = undefined> {
  url: string;
  title: (intl: IntlShape, args: T) => string;
}

// regex to remove both leading & trailing slashes
const stripSlashRegex = /(^\/|\/$)/g;

const TabNavigation = <T extends unknown = undefined>({
  tabs,
  tabTitleArguments,
  prefix,
  breadcrumb,
}: {
  tabs: NavigationTab<T>[];

  prefix?: string;
  breadcrumb?: boolean;
} & (T extends undefined
  ? { tabTitleArguments?: T }
  : { tabTitleArguments: T })) => {
  const router = useRouter();
  const intl = useIntl();

  const navigationTabs = tabs.map((tab) => {
    const url = prefix ? `${prefix}${tab.url}` : tab.url;

    const strippedUrl = url.replace(stripSlashRegex, "");
    const strippedPath = router.asPath.replace(stripSlashRegex, "");
    const isActive = strippedPath.startsWith(strippedUrl);

    return { ...tab, url, isActive };
  });

  if (breadcrumb) {
    const activeItems = navigationTabs.filter((tab) => tab.isActive);
    return (
      <>
        {activeItems.map((item) => (
          <BreadcrumbItem key={item.url} href={item.url}>
            {item.title(intl, tabTitleArguments as T)}
          </BreadcrumbItem>
        ))}
      </>
    );
  }

  return (
    <StyledNav variant="tabs">
      {navigationTabs.map((tab) => (
        <Nav.Item key={tab.url}>
          <Link
            className={tab.isActive ? "nav-link active" : "nav-link"}
            role="button"
            tabIndex={0}
            href={tab.url}
          >
            {tab.title(intl, tabTitleArguments as T)}
          </Link>
        </Nav.Item>
      ))}
    </StyledNav>
  );
};

export default TabNavigation;
