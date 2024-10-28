/**
 * This component is a no-op and should never be used except by the DisableSSR component.
 */
const DisableSSRChildren = ({ children }: { children?: React.ReactNode }) =>
  children;

export default DisableSSRChildren;
