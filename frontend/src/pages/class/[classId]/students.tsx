import { useRouter } from "next/router";
import { Container } from "@chakra-ui/react";
import { defineMessages } from "react-intl";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import SwrContent from "@/components/SwrContent";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import StudentList from "@/components/student/StudentList";
import PageHeading from "@/components/PageHeading";
import AnonymizationToggle from "@/components/AnonymizationToggle";
import ClassActions from "@/components/class/ClassActions";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "ClassUserList.title",
    defaultMessage: "{name} - Students",
  },
});

const ClassUserList = () => {
  const router = useRouter();
  const { classId } = router.query as {
    classId: string;
  };

  const { data: klass, error, isLoading } = useClass(classId);

  return (
    <MaxScreenHeight>
      <Header
        title={messages.title}
        titleParameters={{
          name: klass?.name ?? "",
        }}
      >
        <AnonymizationToggle />
      </Header>
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
        </Breadcrumbs>
        <SwrContent error={error} isLoading={isLoading} data={klass}>
          {(klass) => (
            <>
              <PageHeading actions={<ClassActions klass={klass} />}>
                {klass.name}
              </PageHeading>
              <ClassNavigation classId={klass.id} />
              <StudentList klass={klass} />
            </>
          )}
        </SwrContent>
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default ClassUserList;
