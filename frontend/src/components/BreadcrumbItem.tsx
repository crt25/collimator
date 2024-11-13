import Link from "next/link";

const BreadcrumbItem = ({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) => (
  <li className="breadcrumb-item">
    {href ? <Link href={href}>{children}</Link> : children}
  </li>
);

export default BreadcrumbItem;
