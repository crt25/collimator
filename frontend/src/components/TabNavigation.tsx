import Link from "next/link";
import { useRouter } from "next/router";
import { Tabs } from "@chakra-ui/react";
import { IntlShape, useIntl } from "react-intl";
import { useContext } from "react";
import styled from "@emotion/styled";
import {
  AuthenticationContext,
  AuthenticationContextType,
} from "@/contexts/AuthenticationContext";
import { isNonNull } from "@/utilities/is-non-null";
import BreadcrumbItem from "./BreadcrumbItem";

const TabsRoot = styled(Tabs.Root)`
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

export interface NavigationTab<T = undefined> {
  url: string;
  title: (intl: IntlShape, args: T) => string;
  isShown?: (authContext: AuthenticationContextType) => boolean;
  testId?: string;
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
  const authContext = useContext(AuthenticationContext);

  const navigationTabs = tabs
    .map((tab) => {
      const isShown = tab.isShown ? tab.isShown(authContext) : true;

      if (!isShown) {
        return null;
      }

      const url = prefix ? `${prefix}${tab.url}` : tab.url;

      const strippedUrl = url.replace(stripSlashRegex, "");
      const strippedPath = router.asPath.replace(stripSlashRegex, "");

      const isActive =
        strippedUrl === ""
          ? // special case for the home page (""), which must match exactly
            strippedPath === ""
          : strippedPath.startsWith(strippedUrl);

      return { ...tab, url, isActive };
    })
    .filter(isNonNull);

  const activeItems = navigationTabs.filter((tab) => tab.isActive);

  if (breadcrumb) {
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

  const activeValue = activeItems[0]?.url || "";

  return (
    <TabsRoot
      value={activeValue}
      navigate={({ value }) => {
        router.push(value);
      }}
    >
      <Tabs.List>
        {navigationTabs.map((tab) => (
          <Tabs.Trigger key={tab.url} value={tab.url} asChild>
            <Link href={tab.url} data-testid={tab.testId}>
              {tab.title(intl, tabTitleArguments as T)}
            </Link>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </TabsRoot>
  );
};

export default TabNavigation;
