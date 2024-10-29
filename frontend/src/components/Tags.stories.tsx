import Tag from "./Tag";
import Tags from "./Tags";

export default {
  component: Tags,
  title: "Tags",
  render: (args: Args) => (
    <Tags {...args}>
      <Tag id="1">Tag 1</Tag>
      <Tag id="2">Tag 2</Tag>
      <Tag id="3">Tag 3</Tag>
      <Tag id="4">Tag 4</Tag>
      <Tag id="5">Tag 5</Tag>
      <Tag id="6">Tag 6</Tag>
      <Tag id="7">Tag 7</Tag>
      <Tag id="8">Tag 8</Tag>
      <Tag id="9">Tag 9</Tag>
    </Tags>
  ),
};

type Args = Parameters<typeof Tags>[0];

export const Default = {
  args: {
    userId: 1,
  } as Args,
};
