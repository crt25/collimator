import Link from "next/link";

const BreadcrumbItem = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <li className="breadcrumb-item">
    <Link href={href}>{children}</Link>
  </li>
);

export default BreadcrumbItem;
