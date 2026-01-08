// https://github.com/scratchfoundation/scratch-gui/blob/develop/src/lib/error-boundary-hoc.jsx
declare module "@scratch-submodule/packages/scratch-gui/src/lib/error-boundary-hoc.jsx" {
  import { Component, ReactNode } from "react";

  export const HashParserHOC: <P, S, SS>(
    action: string
  ) => FunctionComponent<P, S, SS>;

  export default HashParserHOC;
}
