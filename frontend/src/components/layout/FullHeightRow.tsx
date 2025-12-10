import { Grid } from "@chakra-ui/react";
import React from "react";

const FullHeightRow = ({ children }: { children: React.ReactNode }) => {
  return (
    <Grid templateColumns="repeat(12, 1fr)" gap={4}>
      {children}
    </Grid>
  );
};

export default FullHeightRow;
