import styled from "@emotion/styled";
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  MouseEvent as MouseEventReact,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { isNonNull } from "@/utilities/is-non-null";
import ProgressSpinner from "./ProgressSpinner";

export enum ButtonVariant {
  primary = "primary",
  secondary = "secondary",
  danger = "danger",
}

const colorsByVariant: {
  [key in ButtonVariant]: {
    background: string;
    foreground: string;
  };
} = {
  [ButtonVariant.primary]: {
    background: "--button-background-color",
    foreground: "--button-foreground-color",
  },
  [ButtonVariant.secondary]: {
    background: "--button-secondary-background-color",
    foreground: "--button-secondary-foreground-color",
  },
  [ButtonVariant.danger]: {
    background: "--button-danger-background-color",
    foreground: "--button-danger-foreground-color",
  },
};

const WrapperComponentByVariant = Object.fromEntries(
  Object.entries(colorsByVariant).map(([variant, colors]) => [
    variant,
    styled.div`
      --btn-bg-color: var(${colors.background});
      --btn-bg-color-hover: color-mix(
        in srgb,
        var(${colors.background}),
        #000 15%
      );

      --btn-fg-color: var(${colors.foreground});

      /* if direct child of a button group with a sibling -> no border radius */
      &:is(.btn-group > div):has(+ *) button {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      &:is(.btn-group > div) + * button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    `,
  ]),
);

const StyledButton = styled.button`
  position: relative;

  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);

  border: none;

  background-color: var(--btn-bg-color);
  color: var(--btn-fg-color);

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  &.active,
  &:hover {
    background-color: var(--btn-bg-color-hover);
  }

  &:disabled {
    opacity: 0.65;
  }
`;

const ButtonState = styled.div`
  // the loading spinner / checkmark should never take more than the minimal space
  flex-grow: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .icon {
    background-color: #fff;
    color: var(--btn-state-color);
    border-radius: 50%;
  }

  .p-progress-spinner {
    width: 1.25rem;
    height: 1.25rem;

    svg circle {
      stroke-width: 8;
      stroke: #fff !important;
    }
  }
`;

const ButtonChildren = styled.div`
  flex-grow: 1;
`;

const Success = styled.div`
  --btn-state-color: var(--success-color);
`;
const Failure = styled.div`
  --btn-state-color: var(--error-color);
`;

const Button = (
  props: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    variant?: ButtonVariant;
    active?: boolean;
  },
) => {
  const {
    onClick: onClickFn,
    children,
    variant,
    active,
    ...buttonProps
  } = props;

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

  const WrapperComponent = useMemo(
    () => WrapperComponentByVariant[variant ?? ButtonVariant.primary],
    [variant],
  );

  const className = useMemo(
    () =>
      [active ? "active" : null, buttonProps.className ?? null]
        .filter(isNonNull)
        .join(" "),
    [buttonProps.className, active],
  );

  return (
    <WrapperComponent>
      <StyledButton {...buttonProps} className={className} onClick={onClick}>
        <ButtonChildren>{children}</ButtonChildren>
        {(isLoading || isSuccessful !== null) && (
          <ButtonState>
            {isLoading ? (
              <ProgressSpinner />
            ) : isSuccessful === true ? (
              <Success>
                <FontAwesomeIcon icon={faCheckCircle} className="icon" />
              </Success>
            ) : isSuccessful === false ? (
              <Failure>
                <FontAwesomeIcon icon={faTimesCircle} className="icon" />
              </Failure>
            ) : null}
          </ButtonState>
        )}
      </StyledButton>
    </WrapperComponent>
  );
};

export default Button;
