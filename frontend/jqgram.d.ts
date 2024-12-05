module "jqgram" {
  type Input<Node> = {
    root: Node;
    lfn: (node: Node) => string;
    cfn: (node: Node) => Node[];
  };

  export const jqgram: {
    distance: <Node>(
      a: Input<Node>,
      b: Input<Node>,
      options: { p: number; q: number },
      callback: (result: { distance: number }) => void,
    ) => void;
  };
}
