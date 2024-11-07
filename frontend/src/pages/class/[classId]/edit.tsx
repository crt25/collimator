import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import ClassForm, { ClassFormValues } from "@/components/class/ClassForm";
import { useUpdateClass } from "@/api/collimator/hooks/classes/useUpdateClass";
import { useCallback } from "react";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import SwrContent from "@/components/SwrContent";

const messages = defineMessages({
  submit: {
    id: "EditClass.submit",
    defaultMessage: "Save Class",
  },
});

const EditClass = () => {
  const router = useRouter();
  const { classId } = router.query as {
    classId: string;
  };

  const { data: klass, error, isLoading } = useClass(classId);

  const updateClass = useUpdateClass();

  const onSubmit = useCallback(
    async (formValues: ClassFormValues) => {
      if (klass) {
        await updateClass(klass.id, {
          name: formValues.name,
          teacherId: formValues.teacherId,
        });

        router.back();
      }
    },
    [klass, updateClass, router],
  );

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
        </Breadcrumbs>
        <ClassNavigation classId={klass?.id} />
        <PageHeader>
          <FormattedMessage id="EditClass.header" defaultMessage="Edit Class" />
        </PageHeader>
        <SwrContent error={error} isLoading={isLoading} data={klass}>
          {(klass) => (
            <ClassForm
              submitMessage={messages.submit}
              initialValues={{name: klass.name, teacherId: klass.teacher.id}}
              onSubmit={onSubmit}
            />
          )}
        </SwrContent>
      </Container>
    </>
  );
};

export default EditClass;
