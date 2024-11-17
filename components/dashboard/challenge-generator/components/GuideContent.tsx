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
                description: 'Everyday topics with simple vocabulary',
                icon: '🌱'
              },
              {
                level: 'B1/B2',
                title: 'Intermediate Level',
                description: 'Complex structures and varied topics',
                icon: '🌿'
              },
              {
                level: 'C1/C2',
                title: 'Advanced Level',
                description: 'Sophisticated language and nuanced expression',
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
