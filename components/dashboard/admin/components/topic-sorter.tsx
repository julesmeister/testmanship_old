"use client";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./sortable-item";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { Plus, Loader2 } from "@/components/icons";
import { useAddTopic } from "@/hooks/useAddTopic";
import { useGrammarCategories } from '@/hooks/useGrammarCategories';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { SupabaseClient } from "@supabase/supabase-js";
import { getExerciseTypes } from "@/lib/utils/exercise-templates";
import { useState, useEffect } from "react";
import useUpdateOrderIndex from '@/hooks/useUpdateOrderIndex'; // Adjust the import path as necessary
import { toast } from 'sonner';
interface TopicData {
  id: string;
  topic: string;
  description: string;
  exercise_types: string[];
  difficulty_level?: string;
  order_index: number;
}

interface TopicSorterProps {
  topics: TopicData[];
  setTopics: (topics: TopicData[]) => void;
  supabase: SupabaseClient;
  selectedLevel: string;
}

const formSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  description: z.string().min(1, "Description is required"),
  exercise_types: z.array(z.string()).min(1, "At least one exercise type is required"),
  grammar_category: z.string().min(1, "Grammar category is required"),
  difficulty_level: z.string().min(1, "Difficulty level is required"),
});

export default function TopicSorter({ topics, setTopics, supabase, selectedLevel }: TopicSorterProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { isOpen, setIsOpen, isLoading, addTopic } = useAddTopic(supabase, selectedLevel);
  const { grammarCategories, loading: loadingCategories, error: categoriesError } = useGrammarCategories(supabase);

  useEffect(() => {
    console.log('Fetched grammar categories:', grammarCategories);
    if (categoriesError) {
      console.error('Error fetching grammar categories:', categoriesError);
    }
  }, [grammarCategories, categoriesError]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      description: "",
      exercise_types: [],
      grammar_category: "",
      difficulty_level: selectedLevel,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const success = await addTopic(values);
    if (success) {
      form.reset();
    }
  };

  function TopicSorter() {
    const { updateOrderIndex, isLoading, error, success } = useUpdateOrderIndex(supabase, selectedLevel); // Pass supabase to the hook

    function handleDragEnd(event: any) {
      const { active, over } = event;

      if (active.id !== over.id) {
        const items = Array.from(topics);
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // Move the item in the array
        const movedItem = items[oldIndex];
        items.splice(oldIndex, 1);
        items.splice(newIndex, 0, movedItem);

        // Update the order_index for each topic
        const updatedTopics = items.map((item, index) => ({
          ...item,
          order_index: index,
        }));

        setTopics(updatedTopics); // Set the updated topics

        // Update the order_index in Supabase
        updateOrderIndex(updatedTopics);
        if(success) {
          toast.success('Topics reordered successfully!', { duration: 2000 });
        }
      }
    }

    return (
      <div className="space-y-4 ml-10">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex justify-end mb-4">
            <DialogTrigger asChild>
              <Button variant="outline" className="hover:bg-primary/10">
                <Plus className="w-4 h-4 mr-2" /> Add New Topic
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader className="space-y-3 pb-4 border-b">
              <DialogTitle className="text-2xl font-semibold">Add New Topic</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Create a new topic and specify its exercise types.
              </p>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Topic Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter topic name" 
                            {...field}
                            className="focus-visible:ring-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter topic description" 
                            {...field}
                            className="min-h-[100px] focus-visible:ring-2"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Provide a clear description of what this topic covers.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="grammar_category"
                    render={({ field }) => {
                      const [inputValue, setInputValue] = useState(field.value);
                      const [showDropdown, setShowDropdown] = useState(false);
                      const filteredCategories = grammarCategories.filter(category => 
                        category.toLowerCase().includes(inputValue.toLowerCase())
                      );

                      const handleCategorySelect = (category) => {
                        setInputValue(category);
                        setShowDropdown(false); 
                        field.onChange(category);
                      };

                      return (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Grammar Category</FormLabel>
                          <FormControl>
                            <> 
                              <Input
                                value={inputValue}
                                onFocus={() => setShowDropdown(true)} 
                                onChange={(e) => {
                                  setInputValue(e.target.value);
                                  setShowDropdown(true); 
                                }}
                              />
                              {showDropdown && filteredCategories.length > 0 && (
                                <ul className="bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                                  {inputValue && !filteredCategories.includes(inputValue) && (
                                    <li className="cursor-pointer p-2 hover:bg-gray-100" onClick={() => handleCategorySelect(inputValue)}>
                                      {inputValue}
                                    </li>
                                  )}
                                  {filteredCategories.map((category) => (
                                    <li
                                      key={category}
                                      className="cursor-pointer p-2 hover:bg-gray-100"
                                      onClick={() => handleCategorySelect(category)}
                                    >
                                      {category}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="exercise_types"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-semibold">Exercise Types</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={getExerciseTypes().map(type => ({
                              value: type,
                              label: type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select exercise types..."
                            className="focus-visible:ring-2"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Select one or more exercise types for this topic.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={topics.map(topic => topic.id)}
            strategy={verticalListSortingStrategy}
          >
            {topics.sort((a, b) => a.order_index - b.order_index).map(topic => (
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

  return <TopicSorter />;
}
