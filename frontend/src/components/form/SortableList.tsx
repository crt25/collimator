import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { createListCollection, Listbox } from "@chakra-ui/react";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useMemo } from "react";
import styled from "@emotion/styled";

const SortableListWrapper = styled.div`
  margin-bottom: 1rem;
`;

const SortableItem = <T extends { id: number }>(props: {
  testId?: string;
  item: {
    value: string;
    label: string;
    item: T;
    index: number;
  };
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.item.item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <Listbox.Item
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid={props.testId}
      item={props.item}
    >
      {props.children}
    </Listbox.Item>
  );
};

const SortableListInput = <TItem extends { id: number }>({
  items,
  updateItems,
  children: renderItemContent,
  testId,
}: {
  items: TItem[];
  updateItems: (items: TItem[]) => void;
  children: (item: TItem, index: number) => React.ReactNode;
  testId?: string;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // add a constraint so that elements within are still clickable, see https://github.com/clauderic/dnd-kit/issues/800#issuecomment-2426989739
      activationConstraint: { distance: 5 },
    }),
  );

  const collection = useMemo(
    () =>
      // Create a collection for the Listbox component
      createListCollection({
        items: items.map((item, index) => ({
          value: item.id.toString(),
          label: item.id.toString(),
          item,
          index,
        })),
      }),
    [items],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        updateItems(arrayMove([...items], oldIndex, newIndex));
      }
    },
    [updateItems, items],
  );

  return (
    <SortableListWrapper data-testid={testId}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <Listbox.Root collection={collection}>
            <Listbox.Content>
              {collection.items.map((collectionItem) => (
                <SortableItem
                  key={collectionItem.item.id}
                  testId={`${testId}-item-${collectionItem.item.id}`}
                  item={collectionItem}
                >
                  <Listbox.ItemText>
                    {renderItemContent(
                      collectionItem.item,
                      collectionItem.index,
                    )}
                  </Listbox.ItemText>
                </SortableItem>
              ))}
            </Listbox.Content>
          </Listbox.Root>
        </SortableContext>
      </DndContext>
    </SortableListWrapper>
  );
};

export default SortableListInput;
