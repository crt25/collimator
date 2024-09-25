// https://github.com/scratchfoundation/scratch-gui/blob/develop/src/index.js
declare module "@scratch-submodule/scratch-gui/src/lib/hash-parser-hoc" {
  import { FunctionComponent, ReactNode } from "react";

  export const HashParserHOC: <T>(
    WrappedComponent: FunctionComponent<T>,
    localesOnly?: boolean
  ) => FunctionComponent<T>;

  export default HashParserHOC;
}
