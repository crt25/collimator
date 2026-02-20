import { Alert as ChakraAlert, Icon } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { ReactNode } from "react";

const Alert = ({
  title,
  description,
  icon,
}: {
  title?: ReactNode;
  description?: ReactNode;
  icon?: IconType;
}) => (
  <ChakraAlert.Root status="info" mb={4}>
    {icon && (
      <ChakraAlert.Indicator>
        <Icon as={icon} />
      </ChakraAlert.Indicator>
    )}
    <ChakraAlert.Content>
      {title && <ChakraAlert.Title>{title}</ChakraAlert.Title>}
      {description && (
        <ChakraAlert.Description>{description}</ChakraAlert.Description>
      )}
    </ChakraAlert.Content>
  </ChakraAlert.Root>
);

export default Alert;
