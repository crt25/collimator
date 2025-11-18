import { defineMessages, useIntl } from "react-intl";
import { LuTrash } from "react-icons/lu";
import { useRouter } from "next/router";
import DropdownMenu from "../DropdownMenu";
import { ButtonMessages } from "@/i18n/button-messages";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { useDeleteClass } from "@/api/collimator/hooks/classes/useDeleteClass";

const messages = defineMessages({
  deleteSession: {
    id: "ClassActions.deleteSession",
    defaultMessage: "Delete Class",
  },
});

const ClassActions = ({ klass }: { klass: ExistingClassExtended }) => {
  const intl = useIntl();

  const router = useRouter();
  const deleteClass = useDeleteClass();

  return (
    <DropdownMenu
      trigger={intl.formatMessage(ButtonMessages.actions)}
      variant="emphasized"
    >
      <DropdownMenu.Item
        onClick={async () => {
          await deleteClass(klass.id);
          router.push("/class");
        }}
        icon={<LuTrash />}
      >
        {intl.formatMessage(messages.deleteSession)}
      </DropdownMenu.Item>
    </DropdownMenu>
  );
};

export default ClassActions;
