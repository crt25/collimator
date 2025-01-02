import React, { useEffect, useState } from "react";
import VM from "scratch-vm";
import { patchScratchVm } from "../vm";
import { useEmbeddedScratch } from "../hooks/useEmbeddedScratch";
import { InjectedIntl, injectIntl } from "react-intl";
import { basePath } from "..";
import { useDispatch } from "react-redux";
import scratchMessages from "scratch-l10n/locales/editor-msgs";
import { setLocales } from "../scratch/scratch-gui/src/reducers/locales";
import en from "../content/compiled-locales/en.json";
import fr from "../content/compiled-locales/fr.json";

const customLocales: { [locale: string]: { [key: string]: string } } =
  Object.fromEntries(
    Object.entries({
      en,
      fr,
    }).map(([locale, messages]) => [
      locale,
      Object.fromEntries(
        Object.entries(messages).map(([key, message]) => [
          key,
          message[0].value,
        ]),
      ),
    ]),
  );

// This is a function component that can use hooks and receives the intl parameter.
// This allows us to configure the CRT parameters with the intl parameter available
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const InternalCrtHoc = <T extends {}>(Component: React.ComponentType<T>) => {
  return function CrtHoc(props: T & { intl: InjectedIntl }) {
    const [vm, setVm] = useState<VM | null>(null);

    const dispatch = useDispatch();

    const { hasLoaded } = useEmbeddedScratch(vm, props.intl);

    useEffect(() => {
      // merge our own locales with scratch's
      const mergedMessagesByLocale = Object.fromEntries(
        Object.entries(scratchMessages).map(([locale, messages]) => [
          locale,
          locale in customLocales
            ? {
                ...messages,
                ...JSON.parse(JSON.stringify(customLocales[locale])),
              }
            : messages,
        ]),
      );

      dispatch(setLocales(mergedMessagesByLocale));
    }, []);

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
