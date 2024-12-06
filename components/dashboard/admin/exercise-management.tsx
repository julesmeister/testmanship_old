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
import Editor from "@monaco-editor/react";
import { Save, RotateCcw, Trash2, Wand2 } from "lucide-react";
import { DifficultyLevel } from "@/types/difficulty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import cn from 'classnames';
import { useExerciseContent } from '@/hooks/useExerciseContent';
import { useSaveExerciseContent } from '@/hooks/useSaveExerciseContent';
import { toast } from 'sonner';

interface ExerciseManagementProps {
  supabase: SupabaseClient;
}

interface TopicData {
  id: string;
  topic: string;
  description: string;
  exercise_types: string[];
}

export default function ExerciseManagement({ supabase }: ExerciseManagementProps) {
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [jsonContent, setJsonContent] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [activeAccordion, setActiveAccordion] = useState("exercise-types");
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [activeTab, setActiveTab] = useState<"template" | "generated">("template");

  const { generateContent } = useExerciseContent();
  const { saveContent, isSaving } = useSaveExerciseContent();

  // Fetch topics and exercise types when difficulty level changes
  useEffect(() => {
    async function fetchData() {
      if (!selectedLevel) {
        setTopics([]);
        return;
      }

      const { data, error } = await supabase
        .from('exercises')
        .select('id, topic, exercise_types, description')
        .eq('difficulty_level', selectedLevel);

      if (error) {
        toast.error(`Error fetching data: ${error.message}`);
        return;
      }

      // Group topics with same name and combine their exercise types
      const topicsMap = data.reduce((acc, curr) => {
        if (!acc[curr.topic]) {
          acc[curr.topic] = {
            id: curr.id,
            topic: curr.topic,
            description: curr.description,
            exercise_types: curr.exercise_types || []
          };
        } else {
          // Combine exercise types and remove duplicates
          acc[curr.topic].exercise_types = Array.from(new Set([
            ...acc[curr.topic].exercise_types,
            ...(curr.exercise_types || [])
          ]));
        }
        return acc;
      }, {} as Record<string, TopicData>);

      setTopics(Object.values(topicsMap));
      
      
      setSelectedTopic(null); // Reset selected topic when level changes
    }

    fetchData();
  }, [selectedLevel, supabase]);

  const handleSave = async () => {
    try {
      // Validate JSON
      JSON.parse(generatedContent);
      
      await saveContent({
        supabase,
        exerciseId: topics.find(t => t.topic === selectedTopic)?.id || '',
        content: JSON.parse(generatedContent)
      });
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const handleReset = () => {
    setJsonContent("");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Column 1: Settings Accordion */}
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
                            setSelectedConfig(type);
                            setJsonContent(JSON.stringify(getExerciseTemplate(type), null, 2));
                          }}
                        >
                          {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Button>
                      ))}
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
            <div className="mb-2 border-b border-border">
              <div className="flex h-10 items-center">
                <button
                  onClick={() => setActiveTab("template")}
                  className={cn(
                    "px-4 h-full inline-flex items-center justify-center",
                    "text-sm font-medium transition-colors hover:text-primary",
                    activeTab === "template" 
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  Template
                </button>
                <button
                  onClick={() => setActiveTab("generated")}
                  className={cn(
                    "px-4 h-full inline-flex items-center justify-center",
                    "text-sm font-medium transition-colors hover:text-primary",
                    activeTab === "generated"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  Generated Content
                </button>
              </div>
            </div>
            
            {activeTab === "template" ? (
              <Editor
                key="template-editor"
                height="500px"
                defaultLanguage="json"
                theme="vs-dark"
                value={typeof jsonContent === 'string' ? jsonContent : ''}
                onChange={(value) => setJsonContent(value ?? '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  tabSize: 2,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  formatOnPaste: true,
                  formatOnType: true,
                  automaticLayout: true,
                }}
                beforeMount={(monaco) => {
                  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                    validate: true,
                    allowComments: false,
                    schemas: [],
                  });
                }}
              />
            ) : (
              <Editor
                key="generated-editor"
                height="500px"
                defaultLanguage="json"
                theme="vs-dark"
                value={typeof generatedContent === 'string' ? generatedContent : ''}
                onChange={(value) => setGeneratedContent(value ?? '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  tabSize: 2,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  formatOnPaste: true,
                  formatOnType: true,
                  automaticLayout: true,
                }}
                beforeMount={(monaco) => {
                  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                    validate: true,
                    allowComments: false,
                    schemas: [],
                  });
                }}
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
                onValueChange={setSelectedTopic}
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
                      key={topicData.id} 
                      value={topicData.topic}
                      className="text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {topicData.topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  if (selectedConfig && selectedTopic && selectedLevel) {
                    await generateContent({
                      template: jsonContent,
                      exerciseType: selectedConfig,
                      topic: selectedTopic,
                      description: topics.find(t => t.topic === selectedTopic)?.description || '',
                      difficultyLevel: selectedLevel,
                      onContentGenerated: setGeneratedContent
                    });
                  } else {
                    toast.error('Please select a topic, difficulty level, and exercise type');
                  }
                }}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Exercise
              </Button>
            </div>
              <Button
                className="w-full"
                onClick={handleSave}
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
