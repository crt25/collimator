import {
  Button as ChakraButton,
  HStack,
  Icon,
  Box,
  Spinner,
  chakra,
} from "@chakra-ui/react";

import { LuCircleCheck, LuCircleX } from "react-icons/lu";

import {
  useCallback,
  useState,
  useRef,
  MouseEvent as MouseEventReact,
  ComponentProps,
} from "react";

export type ButtonProps = ComponentProps<typeof ChakraButton>;

const ButtonContent = chakra(HStack, {
  base: {
    gap: "sm",
  },
});

const Button = ({
  onClick: onClickFn,
  children,
  ...buttonProps
}: ButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean | null>(null);
  const enabled = useRef(true);

  const showPromiseResult = useCallback((isSuccessful: boolean) => {
    setIsLoading(false);
    setIsSuccessful(isSuccessful);

    setTimeout(() => {
      setIsSuccessful(null);

      // enable the button again
      enabled.current = true;
    }, 800);
  }, []);

  const onClick = useCallback(
    (e: MouseEventReact<HTMLButtonElement, MouseEvent>) => {
      if (!onClickFn || enabled.current === false) {
        return;
      }

      const returnValue = onClickFn(e) as unknown;

      if (returnValue instanceof Promise) {
        // prevent the user from clicking the spinning button
        enabled.current = false;

        setIsLoading(true);

        returnValue
          .then(() => {
            showPromiseResult(true);
          })
          .catch(() => {
            showPromiseResult(false);
          });
      }
    },
    [onClickFn, showPromiseResult],
  );

  return (
    <ChakraButton onClick={onClick} loading={isLoading} {...buttonProps}>
      <ButtonContent>
        <Box>{children}</Box>
        {isLoading && <Spinner data-testid="loading-spinner" size="sm" />}
        {isSuccessful === true && (
          <Icon data-testid="success-icon">
            <LuCircleCheck />
          </Icon>
        )}
        {isSuccessful === false && (
          <Icon data-testid="failure-icon">
            <LuCircleX />
          </Icon>
        )}
      </ButtonContent>
    </ChakraButton>
  );
};

export default Button;
