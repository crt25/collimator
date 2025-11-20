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
import { CSS } from "@dnd-kit/utilities";
import { useCallback } from "react";
import styled from "@emotion/styled";

const ItemList = styled.div<{ noGap?: boolean }>`
  display: flex;
  flex-direction: column;

  gap: ${(props: { noGap?: boolean }) => (props.noGap ? "0" : "1rem")};
`;

const SortableItem = (props: {
  id: number | string;
  testId?: string;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid={props.testId}
    >
      {props.children}
    </div>
  );
};

const SortableListInput = <TItem extends { id: number | string }>({
  items,
  updateItems,
  children: renderItemContent,
  testId,
  noGap,
}: {
  items: TItem[];
  updateItems: (items: TItem[]) => void;
  children: (item: TItem, index: number) => React.ReactNode;
  testId?: string;
  noGap?: boolean;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // add a constraint so that elements within are still clickable, see https://github.com/clauderic/dnd-kit/issues/800#issuecomment-2426989739
      activationConstraint: { distance: 5 },
    }),
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
    <div data-testid={testId}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ItemList noGap={noGap}>
            {items.map((item, index) => (
              <SortableItem
                key={`${item.id}`}
                id={item.id}
                testId={`${testId}-item-${item.id}`}
              >
                {renderItemContent(item, index)}
              </SortableItem>
            ))}
          </ItemList>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SortableListInput;
