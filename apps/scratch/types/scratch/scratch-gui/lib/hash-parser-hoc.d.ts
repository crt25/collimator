// https://github.com/scratchfoundation/scratch-gui/blob/develop/src/lib/app-state-hoc.jsx
declare module "@scratch-submodule/scratch-gui/src/lib/hash-parser-hoc" {
  import { FunctionComponent, ReactNode } from "react";

  export const HashParserHOC: <P, S, SS>(
    WrappedComponent: Component<P, S, SS>,
    localesOnly?: boolean,
  ) => Component<P, S, SS>;

  export default HashParserHOC;
}
