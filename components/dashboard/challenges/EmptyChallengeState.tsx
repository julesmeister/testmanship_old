'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, PenTool, Sparkles, Check, BookOpenCheck, GraduationCap } from 'lucide-react';
import { DifficultyLevel } from '@/utils/constants';
import { FilterLevel } from '@/hooks/useChallengeFilters';

interface EmptyChallengeStateProps {
  selectedLevel: FilterLevel;
}

interface LevelInfo {
  icon: string;
  title: string;
  description: string;
}

interface SpecificLevelInfo extends LevelInfo {
  examples: string[];
}

interface AllLevelsInfo extends LevelInfo {
  levels: Array<{
    name: string;
    desc: string;
  }>;
}

type LevelDescriptions = Record<DifficultyLevel, SpecificLevelInfo> & {
  ALL: AllLevelsInfo;
};

const levelDescriptions = {
  A1: {
    icon: '🌱',
    title: 'Beginner Level',
    description: 'Start your writing journey with basic expressions and simple sentences. Focus on everyday topics like self-introduction, family, and daily routines. Perfect for those beginning to express themselves in writing.',
    examples: [
      'Write a personal introduction describing yourself, your family, and your daily activities in simple sentences',
      'Compose a friendly postcard to a pen pal about your weekend activities and basic experiences',
      'Create a simple diary entry about your daily routine, including times and basic activities',
      'Write short messages to friends about your hobbies and what you like to do in your free time',
      'Describe your home, your room, or your neighborhood using basic vocabulary and simple structures'
    ]
  },
  A2: {
    icon: '🌿',
    title: 'Elementary Level',
    description: 'Build on basics with simple connected phrases and sentences. Write about familiar topics and personal experiences using common connectors. Learn to express basic opinions and describe past events.',
    examples: [
      'Write a detailed letter to a friend describing your recent vacation, including where you went and what you did',
      'Create a blog post about your favorite hobby, explaining why you enjoy it and how often you practice',
      'Compose a review of a restaurant or movie using simple but connected sentences to express your opinion',
      'Write a story about a memorable experience from your past, using basic time expressions and sequences',
      'Describe your typical day at work or school, including your schedule and interactions with others'
    ]
  },
  B1: {
    icon: '🌳',
    title: 'Intermediate Level',
    description: 'Express opinions and experiences in detail with confidence. Connect ideas into coherent texts about various familiar subjects. Begin to handle more complex topics and express your viewpoint clearly.',
    examples: [
      'Write a detailed blog post about a social issue that matters to you, explaining your perspective and supporting arguments',
      'Compose a comprehensive review of a book or series, discussing the plot, characters, and your personal thoughts',
      'Create a travel guide for your hometown, describing local attractions, customs, and recommended experiences',
      'Write a cover letter for a job application, highlighting your relevant skills and experiences',
      'Develop a personal essay about a challenging experience and how it changed your perspective'
    ]
  },
  B2: {
    icon: '🌲',
    title: 'Upper Intermediate Level',
    description: 'Write clear, detailed texts on various subjects with confidence. Express views on contemporary issues, explain advantages and disadvantages, and develop structured arguments. Handle both formal and informal writing styles effectively.',
    examples: [
      'Compose a well-structured essay analyzing the pros and cons of remote work, including its impact on productivity and work-life balance',
      'Write a detailed proposal for a community project, outlining objectives, methods, and expected outcomes',
      'Create an in-depth review of a technological product, discussing its features, benefits, and potential drawbacks',
      'Develop a comprehensive report on an environmental issue, including causes, effects, and possible solutions',
      'Write a persuasive article about a controversial topic, presenting balanced arguments and supporting evidence'
    ]
  },
  C1: {
    icon: '🎓',
    title: 'Advanced Level',
    description: 'Produce clear, well-structured texts on complex subjects with sophistication. Use language flexibly for academic and professional purposes. Handle abstract concepts and express subtle distinctions in meaning.',
    examples: [
      'Write a research paper analyzing the impact of social media on modern communication patterns and interpersonal relationships',
      'Compose a detailed business proposal for a startup idea, including market analysis, financial projections, and risk assessment',
      'Create a comprehensive literature review comparing different theoretical approaches in your field of expertise',
      'Develop an academic essay examining the cultural and sociological implications of technological advancement',
      'Write a complex case study analysis for a business scenario, including recommendations and implementation strategies'
    ]
  },
  C2: {
    icon: '👑',
    title: 'Mastery Level',
    description: 'Write sophisticated texts with precision, nuance, and stylistic flair. Handle complex academic or professional writing tasks with expertise. Express subtle shades of meaning and create compelling narratives in any context.',
    examples: [
      'Compose an academic dissertation chapter synthesizing complex theoretical frameworks and empirical research in your field',
      'Write a sophisticated policy analysis paper examining multilateral approaches to global challenges',
      'Create an in-depth analytical piece exploring the philosophical implications of artificial intelligence and consciousness',
      'Develop a comprehensive research proposal integrating multiple disciplinary perspectives and methodological approaches',
      'Write a nuanced literary analysis examining stylistic techniques and their contribution to thematic development'
    ]
  },
  ALL: {
    icon: '📚',
    title: 'Writing Journey',
    description: 'Explore writing challenges across all proficiency levels, from basic expressions to masterful compositions. Whether you\'re starting with simple sentences or crafting complex academic papers, find the perfect challenge to advance your writing skills and express yourself with confidence.',
    levels: [
      { name: 'A1-A2', desc: 'Begin with fundamentals and everyday topics, building confidence in expressing basic ideas and experiences' },
      { name: 'B1-B2', desc: 'Progress to detailed expressions and complex ideas, developing your ability to discuss various subjects with clarity' },
      { name: 'C1-C2', desc: 'Master sophisticated writing and professional content, handling complex topics with precision and style' }
    ]
  }
} as const satisfies LevelDescriptions;

