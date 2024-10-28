import Link from "next/link";

const DropdownLinkItem = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link href={href} className="dropdown-item">
    {children}
  </Link>
);

export default DropdownLinkItem;
