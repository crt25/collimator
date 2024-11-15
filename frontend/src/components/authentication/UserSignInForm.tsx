import { useForm, UseFormSetError } from "react-hook-form";
import * as yup from "yup";
import ValidationErrorMessage from "../form/ValidationErrorMessage";
import Input from "../form/Input";
import { defineMessages, MessageDescriptor } from "react-intl";
import SubmitFormButton from "../form/SubmitFormButton";
import { useYupSchema } from "@/hooks/useYupSchema";
import { useYupResolver } from "@/hooks/useYupResolver";

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
    formState: { errors },
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
      <Input
        label={messages.password}
        {...register("password")}
        data-testid="password"
        type="password"
      >
        <ValidationErrorMessage>
          {errors.password?.message}
        </ValidationErrorMessage>
      </Input>

      {showBackupPassword && (
        <Input
          label={messages.backupPassword}
          {...register("backupPassword")}
          data-testid="backupPassword"
          type="password"
        >
          <ValidationErrorMessage>
            {errors.backupPassword?.message}
          </ValidationErrorMessage>
        </Input>
      )}

      <SubmitFormButton label={submitMessage} />
    </form>
  );
};

export default UserSignInForm;
