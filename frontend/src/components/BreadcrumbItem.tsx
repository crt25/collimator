import Link from "next/link";
import { Breadcrumb } from "@chakra-ui/react";

export type BreadcrumbItemData = {
  href?: string;
  children: React.ReactNode;
  isCurrentPage?: boolean;
  icon?: React.ReactNode;
};

const BreadcrumbItem = ({
  href,
  children,
  isCurrentPage,
  icon,
}: BreadcrumbItemData) => {
  if (isCurrentPage || !href) {
    return (
      <Breadcrumb.Item>
        <Breadcrumb.CurrentLink>
          {icon && <span>{icon}</span>}
          {children}
        </Breadcrumb.CurrentLink>
      </Breadcrumb.Item>
    );
  }
  return (
    <Breadcrumb.Item>
      <Breadcrumb.Link asChild>
        <Link href={href}>
          {icon && <span>{icon}</span>}
          {children}
        </Link>
      </Breadcrumb.Link>
    </Breadcrumb.Item>
  );
};
export default BreadcrumbItem;
