'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, PenTool, Sparkles } from 'lucide-react';

export function GuideContent() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
            <BookOpen className="h-5 w-5" />
            Proficiency Guide
          </CardTitle>
          <CardDescription>Understanding difficulty levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {[
              {
                level: 'A1/A2',
                title: 'Basic Level',
                description: 'A1: Basic present tense, simple questions, and everyday phrases. A2: Simple past tense, basic future expressions, and common connectors (and, but, because).',
                keyPoints: [
                  'Can introduce themselves and others',
                  'Can describe daily routines and immediate environment',
                  'Uses basic sentence patterns and memorized phrases',
                  'Limited vocabulary focused on concrete needs'
                ],
                icon: '🌱'
              },
              {
                level: 'B1/B2',
                title: 'Intermediate Level',
                description: 'B1: Present perfect, conditionals (1st & 2nd), passive voice. B2: Past perfect, reported speech, and more complex conditionals.',
                keyPoints: [
                  'Can discuss abstract topics and express opinions',
                  'Uses a range of linking words and cohesive devices',
                  'Handles different verb tenses with good control',
                  'Growing vocabulary for both concrete and abstract topics'
                ],
                icon: '🌿'
              },
              {
                level: 'C1/C2',
                title: 'Advanced Level',
                description: 'C1: All tenses, complex passives, advanced modals. C2: Sophisticated rhetoric, nuanced expressions, and native-like command of idioms.',
                keyPoints: [
                  'Masters complex grammatical structures',
                  'Uses precise vocabulary and idiomatic expressions',
                  'Produces clear, well-structured, detailed text',
                  'Handles abstract and specialized topics effectively'
                ],
                icon: '🌳'
              }
            ].map((item) => (
              <div key={item.level} className="flex items-start space-x-4 rounded-lg border p-4">
                <div className="text-2xl">{item.icon}</div>
                <div className="space-y-1">
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {item.title} ({item.level})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {item.keyPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-0.5 block h-1.5 w-1.5 rounded-full bg-zinc-500" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
              <PenTool className="h-5 w-5" />
              Writing Formats
            </CardTitle>
            <CardDescription>Choosing the right format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-medium text-zinc-900 dark:text-white">Format Selection</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 block h-1.5 w-1.5 rounded-full bg-zinc-500" />
                    <span>Each level has specific formats suitable for that proficiency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 block h-1.5 w-1.5 rounded-full bg-zinc-500" />
                    <span>Choose formats that match the learning objectives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 block h-1.5 w-1.5 rounded-full bg-zinc-500" />
                    <span>Consider the time and effort required for completion</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
              <Sparkles className="h-5 w-5" />
              Best Practices
            </CardTitle>
            <CardDescription>Tips for creating effective challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-medium text-zinc-900 dark:text-white">Key Considerations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 block h-1.5 w-1.5 rounded-full bg-zinc-500" />
                    <span>Provide clear, concise instructions with specific goals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 block h-1.5 w-1.5 rounded-full bg-zinc-500" />
                    <span>Include word count or time limit recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 block h-1.5 w-1.5 rounded-full bg-zinc-500" />
                    <span>Specify any particular requirements or constraints</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
