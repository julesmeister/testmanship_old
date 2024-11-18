'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, PenTool, Sparkles, Check, BookOpenCheck, GraduationCap, ArrowRight } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from '@/components/ui/button';

interface GrammarPoint {
  point: string;
  examples: string[];
}

interface LevelGrammar {
  [key: string]: GrammarPoint[];
}

interface LevelData {
  level: string;
  title: string;
  description: string;
  keyPoints: string[];
  icon: string;
  grammar: LevelGrammar;
}

const languageLevels: LevelData[] = [
  {
    level: 'A1/A2',
    title: 'Basic Level',
    description: 'Basic present tense, simple questions, and everyday phrases. A2: Simple past tense, basic future expressions, and common connectors (and, but, because).',
    keyPoints: [
      'Can introduce themselves and others',
      'Can describe daily routines and immediate environment',
      'Uses basic sentence patterns and memorized phrases',
      'Limited vocabulary focused on concrete needs'
    ],
    icon: '🌱',
    grammar: {
      a1: [
        {
          point: 'Present simple (be, have, regular verbs)',
          examples: ['I am a student', 'She has a book', 'They work here']
        },
        {
          point: 'Basic questions (what, where, when)',
          examples: ['What is your name?', 'Where do you live?', 'When do you study?']
        },
        {
          point: 'Personal pronouns and possessives',
          examples: ['I/my, you/your, he/his, she/her', 'This is my book', 'That is her car']
        },
        {
          point: 'Articles (a, an, the)',
          examples: ['a book', 'an apple', 'the sun']
        }
      ],
      a2: [
        {
          point: 'Past simple (regular and common irregular)',
          examples: ['I worked yesterday', 'She went to school', 'They bought a car']
        },
        {
          point: 'Future with "going to"',
          examples: ['I am going to study', 'She is going to travel', 'They are going to play']
        },
        {
          point: 'Common prepositions',
          examples: ['in the room', 'on the table', 'at school']
        },
        {
          point: 'Basic conjunctions (and, but, because)',
          examples: ['I like tea and coffee', "It's cold but sunny", "I'm happy because I passed"]
        }
      ]
    }
  },
  {
    level: 'B1/B2',
    title: 'Intermediate Level',
    description: 'Present perfect, conditionals (1st & 2nd), passive voice. B2: Past perfect, reported speech, and more complex conditionals.',
    keyPoints: [
      'Can discuss abstract topics and express opinions',
      'Uses a range of linking words and cohesive devices',
      'Handles different verb tenses with good control',
      'Growing vocabulary for both concrete and abstract topics'
    ],
    icon: '🌿',
    grammar: {
      b1: [
        {
          point: 'Present perfect simple',
          examples: ['I have visited Paris', 'She has lived here for 5 years', 'Have you ever tried sushi?']
        },
        {
          point: 'First conditional',
          examples: ['If it rains, I will stay home', "I'll help you if you ask me", 'What will you do if you win?']
        },
        {
          point: 'Basic passive voice',
          examples: ['The house was built in 1990', 'English is spoken here', 'The letter will be sent tomorrow']
        },
        {
          point: 'Comparative and superlative forms',
          examples: ['This book is better than that one', 'She is the tallest in her class', "It's more expensive than I thought"]
        }
      ],
      b2: [
        {
          point: 'Past perfect',
          examples: ['I had never seen snow before I moved here', 'She had already left when I arrived', 'Had you finished before the deadline?']
        },
        {
          point: 'Second and third conditionals',
          examples: ['If I won the lottery, I would travel the world', 'If I had studied harder, I would have passed']
        },
        {
          point: 'Reported speech',
          examples: ['He said he was tired', 'She told me she had finished the work', 'They asked where I was going']
        },
        {
          point: 'Complex passive constructions',
          examples: ['The report is believed to be accurate', 'The project was supposed to be finished yesterday', 'English has been taught here for decades']
        }
      ]
    }
  },
  {
    level: 'C1/C2',
    title: 'Advanced Level',
    description: 'All tenses, complex passives, advanced modals. C2: Sophisticated rhetoric, nuanced expressions, and native-like command of idioms.',
    keyPoints: [
      'Masters complex grammatical structures',
      'Uses precise vocabulary and idiomatic expressions',
      'Produces clear, well-structured, detailed text',
      'Near-native level of fluency and accuracy'
    ],
    icon: '🌳',
    grammar: {
      c1: [
        {
          point: 'Mixed conditionals',
          examples: ['If I had studied medicine, I would be a doctor now', 'If I were you, I would have done it differently']
        },
        {
          point: 'Advanced modal verbs',
          examples: ['You must have been tired', 'They should have been informed', 'It might have been better to wait']
        },
        {
          point: 'Complex tense relationships',
          examples: ['By the time I finish, I will have been working for 12 hours', 'I would have been studying if you hadn\'t called']
        },
        {
          point: 'Inversion and emphasis',
          examples: ['Not only did he win, but he also set a record', 'Rarely have I seen such dedication', 'Little did she know']
        }
      ],
      c2: [
        {
          point: 'All tense forms and aspects',
          examples: ["I'll have been working here for 20 years next month", 'Had I known earlier, I would have acted differently']
        },
        {
          point: 'Sophisticated rhetoric devices',
          examples: ['Were it not for your help, I wouldn\'t be here', 'Such was his influence that everyone followed']
        },
        {
          point: 'Native-like idiom usage',
          examples: ["It's raining cats and dogs", "You're barking up the wrong tree", "That's the last straw"]
        },
        {
          point: 'Nuanced expression of concepts',
          examples: ['The findings somewhat contradict previous research', 'This approach might conceivably lead to better results']
        }
      ]
    }
  }
];

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
        <CardContent className="space-y-6">
          <div className="grid gap-8">
            {languageLevels.map((level) => (
              <HoverCard key={level.level}>
                <HoverCardTrigger asChild>
                  <div className="relative space-y-4 rounded-lg border bg-card p-6 cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-2xl">{level.icon}</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold tracking-tight text-foreground">
                              {level.title}
                            </h3>
                            <BookOpenCheck className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground">{level.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2">
                      {level.keyPoints.map((point, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                          <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                          <span className="text-sm text-foreground">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent 
                  side="right" 
                  align="start" 
                  className="w-[800px] p-6 backdrop-blur-sm bg-card/95 border-primary/20"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Grammar Requirements</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      {Object.entries(level.grammar).map(([sublevel, points]) => (
                        <div key={sublevel} className="space-y-4">
                          <div className="flex items-center gap-2 bg-primary/5 rounded-md p-2">
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                            <h4 className="font-medium text-sm text-foreground uppercase tracking-wide">
                              {sublevel.toUpperCase()} Level Grammar
                            </h4>
                          </div>
                          <div className="space-y-3">
                            {points.map((item, i) => (
                              <div key={i} className="space-y-2.5 bg-background rounded-lg p-4 border shadow-sm">
                                <div className="flex items-start gap-2">
                                  <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                                  <span className="text-sm text-foreground font-medium">{item.point}</span>
                                </div>
                                <div className="space-y-2">
                                  {item.examples.map((example, j) => (
                                    <div key={j} className="flex gap-2 items-start pl-6">
                                      <ArrowRight className="h-3 w-3 mt-1 text-muted-foreground" />
                                      <p className="text-sm text-muted-foreground">
                                        {example}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
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
                    <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                    <span>Provide clear, concise instructions with specific goals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                    <span>Include word count or time limit recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                    <span>Specify any particular requirements or constraints</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                    <span>Each level has specific formats suitable for that proficiency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                    <span>Choose formats that match the learning objectives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                    <span>Consider the time and effort required for completion</span>
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
