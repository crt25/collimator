import { useRouter } from "next/router";
import { defineMessages } from "react-intl";
import { Container } from "@chakra-ui/react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/header/Header";
import SessionList from "@/components/session/SessionList";
import CrtNavigation from "@/components/CrtNavigation";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import SwrContent from "@/components/SwrContent";
import PageHeading from "@/components/PageHeading";
import ClassActions from "@/components/class/ClassActions";

const messages = defineMessages({
  title: {
    id: "ClassSessionList.title",
    defaultMessage: "{name} - Lessons",
  },
});

const ClassSessionList = () => {
  const router = useRouter();
  const { classId } = router.query as {
    classId: string;
  };

  const { data: klass, error, isLoading } = useClass(classId);

  return (
    <>
      <Header
        title={messages.title}
        titleParameters={{
          name: klass?.name ?? "",
        }}
      />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
        </Breadcrumbs>
        <SwrContent error={error} isLoading={isLoading} data={klass}>
          {(klass) => (
            <>
              <PageHeading
                variant="title"
                actions={<ClassActions klass={klass} />}
              >
                {klass.name}
              </PageHeading>
              <ClassNavigation classId={klass?.id} />
              <SessionList classId={klass.id} />
            </>
          )}
        </SwrContent>
      </Container>
    </>
  );
};

export default ClassSessionList;
