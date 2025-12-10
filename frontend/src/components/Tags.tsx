import { chakra } from "@chakra-ui/react";

const Tags = chakra("div", {
  base: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "sm",
  },
});

export default Tags;
