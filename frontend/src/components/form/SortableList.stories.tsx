import SortableListInput from "./SortableList";

export default { component: SortableListInput };

type Args = Parameters<
  typeof SortableListInput<{ id: number; name: string }>
>[0];

const sampleItems = [
  { id: 1, name: "Item 1" },
  { id: 2, name: "Item 2" },
  { id: 3, name: "Item 3" },
  { id: 4, name: "Item 4" },
];

export const Default = {
  args: {
    items: sampleItems,
    updateItems: (items) => console.log("Updated items:", items),
    children: (item) => (
      <div style={{ padding: "1rem", background: "gray" }}>{item.name}</div>
    ),
    testId: "sortable-list",
  } as Args,
};
