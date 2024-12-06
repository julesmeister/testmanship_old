"use client";

import { useState } from 'react';
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

interface ExerciseManagementProps {
  supabase: SupabaseClient;
}

export default function ExerciseManagement({ supabase }: ExerciseManagementProps) {
  const [selectedConfig, setSelectedConfig] = useState("");
  const [jsonContent, setJsonContent] = useState("");
  const [activeAccordion, setActiveAccordion] = useState("exercise-types");

  const handleSave = async () => {
    try {
      // Validate JSON
      JSON.parse(jsonContent);
      // TODO: Save to database
      console.log('Saving configuration:', selectedConfig, jsonContent);
    } catch (error) {
      console.error('Invalid JSON format');
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
                    {getExerciseTypes().map((type) => (
                      <Button
                        key={type}
                        variant="ghost"
                        className="w-full justify-start"
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
            <Editor
              height="500px"
              defaultLanguage="json"
              theme="vs-dark"
              value={jsonContent}
              onChange={(value) => setJsonContent(value || '')}
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
            />
          </div>

          {/* Column 3: Action Buttons */}
          <div className="col-span-3 space-y-4">
            <div className="space-y-2">
            <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (selectedConfig) {
                    const template = getExerciseTemplate(selectedConfig as ExerciseType);
                    setJsonContent(JSON.stringify(template, null, 2));
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
                disabled={!selectedConfig}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
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
             
            
            {selectedConfig && (
              <Card>
                <CardContent className="p-4">
                  <div className="mt-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
