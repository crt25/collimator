import React from "react";

export const WithoutInteraction = ({
  children,
}: {
  children: React.ReactNode;
}) => <div className="non-interactive">{children}</div>;
