"use client";

import { cn } from '@/lib/utils';
import Editor from '@monaco-editor/react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./sortable-item";
import { Card } from "@/components/ui/card";

interface EditorComponentProps {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<"template" | "generated" | "edit">>;
  jsonContent: string;
  setJsonContent: (content: string) => void;
  generatedContent: string;
  setGeneratedContent: (content: string) => void;
  selectedTopicOfIndividualExercise: string;
  setSelectedTopicOfIndividualExercise: (topic: string) => void;
  allContentsOfThisType: string;
  contentToEdit: string;
  setContentToEdit: (content: string) => void;
  setSelectedConfig: (config: string) => void;
  setContentToEditId: (id: string) => void;
}

interface TopicData {
  id: string;
  topic: string;
  description: string;
  exercise_types: string[];
}

interface EditorProps {
  activeTab: "template" | "generated" | "edit";
  setActiveTab: Dispatch<SetStateAction<"template" | "generated" | "edit">>;
  jsonContent: string;
  setJsonContent: (content: string) => void;
  generatedContent: string;
  setGeneratedContent: (content: string) => void;
  selectedTopicOfIndividualExercise: string;
  setSelectedTopicOfIndividualExercise: (topic: string) => void;
  allContentsOfThisType: any[];
  contentToEdit: any;
  setContentToEdit: (content: any) => void;
  setSelectedConfig: (config: any) => void;
  topics: TopicData[];
  setTopics: (topics: TopicData[]) => void;
}

export default function EditorComponent({
  activeTab,
  setActiveTab,
  jsonContent,
  setJsonContent,
  generatedContent,
  setGeneratedContent,
  selectedTopicOfIndividualExercise,
  setSelectedTopicOfIndividualExercise,
  allContentsOfThisType,
  contentToEdit,
  setContentToEdit,
  setSelectedConfig,
  setContentToEditId,
}: EditorComponentProps) {
  const [topics, setTopics] = useState<TopicData[]>([]);
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
          <button
            onClick={() => setActiveTab("edit")}
            className={cn(
              "px-4 h-full inline-flex items-center justify-center",
              "text-sm font-medium transition-colors hover:text-primary",
              activeTab === "edit"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            )}
          >
            Edit Exercise
          </button>
        </div>
      </div>

      {activeTab === "template" && (
        <Editor
          key="template-editor"
          height="700px"
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
      )}

      {activeTab === "generated" && (
        <Editor
          key="generated-editor"
          height="700px"
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

      {activeTab === "edit" && (
        <div>
          {/* Select Exercise Individual Topic */}
          <div className="mb-4 flex items-center gap-4">
            <Select 
              value={selectedTopicOfIndividualExercise} 
              onValueChange={(topic) => {
                setSelectedTopicOfIndividualExercise(topic);
                
                // Filter and set contentToEdit when a topic is selected
                if (allContentsOfThisType && allContentsOfThisType.trim() !== '') {
                  try {
                    const parsedContents = JSON.parse(allContentsOfThisType);
                    const filteredContent = parsedContents.filter(
                      (content) => content.topic === topic
                    );
                    
                    // If filtered content exists, set it to contentToEdit
                    if (filteredContent.length > 0) {
                      setSelectedConfig(filteredContent[0].exercise_type);
                      setContentToEditId(filteredContent[0].id);
                      setContentToEdit(JSON.stringify(filteredContent[0].content, null, 2));
                    } else {
                      setContentToEdit('');
                      setContentToEditId('');
                    }
                  } catch (error) {
                    console.error('Error filtering content:', error);
                    setContentToEdit('');
                  }
                }
              }}
            >
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue 
                  placeholder="Select a topic to edit" 
                  className="text-muted-foreground"
                />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900">
                <SelectGroup>
                  {Array.from(new Set(
                    allContentsOfThisType && allContentsOfThisType.trim() !== '' 
                      ? JSON.parse(allContentsOfThisType).map(content => 
                          content.topic
                        )
                      : []
                  )).map((topic, index) => (
                    topic ? (
                      <SelectItem 
                        key={index} 
                        value={topic as string}
                        className="text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        {topic as string}
                      </SelectItem>
                    ) : null
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {selectedTopicOfIndividualExercise && (
              <Button 
                variant="secondary" 
                onClick={() => setSelectedTopicOfIndividualExercise('')}
              >
                Clear Selection
              </Button>
            )}
          </div>

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
                  <Card className="p-4">
                    <h3 className="font-semibold">{topic.topic}</h3>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </Card>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>

          <Editor
            key="all-exercises-editor"
            height="700px"
            defaultLanguage="json"
            value={contentToEdit}
            onChange={(value) => {
              if (value) {
                try {
                  setContentToEdit(value);
                } catch (error) {
                  console.error('Error parsing value:', error);
                }
              }
            }}
            theme="vs-dark"
            options={{
              wordWrap: "on",
              minimap: { enabled: false },
              automaticLayout: true,
            }}
          />
        </div>
      )}
    </div>
  );
}
