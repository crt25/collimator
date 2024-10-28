import { defineMessages } from "react-intl";
import TabNavigation, { NavigationTab } from "../TabNavigation";

const messages = defineMessages({
  userTab: {
    id: "UserNavigation.userTab",
    defaultMessage: "User Details",
  },
});

const tabs: NavigationTab[] = [
  {
    url: "detail",
    title: (intl) => intl.formatMessage(messages.userTab),
  },
];

const UserNavigation = ({
  userId,
  breadcrumb,
}: {
  userId: number;
  breadcrumb?: boolean;
}) => (
  <TabNavigation
    tabs={tabs}
    prefix={`/user/${userId}/`}
    breadcrumb={breadcrumb}
  />
);

export default UserNavigation;
