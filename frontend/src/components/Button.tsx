import {
  Button as ChakraButton,
  HStack,
  Icon,
  Box,
  Spinner,
} from "@chakra-ui/react";

import { LuCircleCheck, LuCircleX } from "react-icons/lu";

import {
  useCallback,
  useState,
  useRef,
  useMemo,
  MouseEvent as MouseEventReact,
  DetailedHTMLProps,
  ButtonHTMLAttributes,
} from "react";
import styled from "@emotion/styled";
import { isNonNull } from "@/utilities/is-non-null";

export enum ButtonVariant {
  primary = "primary",
  secondary = "secondary",
  danger = "danger",
}

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: ButtonVariant;
  active?: boolean;
};

const colorsByVariant = {
  [ButtonVariant.primary]: {
    bgColor: "var(--button-background-color)",
    fgColor: "var(--button-foreground-color)",
  },
  [ButtonVariant.secondary]: {
    bgColor: "var(--button-secondary-background-color)",
    fgColor: "var(--button-secondary-foreground-color)",
  },
  [ButtonVariant.danger]: {
    bgColor: "var(--button-danger-background-color)",
    fgColor: "var(--button-danger-foreground-color)",
  },
};

const StyledButton = styled(ChakraButton)<{ bgColor: string; fgColor: string }>`
  border-radius: var(--border-radius);
  background-color: ${(props) => props.bgColor};
  color: ${(props) => props.fgColor};
  padding: 0.5rem 1rem;

  &:hover {
    background-color: var(--accent-color-highlight);
  }

  &.active {
    background-color: var(--accent-color-highlight);
  }
`;

const ButtonContent = styled(HStack)`
  gap: 0.75rem;
`;

const Button = ({
  onClick: onClickFn,
  children,
  variant,
  active,
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

  const className = useMemo(
    () =>
      [active ? "active" : null, buttonProps.className ?? null]
        .filter(isNonNull)
        .join(" "),
    [buttonProps.className, active],
  );

  const { bgColor, fgColor } =
    colorsByVariant[variant ?? ButtonVariant.primary];

  return (
    <StyledButton
      onClick={onClick}
      loading={isLoading}
      className={className}
      bgColor={bgColor}
      fgColor={fgColor}
      {...buttonProps}
    >
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
    </StyledButton>
  );
};

export default Button;
