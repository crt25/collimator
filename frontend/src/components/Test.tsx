import { Button, Stack } from "react-bootstrap";

const Test = () => (
  <Stack direction="horizontal" gap={2}>
    <Button as="a" variant="primary">
      Button as link
    </Button>
    <Button as="a" variant="success">
      Button as link
    </Button>
  </Stack>
);

export default Test;
