import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import { useCallback } from "react";
import { useRouter } from "next/router";
import { LuSticker } from "react-icons/lu";
import ClassForm, { ClassFormValues } from "@/components/class/ClassForm";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import { useCreateClass } from "@/api/collimator/hooks/classes/useCreateClass";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeading, { PageHeadingVariant } from "@/components/PageHeading";

const messages = defineMessages({
  title: {
    id: "CreateClass.title",
    defaultMessage: "Create Class",
  },
  submit: {
    id: "CreateClass.submit",
    defaultMessage: "Create Class",
  },
});

const CreateClass = () => {
  const router = useRouter();
  const createClass = useCreateClass();

  const onSubmit = useCallback(
    async (formValues: ClassFormValues) => {
      await createClass({
        name: formValues.name,
        teacherId: formValues.teacherId,
      });

      router.back();
    },
    [createClass, router],
  );

  const breadcrumbItems = [
    {
      label: "Create Class",
      children: "Create Class",
      href: "/class/create",
      icon: <LuSticker />,
    },
  ];

  return (
    <>
      <Header title={messages.title} />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb breadcrumbItems={breadcrumbItems} />
        </Breadcrumbs>
        <PageHeading>
          <FormattedMessage
            id="CreateClass.header"
            defaultMessage="Create Class"
          />
        </PageHeader>
        <ClassForm submitMessage={messages.submit} onSubmit={onSubmit} />
      </Container>
    </>
  );
};

export default CreateClass;
