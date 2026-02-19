import { useForm, UseFormSetError } from "react-hook-form";
import * as yup from "yup";
import { defineMessages, MessageDescriptor } from "react-intl";
import { chakra, Stack } from "@chakra-ui/react";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";
import Input from "../form/Input";
import SubmitFormButton from "../form/SubmitFormButton";

const messages = defineMessages({
  password: {
    id: "UserSignInForm.password",
    defaultMessage: "Password",
  },
  backupPassword: {
    id: "UserSignInForm.backupPassword",
    defaultMessage: "Backup Password",
  },
});

export type UserSignInFormValues = {
  password: string;
  backupPassword?: string;
};

const ButtonWrapper = chakra("div", {
  base: {
    marginTop: "xs",
    display: "flex",
    justifyContent: "flex-end",
  },
});

const UserSignInForm = ({
  submitMessage,
  initialValues,
  onSubmit,
  showBackupPassword,
}: {
  submitMessage: MessageDescriptor;
  initialValues?: UserSignInFormValues;
  onSubmit: (
    data: UserSignInFormValues,
    setError: UseFormSetError<UserSignInFormValues>,
  ) => void;
  showBackupPassword?: boolean;
}) => {
  const schema = useYupSchema({
    password: yup.string().required(),
    backupPassword: yup.string(),
  });
  const resolver = useYupResolver(schema);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setError,
  } = useForm<UserSignInFormValues>({
    resolver,
    defaultValues: initialValues,
  });

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data, setError))}
      data-testid="user-sign-in-form"
    >
      <Stack gap="sm">
        <Input
          label={messages.password}
          {...register("password")}
          data-testid="password"
          type="password"
          errorText={errors.password?.message}
        />
        {showBackupPassword && (
          <Input
            label={messages.backupPassword}
            {...register("backupPassword")}
            data-testid="backupPassword"
            type="password"
            errorText={errors.backupPassword?.message}
          />
        )}
        <ButtonWrapper>
          <SubmitFormButton
            label={submitMessage}
            width="auto"
            disabled={!isDirty || !isValid}
          />
        </ButtonWrapper>
      </Stack>
    </form>
  );
};

export default UserSignInForm;
