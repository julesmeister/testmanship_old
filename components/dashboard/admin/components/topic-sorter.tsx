"use client";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./sortable-item";
import { Card } from "@/components/ui/card";

interface TopicData {
  id: string;
  topic: string;
  description: string;
  exercise_types: string[];
}

interface TopicSorterProps {
  topics: TopicData[];
  setTopics: (topics: TopicData[]) => void;
}

export default function TopicSorter({ topics, setTopics }: TopicSorterProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTopics((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="space-y-4 ml-10">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={topics.map(topic => topic.id)}
          strategy={verticalListSortingStrategy}
        >
          {topics.map((topic) => (
            <SortableItem key={topic.id} id={topic.id}>
              <Card className="p-4 ">
                <h3 className="font-semibold text-foreground">{topic.topic}</h3>
                <p className="text-sm text-muted-foreground">{topic.description}</p>
              </Card>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
