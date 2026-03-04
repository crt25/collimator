import { ReactNode } from "react";
import { MessageDescriptor } from "react-intl";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import StudentHeader from "@/components/header/StudentHeader";

interface StudentPageLayoutProps {
  title: MessageDescriptor;
  titleParameters?: Record<string, string | number>;
  logo?: ReactNode;
  belowHeader?: ReactNode;
  headerActions?: ReactNode;
  studentName?: string | null;
  children: ReactNode;
}

const StudentPageLayout = ({
  title,
  titleParameters,
  logo,
  belowHeader,
  headerActions,
  studentName,
  children,
}: StudentPageLayoutProps) => {
  return (
    <MaxScreenHeight>
      <StudentHeader
        title={title}
        titleParameters={titleParameters}
        logo={logo}
        belowHeader={belowHeader}
        studentName={studentName}
      >
        {headerActions}
      </StudentHeader>
      {children}
    </MaxScreenHeight>
  );
};

export default StudentPageLayout;
