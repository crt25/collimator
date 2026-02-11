import { ReactNode } from "react";
import { Container } from "@chakra-ui/react";
import { FormattedMessage, MessageDescriptor, PrimitiveType } from "react-intl";
import Header from "@/components/header/Header";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeading from "@/components/PageHeading";

interface PageLayoutProps {
  title: MessageDescriptor;
  titleParameters?: Record<string, PrimitiveType>;
  heading: MessageDescriptor;
  description?: ReactNode;
  breadcrumbs?: ReactNode;
  children: ReactNode;
}

const PageLayout = ({
  title,
  titleParameters,
  heading,
  description,
  breadcrumbs,
  children,
}: PageLayoutProps) => {
  return (
    <MaxScreenHeight>
      <Header title={title} titleParameters={titleParameters} />
      <Container>
        {breadcrumbs && <Breadcrumbs>{breadcrumbs}</Breadcrumbs>}
        <PageHeading description={description}>
          <FormattedMessage {...heading} />
        </PageHeading>
        {children}
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default PageLayout;
