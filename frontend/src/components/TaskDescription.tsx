import { chakra } from "@chakra-ui/react";

const TaskDescription = chakra("div", {
  base: {
    flexGrow: 1,
    overflowY: "scroll",
  },
});

export default TaskDescription;
