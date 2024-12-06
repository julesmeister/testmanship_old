"use client";

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Check, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DragAndDropProps } from '@/types/exercises';

export default function DragAndDrop({ exercise, onComplete }: DragAndDropProps) {
  const [items, setItems] = useState(() => 
    [...exercise.items].sort(() => Math.random() - 0.5)
  );
  const [itemLocations, setItemLocations] = useState<Record<string, string[]>>(() => 
    exercise.targets.reduce((acc, target) => ({ ...acc, [target.id]: [] }), {})
  );
  const [showResults, setShowResults] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    if (sourceId === destId) return;

    const sourceItems = Array.from(itemLocations[sourceId] || []);
    const destItems = Array.from(itemLocations[destId] || []);
    const itemId = result.draggableId;

    // Remove from source if it exists there
    const sourceIndex = sourceItems.indexOf(itemId);
    if (sourceIndex !== -1) {
      sourceItems.splice(sourceIndex, 1);
    }

    // Add to destination at the specified index
    destItems.splice(destination.index, 0, itemId);

    // Update state with new locations
    const newLocations = {
      ...itemLocations,
      [sourceId]: sourceItems,
      [destId]: destItems,
    };
    setItemLocations(newLocations);

    // Check if all items have been placed
    const assignedItems = Object.values(newLocations).flat();
    const unassignedCount = items.length - assignedItems.length;

    if (unassignedCount === 0) {
      checkAnswers();
    }
  };

  const checkAnswers = () => {
    setShowResults(true);
    let correctCount = 0;

    // Check each target
    Object.entries(itemLocations).forEach(([targetId, itemIds]) => {
      itemIds.forEach(itemId => {
        const item = exercise.items.find(i => i.id === itemId);
        if (item?.correctTarget === targetId) {
          correctCount++;
        }
      });
    });

    const score = Math.round((correctCount / exercise.items.length) * 100);
    onComplete(score);
  };

  const getUnassignedItems = () => {
    const assignedItems = new Set(Object.values(itemLocations).flat());
    return items.filter(item => !assignedItems.has(item.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="text-gray-900 dark:text-gray-100 font-medium">
          {exercise.instruction}
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source items */}
            <Droppable droppableId="source">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg min-h-[100px]"
                >
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                    Available Items
                  </div>
                  {getUnassignedItems().length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-4 text-sm text-gray-500 dark:text-gray-400">
                      <Check className="h-6 w-6 mb-2 text-green-500" />
                      <p>All items have been placed!</p>
                      <p>Great job!</p>
                    </div>
                  ) : (
                    getUnassignedItems().map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm",
                              "border border-gray-200 dark:border-gray-700",
                              "hover:border-violet-300 dark:hover:border-violet-700"
                            )}
                          >
                            <GripVertical className="h-5 w-5 text-gray-400" />
                            <span>{item.content}</span>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Drop targets */}
            <div className="space-y-4">
              {exercise.targets.map((target) => (
                <div key={target.id} className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {target.label}
                  </div>
                  <Droppable droppableId={target.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "p-4 rounded-lg min-h-[100px] border-2 border-dashed",
                          "bg-gray-50 dark:bg-gray-900/50",
                          showResults && itemLocations[target.id].every(itemId => {
                            const item = exercise.items.find(i => i.id === itemId);
                            return item?.correctTarget === target.id;
                          })
                            ? "border-green-500/50"
                            : "border-gray-200 dark:border-gray-700"
                        )}
                      >
                        {itemLocations[target.id].map((itemId, index) => {
                          const item = items.find(i => i.id === itemId);
                          if (!item) return null; // Skip if item not found

                          const isCorrect = showResults && item.correctTarget === target.id;
                          
                          return (
                            <Draggable key={itemId} draggableId={itemId} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    "flex items-center gap-3 p-3 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm",
                                    "border transition-colors",
                                    !showResults && "hover:border-violet-300 dark:hover:border-violet-700",
                                    showResults && (
                                      isCorrect
                                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                        : "border-red-500 bg-red-50 dark:bg-red-900/20"
                                    )
                                  )}
                                >
                                  <GripVertical className="h-5 w-5 text-gray-400" />
                                  <span>{item.content}</span>
                                  {showResults && (
                                    isCorrect ? (
                                      <Check className="h-5 w-5 text-green-500 ml-auto" />
                                    ) : (
                                      <X className="h-5 w-5 text-red-500 ml-auto" />
                                    )
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
