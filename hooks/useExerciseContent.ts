import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguageStore } from '@/stores/language';

interface GenerateContentParams {
  template: string;
  exerciseType: string;
  topic: string;
  description: string;
  difficultyLevel: string;
  onContentGenerated?: (content: string) => void;
}

export function useExerciseContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const { selectedLanguageId, languages } = useLanguageStore();

  const generateContent = async ({
    template,
    exerciseType,
    topic,
    description,
    difficultyLevel,
    onContentGenerated,
  }: GenerateContentParams) => {
    try {
      setIsGenerating(true);
      const selectedLanguage = languages.find(lang => lang.id === selectedLanguageId);
      toast.loading('Generating exercise content...', {
        id: 'generating-content',
      });

      const response = await fetch('/api/generate-exercise-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template,
          exerciseType,
          topic,
          description,
          difficultyLevel,
          targetLanguage: selectedLanguage?.code?.toUpperCase() || 'EN',
        }),
      });

      const data = await response.json();
      console.log('API Response:', { status: response.status, data });

      if (!response.ok) {
        // Check for rate limit error
        if (response.status === 429 || data.error?.code === 429) {
          throw new Error('Our content generator is cooling down. Please try again in a moment! 🎯');
        }
        throw new Error(`Failed to generate content: ${data.error || 'Unknown error'}`);
      }

      // Ensure content is a string
      const content = typeof data.content === 'object' ? JSON.stringify(data.content, null, 2) : String(data.content || '');
      setGeneratedContent(content);
      if (onContentGenerated) {
        onContentGenerated(content);
      }
      toast.success('Exercise content generated successfully!', {
        id: 'generating-content',
      });

      return content;
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate content',
        { id: 'generating-content' }
      );
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const resetContent = () => {
    setGeneratedContent('');
  };

  return {
    generatedContent,
    setGeneratedContent,
    isGenerating,
    generateContent,
    resetContent,
  };
}
