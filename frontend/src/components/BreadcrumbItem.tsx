import Link from "next/link";
import { Breadcrumb } from "@chakra-ui/react";

const BreadcrumbItem = ({
  href,
  children,
  isCurrentPage,
  icon,
}: {
  href?: string;
  children: React.ReactNode;
  isCurrentPage?: boolean;
  icon?: React.ReactNode;
}) => {
  if (isCurrentPage || !href) {
    return (
      <Breadcrumb.Item>
        <Breadcrumb.CurrentLink>
          {icon}
          {children}
        </Breadcrumb.CurrentLink>
      </Breadcrumb.Item>
    );
  }

  return (
    <Breadcrumb.Item>
      <Breadcrumb.Link asChild>
        <Link href={href}>
          {icon}
          {children}
        </Link>
      </Breadcrumb.Link>
    </Breadcrumb.Item>
  );
};

export default BreadcrumbItem;
