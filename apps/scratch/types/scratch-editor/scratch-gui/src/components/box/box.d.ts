// https://github.com/scratchfoundation/scratch-gui/blob/develop/src/components/box/box.jsx
declare module "@scratch-submodule/packages/scratch-gui/src/components/box/box.jsx" {
  import { ComponentRef, FunctionComponent, ReactNode } from "react";

  const Box: FunctionComponent<{
    alignContent?:
      | "flex-start"
      | "flex-end"
      | "center"
      | "space-between"
      | "space-around"
      | "stretch";
    alignItems?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
    alignSelf?:
      | "auto"
      | "flex-start"
      | "flex-end"
      | "center"
      | "baseline"
      | "stretch";
    direction?: "row" | "row-reverse" | "column" | "column-reverse";
    element?: string;
    grow?: number;
    height?: number | string;
    width?: number | string;
    justifyContent?:
      | "flex-start"
      | "flex-end"
      | "center"
      | "space-between"
      | "space-around";
    shrink?: number;
    style?: Record<string, unknown>;
    basis?: number | "auto";
    wrap?: "nowrap" | "wrap" | "wrap-reverse";

    children?: ReactNode;
    className?: string;
    componentRef?: ComponentRef;

    [key: string]: unknown;
  }>;

  export default Box;
}
