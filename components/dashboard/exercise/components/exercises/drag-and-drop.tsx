"use client";

import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, GripVertical, AlignStartHorizontal, AlignVerticalJustifyStart, View, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DragAndDropProps } from '@/types/exercises';

export default function DragAndDrop({ exercise: exercise, onComplete }: DragAndDropProps) {
  // Memoize the exercise object to prevent unnecessary re-renders
  // Only updates when exercise.id changes, ensuring stable reference
  // This is crucial for maintaining state consistency during drag operations
  const stableExercise = useMemo(() => exercise, [exercise.id]);

  // Initialize items state with a randomized version of exercise items
  // useState with callback ensures this randomization only happens once during mount
  // The spread operator creates a new array to avoid mutating the original exercise items
  const [items, setItems] = useState(() => 
    [...stableExercise.items].sort(() => Math.random() - 0.5)
  );
  const [itemLocations, setItemLocations] = useState<Record<string, string[]>>(() => 
    stableExercise.targets.reduce((acc, target) => ({ ...acc, [target.id]: [] }), {})
  );
  const [showResults, setShowResults] = useState(false);
  const [expandedTargets, setExpandedTargets] = useState<Record<string, boolean>>({});
  const [activeView, setActiveView] = useState('lengthwise');

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
  };

  const checkAnswers = () => {
    // Check if all items are placed
    const allItemsPlaced = stableExercise.items.every(item => 
      Object.values(itemLocations).some(targetItems => 
        targetItems.includes(item.id)
      )
    );

    if (!allItemsPlaced) {
      // Optionally, you can show a toast or alert
      return;
    }

    setShowResults(true);
    let correctCount = 0;

    // Check each target
    Object.entries(itemLocations).forEach(([targetId, itemIds]) => {
      itemIds.forEach(itemId => {
        const item = stableExercise.items.find(i => i.id === itemId);
        if (item?.correctTarget === targetId) {
          correctCount++;
        }
      });
    });

    const score = Math.round((correctCount / stableExercise.items.length) * 100);
    onComplete(score, stableExercise.items.length);
  };

  const getUnassignedItems = () => {
    const assignedItems = new Set(Object.values(itemLocations).flat());
    return items.filter(item => !assignedItems.has(item.id));
  };

  const toggleTargetExpansion = (targetId: string) => {
    setExpandedTargets(prev => ({
      ...prev,
      [targetId]: !prev[targetId]
    }));
  };

  // Check if all items are placed
  // This memoized function ensures comprehensive item placement verification
  // Key aspects of the implementation:
  // 1. Uses exercise.items as the source of truth for total items
  // 2. Checks EVERY item against ALL target locations
  // 3. Ensures 100% placement before scoring
  // 
  // How it works:
  // - exercise.items.every(): Checks EACH item in the exercise
  // - Object.values(itemLocations).some(): Looks through ALL target locations
  // - targetItems.includes(item.id): Confirms the item is in at least one target
  // 
  // Example scenarios:
  // - Correct: All 10 items are distributed across targets
  // - Incorrect: 9/10 items placed, or an item left in the source
  const allItemsPlaced = useMemo(() => 
    stableExercise.items.every(item => 
      Object.values(itemLocations).some(targetItems => 
        targetItems.includes(item.id)
      )
    ), 
    [stableExercise.items, itemLocations]
  );

  // Reset exercise state when stableExercise changes (i.e., when a new exercise is loaded)
  useEffect(() => {
    console.log('Exercise has changed:', stableExercise.id);
    
    // Re-randomize items when exercise changes
    // Creates a fresh copy of items array and shuffles them
    setItems([...stableExercise.items].sort(() => Math.random() - 0.5));
    
    // Reset all target locations to empty arrays
    // Creates an object where each target.id maps to an empty array
    // Example: { target1: [], target2: [], ... }
    setItemLocations(
      stableExercise.targets.reduce((acc, target) => ({ ...acc, [target.id]: [] }), {})
    );
  }, [stableExercise]); // Only runs when stableExercise reference changes

  useEffect(() => {
    // Automatically check answers when all items are placed in their respective targets
    if (allItemsPlaced) {
      checkAnswers();
    }
  }, [allItemsPlaced]);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <GripVertical className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium ml-3">{stableExercise.instruction}</p>
          </div>
          <div className="flex space-x-2">
            <Tabs value={activeView} defaultValue="lengthwise" className="relative" onValueChange={setActiveView}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <TabsTrigger 
                  value="lengthwise" 
                  className={cn(
                    "text-sm font-medium transition-all",
                    { "bg-blue-500 text-white": activeView === 'lengthwise', "text-gray-600 dark:text-gray-300": activeView !== 'lengthwise' }
                  )}
                >
                  <AlignStartHorizontal className="w-5 h-5" />
                </TabsTrigger>
                <TabsTrigger 
                  value="crosswise" 
                  className={cn(
                    "text-sm font-medium transition-all",
                    { "bg-blue-500 text-white": activeView === 'crosswise', "text-gray-600 dark:text-gray-300": activeView !== 'crosswise' }
                  )}
                >
                  <AlignVerticalJustifyStart className="w-5 h-5" />
                  
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className={cn(
            activeView === 'crosswise' 
              ? "grid grid-cols-3 gap-4 auto-rows-start" 
              : "grid grid-cols-[1fr_1fr] gap-4"
          )}>
            {/* Drop targets */}
            {activeView === 'lengthwise' ? (
              <div className="space-y-4">
                {stableExercise.targets.map((target) => (
                  <div 
                    key={target.id} 
                    className="space-y-2"
                  >
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {target.label}
                    </div>
                    <Droppable droppableId={target.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            "p-4 rounded-lg min-h-[100px] border-2 border-dashed relative",
                            "bg-gray-50 dark:bg-gray-900/50",
                            stableExercise.targets.length > 3 && "min-h-[150px]",
                            showResults && itemLocations[target.id].every(itemId => {
                              const item = stableExercise.items.find(i => i.id === itemId);
                              return item?.correctTarget === target.id;
                            })
                              ? "border-green-500/50"
                              : "border-gray-200 dark:border-gray-700"
                          )}
                        >
                          {itemLocations[target.id]?.length > 0 && (
                            <div className="absolute top-2 right-2 flex items-center gap-2">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300">
                                {itemLocations[target.id].length} items
                              </span>
                              {itemLocations[target.id].length > 5 && (
                                <button
                                  onClick={() => toggleTargetExpansion(target.id)}
                                  className="text-xs text-violet-600 dark:text-violet-400 hover:underline focus:outline-none"
                                >
                                  {expandedTargets[target.id] ? 'Show Less' : 'Show All'}
                                </button>
                              )}
                            </div>
                          )}
                          {(expandedTargets[target.id] ? itemLocations[target.id] : itemLocations[target.id]?.slice(0, 5))?.map((itemId, index) => {
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
                                      stableExercise.targets.length > 3 && "p-2",
                                      !showResults && "hover:border-violet-300 dark:hover:border-violet-700",
                                      showResults && (
                                        isCorrect
                                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                          : "border-red-500 bg-red-50 dark:bg-red-900/20"
                                      )
                                    )}
                                  >
                                    <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div className={cn(
                                      "flex-1 min-w-0", 
                                      stableExercise.targets.length > 3 && "text-sm"
                                    )}>
                                      <span className="block truncate">{item.content}</span>
                                      {showResults && !isCorrect && (
                                        <div className={cn(
                                          "text-xs text-gray-500 dark:text-gray-400 mt-1",
                                          stableExercise.targets.length > 3 && "text-[10px]"
                                        )}>
                                          Should be in: {stableExercise.targets.find(t => t.id === item.correctTarget)?.label}
                                        </div>
                                      )}
                                    </div>
                                    {showResults && (
                                      isCorrect ? (
                                        <Check className="h-4 w-4 text-green-500 ml-auto flex-shrink-0" />
                                      ) : (
                                        <X className="h-4 w-4 text-red-500 ml-auto flex-shrink-0" />
                                      )
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {itemLocations[target.id]?.length > 5 && (
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                              {itemLocations[target.id]?.length - 5} more items hidden
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            ) : (
              // Crosswise view - render targets directly in grid
              stableExercise.targets.map((target) => (
                <div 
                  key={target.id} 
                  className={cn(
                    "space-y-2",
                    stableExercise.targets.length > 3 && "w-full",
                    "self-start"
                  )}
                >
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {target.label}
                  </div>
                  <Droppable droppableId={target.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "p-4 rounded-lg min-h-[100px] border-2 border-dashed relative",
                          "bg-gray-50 dark:bg-gray-900/50",
                          stableExercise.targets.length > 3 && "min-h-[150px]",
                          showResults && itemLocations[target.id].every(itemId => {
                            const item = stableExercise.items.find(i => i.id === itemId);
                            return item?.correctTarget === target.id;
                          })
                            ? "border-green-500/50"
                            : "border-gray-200 dark:border-gray-700"
                        )}
                      >
                        {itemLocations[target.id]?.length > 0 && (
                          <div className="absolute top-2 right-2 flex items-center gap-2">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300">
                              {itemLocations[target.id].length} items
                            </span>
                            {itemLocations[target.id].length > 5 && (
                              <button
                                onClick={() => toggleTargetExpansion(target.id)}
                                className="text-xs text-violet-600 dark:text-violet-400 hover:underline focus:outline-none"
                              >
                                {expandedTargets[target.id] ? 'Show Less' : 'Show All'}
                              </button>
                            )}
                          </div>
                        )}
                        {(expandedTargets[target.id] ? itemLocations[target.id] : itemLocations[target.id]?.slice(0, 5))?.map((itemId, index) => {
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
                                    stableExercise.targets.length > 3 && "p-2",
                                    !showResults && "hover:border-violet-300 dark:hover:border-violet-700",
                                    showResults && (
                                      isCorrect
                                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                        : "border-red-500 bg-red-50 dark:bg-red-900/20"
                                    )
                                  )}
                                >
                                  <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <div className={cn(
                                    "flex-1 min-w-0", 
                                    stableExercise.targets.length > 3 && "text-sm"
                                  )}>
                                    <span className="block truncate">{item.content}</span>
                                    {showResults && !isCorrect && (
                                      <div className={cn(
                                        "text-xs text-gray-500 dark:text-gray-400 mt-1",
                                        stableExercise.targets.length > 3 && "text-[10px]"
                                      )}>
                                        Should be in: {stableExercise.targets.find(t => t.id === item.correctTarget)?.label}
                                      </div>
                                    )}
                                  </div>
                                  {showResults && (
                                    isCorrect ? (
                                      <Check className="h-4 w-4 text-green-500 ml-auto flex-shrink-0" />
                                    ) : (
                                      <X className="h-4 w-4 text-red-500 ml-auto flex-shrink-0" />
                                    )
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {itemLocations[target.id]?.length > 5 && (
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                            {itemLocations[target.id]?.length - 5} more items hidden
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))
            )}

            {/* Source items */}
            <div className={cn(
              "space-y-2",
              activeView === 'lengthwise' && "h-fit",
              activeView === 'crosswise' && "col-span-3 w-full"
            )}>
              <Droppable droppableId="source">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "space-y-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg min-h-[100px]",
                      activeView === 'crosswise' && "!space-y-0 grid grid-cols-3 gap-4"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-medium text-gray-500 dark:text-gray-400 mb-4",
                      activeView === 'crosswise' && "col-span-3"
                    )}>
                      Available Items
                    </div>
                    {getUnassignedItems().length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 animate-fadeIn col-span-3">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-green-500/30 rounded-full blur animate-pulse" />
                          <Check className="h-8 w-8 text-green-500 animate-bounce relative" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">🎉</span>
                          <h3 className="font-semibold text-base text-gray-700 dark:text-gray-300">
                            All items have been placed!
                          </h3>
                          <span className="text-xl">🎉</span>
                        </div>
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                          Great job!
                        </p>
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
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
