import { chakra } from "@chakra-ui/react";
import Button from "./Button";

export const DetailButton = chakra(Button, {
  base: {
    "&&": {
      backgroundColor: "transparent",
      color: "black",
      _hover: {
        backgroundColor: "transparent",
      },
    },
  },
});
