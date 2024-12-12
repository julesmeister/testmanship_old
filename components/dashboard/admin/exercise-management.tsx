"use client";

import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getExerciseTypes, getExerciseTemplate } from '@/lib/utils/exercise-templates';
import { Save, RotateCcw, Trash2, Wand2 } from "lucide-react";
import { DifficultyLevel } from "@/types/difficulty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import cn from 'classnames';
import { useExerciseContent } from '@/hooks/useExerciseContent';
import { useSaveExerciseContent } from '@/hooks/useSaveExerciseContent';
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useExerciseFilters } from '@/stores/exercise-filters';
import { any } from 'zod';
import { wrap } from 'module';
import EditorComponent from './components/editor';
import TopicSorter from './components/topic-sorter';
import { useLanguageStore } from '@/stores/language';

interface ExerciseManagementProps {
  supabase: SupabaseClient;
}

interface TopicData {
  id: string;
  topic: string;
  description: string;
  exercise_types: string[];
  order_index: number;
}

export default function ExerciseManagement({ supabase }: ExerciseManagementProps) {
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [jsonContent, setJsonContent] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [allContentsOfThisType, setAllContentsOfThisType] = useState<string>('');
  const [contentToEdit, setContentToEdit] = useState<string>('');
  const [contentToEditId, setContentToEditId] = useState<string>('');
  const [activeAccordion, setActiveAccordion] = useState("exercise-types");
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | null>(null);
  const [showTopicSorter, setShowTopicSorter] = useState(false);
  const { selectedLevel, setSelectedLevel, selectedTopic, setSelectedTopic } = useExerciseFilters();
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [activeTab, setActiveTab] = useState<"template" | "generated" | "edit">("template");
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');
  const [selectedTopicOfIndividualExercise, setSelectedTopicOfIndividualExercise] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { selectedLanguageId, languages } = useLanguageStore();

  const { generateContent } = useExerciseContent();
  const { saveContent, isSaving } = useSaveExerciseContent();

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      // First get all exercises
      const lang = languages.find(lang => lang.id === selectedLanguageId)?.name || 'German';
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('id, topic, description, exercise_types, order_index')
        .eq('lang', lang);

      if (exercisesError) throw exercisesError;

      // Then get exercise content for the selected topic if any
      let exerciseContent: any[] = [];
      if (selectedTopic) {
        const exerciseIds = exercises
          .filter(ex => ex.topic === selectedTopic)
          .map(ex => ex.id);

        const { data: content, error: contentError } = await supabase
          .from('exercise_content')
          .select('*')
          .in('exercise_id', exerciseIds);
        
        if (contentError) throw contentError;
        exerciseContent = content || [];
      }

      // Process exercises into topics
      const topicsMap = exercises.reduce((acc: Record<string, TopicData>, curr, index) => {
        if (!acc[curr.topic]) {
          acc[curr.topic] = {
            id: curr.id,
            topic: curr.topic,
            description: curr.description,
            exercise_types: curr.exercise_types || [],
            order_index: curr.order_index || 0,   
          };
        } else {
          // Keep the existing id and update exercise_types
          acc[curr.topic].exercise_types = Array.from(new Set([
            ...(acc[curr.topic].exercise_types || []),
            ...(curr.exercise_types || [])
          ]));
        }
        return acc;
      }, {} as Record<string, TopicData>);

      setTopics(Object.values(topicsMap));
      
      // Update exercise content if topic is selected
      if (selectedTopic && exerciseContent.length > 0) {
        setAllContentsOfThisType(JSON.stringify(exerciseContent, null, 2));
      } else if (selectedTopic) {
        setAllContentsOfThisType('[]');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [selectedTopic]);

  useEffect(() => {
    if (selectedLevel) {
      fetchExercises();
    } else {
      setTopics([]);
    }
  }, [selectedLevel]);

  const handleSave = async (isUpdate: boolean = false) => {
    try {
      // Validate JSON and topic
      const contentToSave = activeTab === "edit" ? allContentsOfThisType : generatedContent;

      // Topic should not be empty
      if (activeTab !== "edit" && !selectedTopicOfIndividualExercise.trim()) {
        toast.error('Topic is required');
        return;
      }

      // Topic should not exist before creating
      if (activeTab !== "edit" && topics.some(topic => topic.topic === selectedTopicOfIndividualExercise)) {
        toast.error('Please choose another topic, this topic already exists');
        return;
      }

      // Get the first exercise ID for the selected topic
      const exerciseIds = topics
        .filter(topic => topic.topic === selectedTopic)
        .map(topic => topic.id);

      await saveContent({
        supabase,
        exerciseId: activeTab === "edit" ? contentToEditId : (exerciseIds[0] || ''),
        content: activeTab === "edit" ? JSON.parse(contentToEdit) : JSON.parse(contentToSave),
        update: activeTab === "edit",
        topic: selectedTopicOfIndividualExercise ?? 'A1',
        exerciseType: selectedConfig || '', // Default to conjugation-tables if no config selected
      });
      fetchExercises();
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const handleReset = () => {
    setJsonContent("");
  };

  const handleGenerateContent = async () => {
    if (selectedConfig && selectedTopic && selectedLevel) {
      await generateContent({
        template: jsonContent,
        exerciseType: selectedConfig,
        topic: selectedTopic,
        description: topics.find(t => t.topic === selectedTopic)?.description || '',
        difficultyLevel: selectedLevel,
        additionalInstructions: additionalInstructions,
        onContentGenerated: (content) => {
          setGeneratedContent(content);
          setActiveTab("generated");
        }
      });
    } else {
      toast.error('Please select a topic, difficulty level, and exercise type');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Column 1: Form Controls */}
          <div className="col-span-3">
            <Accordion 
              type="single" 
              value={activeAccordion}
              onValueChange={setActiveAccordion}
              defaultValue="exercise-types"
            >
              <AccordionItem value="exercise-types">
                <AccordionTrigger>Exercise Types</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {getExerciseTypes()
                      .filter(type => {
                        if (!selectedTopic) return true;
                        const topicData = topics.find(t => t.topic === selectedTopic);
                        return topicData ? topicData.exercise_types
                          .map(t => t.toLowerCase().replace(/\s+/g, '-'))
                          .includes(type.toLowerCase().replace(/\s+/g, '-')) : false;
                      })
                      .map((type) => (
                        <Button
                          key={type}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start px-2 py-1 text-sm font-medium",
                            "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                            "text-zinc-900 dark:text-white",
                            selectedConfig === type && "bg-zinc-100 dark:bg-zinc-800"
                          )}
                          onClick={() => {
                            setShowTopicSorter(false);
                            setSelectedConfig(type);
                            setJsonContent(JSON.stringify(getExerciseTemplate(type), null, 2));
                            setGeneratedContent('');
                            setSelectedTopicOfIndividualExercise('');
                            setAdditionalInstructions('');
                          }}
                        >
                          {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Button>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="sorting">
                <AccordionTrigger onClick={() => setActiveAccordionItem("sorting")}>
                  Order of Exercises
                </AccordionTrigger>
                <AccordionContent>
                <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setShowTopicSorter(true)}
                    >
                      Sort and Manage
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="scoring">
                <AccordionTrigger>Scoring Rules</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedConfig("scoring");
                        setJsonContent(JSON.stringify({
                          type: "scoring",
                          config: {
                            points: 10,
                            timeLimit: 300,
                            passingScore: 70
                          }
                        }, null, 2));
                      }}
                    >
                      Default Scoring
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Column 2: JSON Editor */}
          <div className="col-span-6">
            {showTopicSorter && (
              <TopicSorter
                topics={topics}
                setTopics={setTopics}
                supabase={supabase}
                selectedLevel={selectedLevel || 'A1'}
              />
            )}
            {!showTopicSorter && (
              <EditorComponent
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                jsonContent={jsonContent}
                setJsonContent={setJsonContent}
                generatedContent={generatedContent}
                setGeneratedContent={setGeneratedContent}
                selectedTopicOfIndividualExercise={selectedTopicOfIndividualExercise}
                setSelectedTopicOfIndividualExercise={setSelectedTopicOfIndividualExercise}
                allContentsOfThisType={allContentsOfThisType}
                contentToEdit={contentToEdit}
                setContentToEdit={setContentToEdit}
                setSelectedConfig={setSelectedConfig}
                setContentToEditId={setContentToEditId}
              />
            )}
          </div>

          {/* Column 3: Action Buttons */}
          <div className="col-span-3 space-y-4">
            <div className="space-y-4 mb-4">
              <Select
                value={selectedLevel || ""}
                onValueChange={(value: DifficultyLevel) => setSelectedLevel(value)}
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue 
                    placeholder="Select Level" 
                    className="text-muted-foreground"
                  />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900">
                  {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as DifficultyLevel[]).map((level) => (
                    <SelectItem 
                      key={level} 
                      value={level}
                      className="text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedTopic || ""}
                onValueChange={(topic) => setSelectedTopic(topic)}
                disabled={!selectedLevel}
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue 
                    placeholder="Select Topic" 
                    className="text-muted-foreground"
                  />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900">
                  {topics.map((topicData) => (
                    <SelectItem 
                      key={topicData.topic} 
                      value={topicData.topic}
                      className="text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {topicData.topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            // Topic field
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label 
                    htmlFor="topic" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                  >
                    Topic
                  </Label>
                  {activeTab !== "edit" && (
                    <span className="text-xs text-destructive">
                      Required
                    </span>
                  )}
                </div>
                <Input
                  id="topic"
                  placeholder="Enter the topic for this exercise..."
                  className="text-sm transition-colors placeholder:text-muted-foreground/60"
                  value={selectedTopicOfIndividualExercise}
                  onChange={(e) => setSelectedTopicOfIndividualExercise(e.target.value)}
                  required={activeTab !== "edit"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Specify the topic or subject area for this exercise.
                </p>
              </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label 
                  htmlFor="additionalInstructions" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                >
                  Additional Instructions
                </Label>
                <span className="text-xs text-muted-foreground">
                  Optional
                </span>
              </div>
              <Textarea
                id="additionalInstructions"
                placeholder="Add specific requirements or guidelines for the exercise generation..."
                className="min-h-[120px] resize-y text-sm leading-relaxed transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-1"
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide any specific instructions or requirements to customize the exercise generation.
              </p>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGenerateContent}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Exercise
              </Button>
            </div>
              <Button
                className="w-full"
                onClick={() => handleSave(activeTab === "edit")}
                disabled={!selectedConfig || isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleReset}
                disabled={!selectedConfig}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
