import Link from "next/link";
import { Breadcrumb, HStack } from "@chakra-ui/react";

export type BreadcrumbItemData = {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  isCurrentPage?: boolean;
  icon?: React.ReactNode;
  testId?: string;
};

const BreadcrumbItem = ({
  href,
  onClick,
  children,
  isCurrentPage,
  icon,
  testId,
}: BreadcrumbItemData) => {
  if (isCurrentPage || (!href && !onClick)) {
    return (
      <Breadcrumb.Item data-testid={testId}>
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
      <Breadcrumb.Item data-testid={testId}>
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
      <Breadcrumb.Item data-testid={testId}>
        <Breadcrumb.Link as="button" type="button" onClick={onClick}>
          <HStack>
            {icon && <span>{icon}</span>}
            {children}
          </HStack>
        </Breadcrumb.Link>
      </Breadcrumb.Item>
    );
  }

  return (
    <Breadcrumb.Item data-testid={testId}>
      <HStack>
        {icon && <span>{icon}</span>}
        {children}
      </HStack>
    </Breadcrumb.Item>
  );
};
export default BreadcrumbItem;
