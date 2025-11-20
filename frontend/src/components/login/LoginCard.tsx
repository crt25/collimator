import { Card, Stack } from "@chakra-ui/react";
import { JSX } from "react";
import Button from "@/components/Button";

interface LoginCardProps {
  title: JSX.Element;
  description: JSX.Element;
  buttonLabel: JSX.Element;
  onAuthenticate: () => void;
}

const LoginCard = ({
  title,
  description,
  buttonLabel,
  onAuthenticate,
}: LoginCardProps) => {
  return (
    <Stack gap="sm" width="full" maxWidth="md">
      <Card.Root width="full">
        <Card.Header gap="sm">
          <Card.Title>{title}</Card.Title>
          <Card.Description>{description}</Card.Description>
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
