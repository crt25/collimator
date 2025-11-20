import Link from "next/link";
import { Breadcrumb, HStack } from "@chakra-ui/react";

export type BreadcrumbItemData = {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  isCurrentPage?: boolean;
  icon?: React.ReactNode;
};

const BreadcrumbItem = ({
  href,
  onClick,
  children,
  isCurrentPage,
  icon,
}: BreadcrumbItemData) => {
  if (isCurrentPage || (!href && !onClick)) {
    return (
      <Breadcrumb.Item>
        <Breadcrumb.CurrentLink>
          <HStack>
            {icon && <span>{icon}</span>}
            {children}
          </HStack>
        </Breadcrumb.CurrentLink>
      </Breadcrumb.Item>
    );
  }

  if (href) {
    return (
      <Breadcrumb.Item>
        <Breadcrumb.Link asChild>
          <Link href={href}>
            <HStack>
              {icon && <span>{icon}</span>}
              {children}
            </HStack>
          </Link>
        </Breadcrumb.Link>
      </Breadcrumb.Item>
    );
  }

  if (onClick) {
    return (
      <Breadcrumb.Item>
        <Breadcrumb.Link onClick={onClick} cursor="pointer">
          <HStack>
            {icon && <span>{icon}</span>}
            {children}
          </HStack>
        </Breadcrumb.Link>
      </Breadcrumb.Item>
    );
  }

  return (
    <Breadcrumb.Item>
      <HStack>
        {icon && <span>{icon}</span>}
        {children}
      </HStack>
    </Breadcrumb.Item>
  );
};
export default BreadcrumbItem;
