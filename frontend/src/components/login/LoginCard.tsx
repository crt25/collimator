import { Card, Stack } from "@chakra-ui/react";
import { JSX } from "react";
import { useIntl } from "react-intl";
import Button from "@/components/Button";
import { TextComponent as Text } from "@/components/Text";
import { WarningMessages } from "@/i18n/warning-messages";

interface LoginCardProps {
  title: JSX.Element;
  description: JSX.Element;
  buttonLabel: JSX.Element;
  onAuthenticate: () => void;
  isStudent?: boolean;
}

const LoginCard = ({
  title,
  description,
  buttonLabel,
  onAuthenticate,
  isStudent = false,
}: LoginCardProps) => {
  const intl = useIntl();

  return (
    <Stack gap="sm" width="full" maxWidth="md">
      <Card.Root width="full">
        <Card.Header gap="sm">
          <Card.Title>{title}</Card.Title>
          <Card.Description>{description}</Card.Description>
          <Stack width="full">
            <Text fontSize="sm" color="gray.600">
              {intl.formatMessage(
                isStudent
                  ? WarningMessages.studentAuthenticationTracking
                  : WarningMessages.authenticationTracking,
              )}
            </Text>
          </Stack>
        </Card.Header>
        <Card.Body />
        <Card.Footer justifyContent="flex-end">
          <Button onClick={onAuthenticate} data-testid="signin-button">
            {buttonLabel}
          </Button>
        </Card.Footer>
      </Card.Root>
    </Stack>
  );
};

export default LoginCard;