export function EmptyChallengeState({ selectedLevel }: EmptyChallengeStateProps) {
  // If no level is selected, show the ALL view
  if (!selectedLevel) {
    const allLevelInfo = levelDescriptions.ALL;
    return (
      <div className="space-y-6 p-8">
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">{allLevelInfo.icon}</span>
          <h2 className="text-2xl font-semibold mt-4 text-foreground">{allLevelInfo.title}</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{allLevelInfo.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {allLevelInfo.levels.map((level) => (
            <Card key={level.name} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-foreground">{level.name}</h3>
                <p className="text-muted-foreground text-sm">{level.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Handle ALL level selection
  if (selectedLevel === 'ALL') {
    const allLevelInfo = levelDescriptions.ALL;
    return (
      <div className="space-y-6 p-8">
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">{allLevelInfo.icon}</span>
          <h2 className="text-2xl font-semibold mt-4 text-foreground">{allLevelInfo.title}</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{allLevelInfo.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {allLevelInfo.levels.map((level) => (
            <Card key={level.name} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-foreground">{level.name}</h3>
                <p className="text-muted-foreground text-sm">{level.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Convert level to uppercase for matching
  const normalizedLevel = selectedLevel.toUpperCase() as keyof typeof levelDescriptions;
  const levelInfo = levelDescriptions[normalizedLevel];
  
  if (!levelInfo) {
    return null; // Or show an error state
  }

  const specificLevelInfo = levelInfo as SpecificLevelInfo;
  return (
    <div className="space-y-6 p-8">
      <div className="text-center mb-8">
        <span className="text-4xl mb-4 block">{specificLevelInfo.icon}</span>
        <h2 className="text-2xl font-semibold mt-4 text-foreground">{specificLevelInfo.title}</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{specificLevelInfo.description}</p>
      </div>
      <Card className="max-w-6xl mx-auto">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Example Writing Tasks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {specificLevelInfo.examples.map((example, index) => (
              <div key={index} className="flex items-start gap-2 bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground text-sm">{example}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
