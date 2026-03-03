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
  disabled?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id, disabled: props.disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(props.disabled ? {} : listeners)}
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
  enableSorting = true,
}: {
  items: TItem[];
  updateItems: (items: TItem[]) => void;
  children: (
    item: TItem,
    index: number,
    enableSorting: boolean,
  ) => React.ReactNode;
  testId?: string;
  noGap?: boolean;
  enableSorting?: boolean;
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
                disabled={!enableSorting}
                testId={`${testId}-item-${item.id}`}
              >
                {renderItemContent(item, index, enableSorting)}
              </SortableItem>
            ))}
          </ItemList>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SortableListInput;
