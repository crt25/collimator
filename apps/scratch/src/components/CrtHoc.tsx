import React, { useCallback, useState } from "react";
import VM from "scratch-vm";
import { patchScratchVm } from "../vm";
import { useEmbeddedScratch } from "../hooks/useEmbeddedScratch";
import { InjectedIntl, injectIntl } from "react-intl";
import { basePath } from "..";

// This is a function component that can use hooks and receives the intl parameter.
// This allows us to configure the CRT parameters with the intl parameter available
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const InternalCrtHoc = <T extends {}>(Component: React.ComponentType<T>) => {
  return function CrtHoc(
    props: T & { reportProgress?: boolean; intl: InjectedIntl },
  ) {
    const [vm, setVm] = useState<VM | null>(null);

    const { hasLoaded, sendRequest } = useEmbeddedScratch(vm, props.intl);

    const reportProgress = useCallback(
      (totalAssertions: number, passedAssertions: number) =>
        sendRequest({
          procedure: "reportProgress",
          arguments: {
            totalTests: totalAssertions,
            passedTests: passedAssertions,
          },
        }),
      [sendRequest],
    );

    if (!hasLoaded) {
      return null;
    }

    return (
      <Component
        {...props}
        onVmInit={(vm: VM) => {
          setVm(vm);
          patchScratchVm(vm);
        }}
        onTaskProgress={props.reportProgress && reportProgress}
        basePath={`${basePath}/`}
      />
    );
  };
};

// This HOC injects the intl parameter and wraps the passed component with the above function component.
// We do this because this is a class component (the old version of react-intl only supports this) and
// we want to use function components wherever possible (also required for hooks).
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const CrtHoc = <T extends {}>(Component: React.ComponentType<T>) => {
  const CrtComponent = InternalCrtHoc(Component);

  const intlClass = class IntlComponent extends React.Component<
    T & { intl: InjectedIntl }
  > {
    render() {
      return <CrtComponent {...this.props} />;
    }
  };

  return injectIntl(intlClass);
};

export default CrtHoc;
