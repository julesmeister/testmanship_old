'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useSupabase } from '@/app/supabase-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Loader2, Sparkles, BookOpen, GraduationCap, PenTool, Check, Clock, List, BrainCircuit, Award, FileText, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Database } from '@/types/types_db';
import { SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const difficultyLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  instructions: z.string().min(1, 'Instructions are required'),
  difficulty: z.enum(difficultyLevels, {
    required_error: 'Please select a difficulty level',
  }),
  format: z.string().min(1, 'Please select a format'),
  timeAllocation: z.number().min(1).max(120)
});

interface ChallengeFormat {
  id: string;
  name: string;
  description: string | null;
  difficulty_level: typeof difficultyLevels[number];
  created_at: string;
}

interface Suggestion {
  title: string;
  description: string;
  keyPoints: string[];
}

interface ChallengeGeneratorViewProps {
  user: User;
  userDetails: any;
}

export default function ChallengeGeneratorView({ user, userDetails }: ChallengeGeneratorViewProps) {
  const [formats, setFormats] = useState<ChallengeFormat[]>([]);
  const [groupedFormats, setGroupedFormats] = useState<{ [key: string]: ChallengeFormat[] }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [usedTitles, setUsedTitles] = useState<Set<string>>(new Set());
  const { supabase } = useSupabase();
  const router = useRouter();

  // Type the supabase client correctly
  const typedSupabase = supabase as SupabaseClient<Database>;

  // Log authentication state when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Current auth session:', session);
        console.log('User prop:', user);
        console.log('User details:', userDetails);
        if (error) {
          console.error('Auth check error:', error);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    checkAuth();
  }, [user, userDetails, supabase]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      instructions: '',
      difficulty: 'A1',
      format: '',
      timeAllocation: 30
    }
  });

  // Load formats when difficulty changes
  const loadFormats = async (difficulty: string) => {
    try {
      const difficultyIndex = difficultyLevels.indexOf(difficulty as any);
      const applicableLevels = difficultyLevels.slice(0, difficultyIndex + 1);
      
      const { data: formatsData, error } = await typedSupabase
        .from('challenge_formats')
        .select('*')
        .in('difficulty_level', applicableLevels)
        .order('difficulty_level');

      if (error) throw error;

      setFormats(formatsData);

      // Group formats by difficulty level
      const grouped = formatsData.reduce((acc: { [key: string]: any[] }, format) => {
        if (!acc[format.difficulty_level]) {
          acc[format.difficulty_level] = [];
        }
        acc[format.difficulty_level].push(format);
        return acc;
      }, {});

      setGroupedFormats(grouped);
    } catch (error) {
      console.error('Error loading formats:', error);
      toast.error('Failed to load formats');
    }
  };

  // Load initial formats for A1 level
  useEffect(() => {
    if (user) {
      loadFormats('A1');
    }
  }, [user]);

  // Update formats when difficulty changes
  useEffect(() => {
    const difficulty = form.watch('difficulty');
    if (difficulty) {
      loadFormats(difficulty);
    }
  }, [form.watch('difficulty')]);

  // Generate suggestions
  const generateSuggestions = async () => {
    try {
      setIsGenerating(true);
      toast.loading('Generating challenge suggestions...', {
        id: 'generating-suggestions',
      });
      
      const difficulty = form.getValues('difficulty');
      const format = formats.find(f => f.id === form.getValues('format'));
      const timeAllocation = form.getValues('timeAllocation');

      if (!format) {
        throw new Error('Please select a format');
      }

      const response = await fetch('/api/challenge-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          difficulty, 
          format: format.name, 
          timeAllocation,
          usedTitles: Array.from(usedTitles)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for rate limit error specifically
        if (response.status === 429 || data.error?.code === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before generating more suggestions.');
        }
        throw new Error('Failed to generate suggestions');
      }

      if (!data.suggestions?.length) {
        throw new Error('No suggestions received');
      }

      // Add new titles to usedTitles
      const newTitles = new Set(usedTitles);
      data.suggestions.forEach((suggestion: Suggestion) => {
        newTitles.add(suggestion.title);
      });
      setUsedTitles(newTitles);

      setSuggestions(data.suggestions);
      toast.success('Suggestions generated', {
        id: 'generating-suggestions',
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate suggestions',
        { id: 'generating-suggestions' }
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset used titles when difficulty or format changes
  useEffect(() => {
    setUsedTitles(new Set());
  }, [form.watch('difficulty'), form.watch('format')]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log('Starting save process...');
    try {
      setIsSaving(true);
      toast.loading('Saving challenge...', {
        id: 'saving-challenge',
      });

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Please sign in to save challenges', {
          id: 'saving-challenge',
        });
        router.push('/signin');
        return;
      }

      // Validate required fields
      console.log('Validating form data:', data);
      if (!data.title || !data.instructions || !data.difficulty || !data.format) {
        throw new Error('Please fill in all required fields');
      }

      const challengeData: Database['public']['Tables']['challenges']['Insert'] = {
        title: data.title,
        instructions: data.instructions,
        difficulty_level: data.difficulty,
        format_id: data.format,
        created_by: session.user.id, // Use session user ID
        time_allocation: data.timeAllocation
      };

      // Log the data being saved
      console.log('Attempting to save challenge to Supabase:', challengeData);

      const { data: savedData, error } = await supabase
        .from('challenges')
        .insert(challengeData)
        .select()
        .single();

      console.log('Supabase response:', { savedData, error });

      if (error) {
        console.error('Error saving challenge:', error);
        throw new Error(`Failed to save challenge: ${error.message}`);
      }

      if (!savedData) {
        throw new Error('No data returned from save operation');
      }

      toast.success('Challenge saved successfully!', {
        id: 'saving-challenge',
      });

      // Reset form
      form.reset();
      setSuggestions([]);
    } catch (error) {
      console.error('Save process error:', error);
      toast.error('Failed to save challenge', {
        id: 'saving-challenge',
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Challenge Generator"
      description="Create writing challenges based on difficulty levels"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Challenge Generator</h2>
            <p className="text-muted-foreground">Create and customize writing challenges for different proficiency levels.</p>
          </div>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="bg-gray-100 dark:bg-gray-800">
            <TabsTrigger 
              value="create" 
              className="flex items-center gap-2 data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300"
            >
              <PenTool className="h-4 w-4" />
              Create Challenge
            </TabsTrigger>
            <TabsTrigger 
              value="guide" 
              className="flex items-center gap-2 data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300"
            >
              <BookOpen className="h-4 w-4" />
              Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
                    <GraduationCap className="h-5 w-5" />
                    Challenge Settings
                  </CardTitle>
                  <CardDescription className="space-y-2">
                    <p>Configure the parameters for your writing challenge:</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Award className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                        <span>Select proficiency level (A1-C2)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                        <span>Choose writing format</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Timer className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                        <span>Set time allocation</span>
                      </li>
                    </ul>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <div className="rounded-lg border p-4">
                          <h4 className="mb-3 font-medium text-zinc-900 dark:text-white">Proficiency Level</h4>
                          <FormField
                            control={form.control}
                            name="difficulty"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Tabs 
                                    value={field.value?.toLowerCase() || 'a1'} 
                                    onValueChange={(value) => {
                                      field.onChange(value.toUpperCase());
                                      loadFormats(value.toUpperCase());
                                    }}
                                    className="w-full"
                                  >
                                    <TabsList className="grid w-full grid-cols-6 bg-gray-100 dark:bg-gray-800">
                                      <TabsTrigger value="a1" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">A1</TabsTrigger>
                                      <TabsTrigger value="a2" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">A2</TabsTrigger>
                                      <TabsTrigger value="b1" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">B1</TabsTrigger>
                                      <TabsTrigger value="b2" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">B2</TabsTrigger>
                                      <TabsTrigger value="c1" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">C1</TabsTrigger>
                                      <TabsTrigger value="c2" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">C2</TabsTrigger>
                                    </TabsList>
                                  </Tabs>
                                </FormControl>
                                <FormDescription>
                                  From basic (A1) to mastery (C2) level
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="rounded-lg border p-4">
                          <h4 className="mb-3 font-medium text-zinc-900 dark:text-white">Writing Format</h4>
                          <FormField
                            control={form.control}
                            name="format"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  required
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select challenge format" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-white dark:bg-zinc-900">
                                    {Object.entries(groupedFormats).map(([level, levelFormats]) => (
                                      <SelectGroup key={level}>
                                        <SelectLabel 
                                          className="px-2 py-1.5 text-sm font-semibold text-zinc-500 dark:text-zinc-400"
                                        >
                                          {level} Level Formats
                                        </SelectLabel>
                                        {levelFormats.map((format) => (
                                          <SelectItem 
                                            key={format.id} 
                                            value={format.id}
                                            className="text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                          >
                                            {format.name}
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="rounded-lg border p-4">
                          <h4 className="mb-3 font-medium text-zinc-900 dark:text-white">Time Allocation</h4>
                          <FormField
                            control={form.control}
                            name="timeAllocation"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Slider
                                        min={1}
                                        max={120}
                                        step={5}
                                        defaultValue={[field.value || 30]}
                                        onValueChange={([value]) => field.onChange(value)}
                                        className="w-[calc(100%-4rem)]"
                                      />
                                      <span className="w-14 rounded-md border px-2 py-0.5 text-center text-sm text-zinc-900 dark:text-white">
                                        {field.value || 30}m
                                      </span>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Suggested completion time in minutes
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={generateSuggestions}
                          disabled={isGenerating || !form.getValues('difficulty') || !form.getValues('format')}
                          className="w-full transition-all duration-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:shadow-sm"
                        >
                          {isGenerating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                          )}
                          {isGenerating ? 'Generating...' : 'Generate Suggestions'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
                      <PenTool className="h-5 w-5" />
                      Challenge Instructions
                    </CardTitle>
                    <CardDescription className="space-y-2">
                      <p>Create clear and engaging instructions for your challenge:</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <BrainCircuit className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                          <span>Use AI-generated suggestions as inspiration</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <List className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                          <span>Include specific requirements or constraints</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                          <span>Consider the allocated time frame</span>
                        </li>
                      </ul>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold text-zinc-900 dark:text-white">
                                Challenge Title
                              </FormLabel>
                              <FormControl>
                                <div className="flex gap-2 relative group">
                                  <Input 
                                    placeholder="e.g., Describing Your Dream Vacation" 
                                    {...field}
                                    className="bg-white dark:bg-zinc-900 h-11 text-base transition-shadow duration-200 focus:ring-2 focus:ring-blue-500"
                                    onChange={(e) => {
                                      field.onChange(e);
                                      form.trigger('title');
                                    }}
                                  />
                                  <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          className="flex-shrink-0 h-11 w-11 transition-all duration-200 hover:border-blue-500 hover:text-blue-500 group-hover:border-blue-500"
                                          disabled={!field.value || !form.getValues('format') || isGenerating}
                                          onClick={async () => {
                                            try {
                                              setIsGenerating(true);
                                              toast.loading('Generating instructions...', {
                                                id: 'generating-instructions',
                                              });

                                              const difficulty = form.getValues('difficulty');
                                              const formatId = form.getValues('format');
                                              console.log('Current formats:', formats);
                                              console.log('Selected format ID:', formatId);
                                              
                                              const format = formats.find(f => f.id === formatId);
                                              console.log('Found format:', format);
                                              
                                              const timeAllocation = form.getValues('timeAllocation');

                                              if (!formatId) {
                                                throw new Error('Please select a format');
                                              }

                                              if (!format) {
                                                throw new Error(`Format not found (ID: ${formatId})`);
                                              }

                                              console.log('Sending request with:', {
                                                title: field.value,
                                                difficulty,
                                                format: format.name,
                                                timeAllocation
                                              });

                                              const response = await fetch('/api/challenge-suggestions', {
                                                method: 'POST',
                                                headers: {
                                                  'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({
                                                  title: field.value,
                                                  difficulty,
                                                  format: format.name,
                                                  timeAllocation
                                                }),
                                              });

                                              const data = await response.json();
                                              
                                              if (!response.ok) {
                                                throw new Error(data.error || 'Failed to generate instructions');
                                              }

                                              if (!data.suggestions || !data.suggestions.length) {
                                                throw new Error('No suggestions received');
                                              }

                                              const suggestion = data.suggestions[0];
                                              const formattedInstructions = `${suggestion.description}\n\nKey Points:\n${suggestion.keyPoints.map(point => `• ${point}`).join('\n')}\n• Time Allocation: ${timeAllocation} minutes`;
                                              form.setValue('instructions', formattedInstructions);
                                              form.trigger('instructions');

                                              toast.success('Instructions generated', {
                                                id: 'generating-instructions',
                                                description: 'AI-generated instructions have been added to the form.',
                                              });
                                            } catch (error) {
                                              console.error('Error generating instructions:', error);
                                              toast.error('Failed to generate instructions', {
                                                id: 'generating-instructions',
                                                description: error instanceof Error ? error.message : 'Please try again or write your own instructions.',
                                              });
                                            } finally {
                                              setIsGenerating(false);
                                            }
                                          }}
                                        >
                                          {isGenerating ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                          ) : (
                                            <Sparkles className="h-5 w-5" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent 
                                        side="right"
                                        className="bg-zinc-900 text-white border-zinc-800"
                                        sideOffset={5}
                                      >
                                        <p className="text-sm font-medium">Generate Instructions</p>
                                        <p className="text-xs text-zinc-400 mt-1">AI will create instructions based on your title</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </FormControl>
                              <FormDescription className="text-sm text-zinc-600 dark:text-zinc-400">
                                A clear, concise title that describes the writing task.
                              </FormDescription>
                              <FormMessage className="text-sm font-medium" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="instructions"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-semibold text-zinc-900 dark:text-white">
                                Instructions
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Provide clear instructions for the writing challenge..."
                                  className="min-h-[200px] resize-none bg-white dark:bg-zinc-900 text-base leading-relaxed transition-shadow duration-200 focus:ring-2 focus:ring-blue-500"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    form.trigger('instructions');
                                  }}
                                />
                              </FormControl>
                              <FormDescription className="text-sm text-zinc-600 dark:text-zinc-400">
                                Write detailed instructions that guide the student through the writing task.
                              </FormDescription>
                              <FormMessage className="text-sm font-medium" />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-6">
                          {suggestions.length > 0 && (
                            <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                                AI-Generated Suggestions
                              </h3>
                              {suggestions.map((suggestion, index) => (
                                <div 
                                  key={index} 
                                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 transition-all duration-200 hover:shadow-md hover:border-blue-500/50"
                                >
                                  <h4 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    {suggestion.title}
                                  </h4>
                                  <p className="text-base text-zinc-700 dark:text-zinc-300 mb-4 leading-relaxed">
                                    {suggestion.description}
                                  </p>
                                  <div className="space-y-3">
                                    <h5 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                      <List className="h-4 w-4 text-blue-500" />
                                      Key Learning Points
                                    </h5>
                                    <ul className="space-y-2">
                                      {suggestion.keyPoints.map((point, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                                          <BrainCircuit className="mt-1 h-4 w-4 flex-shrink-0 text-blue-500" />
                                          <span className="text-sm leading-relaxed">{point}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                      <Clock className="h-4 w-4" />
                                      <span>{form.getValues('timeAllocation')} minutes</span>
                                      <Award className="h-4 w-4 ml-2" />
                                      <span>{form.getValues('difficulty')}</span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="transition-all duration-200 hover:border-blue-500 hover:text-blue-500"
                                      onClick={() => {
                                        const timeAllocation = form.getValues('timeAllocation');
                                        const formattedInstructions = `${suggestion.description}\n\nKey Points:\n${suggestion.keyPoints.map(point => `• ${point}`).join('\n')}\n• Time Allocation: ${timeAllocation} minutes`;
                                        form.setValue('title', suggestion.title);
                                        form.setValue('instructions', formattedInstructions);
                                        form.trigger('title');
                                        form.trigger('instructions');
                                        setSuggestions([]);
                                        toast.success('Challenge updated', {
                                          description: 'Title and instructions have been added to the form.',
                                        });
                                      }}
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Use This Challenge
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Reduced space between suggestions and button */}
                        <div className="mt-4">
                          <Button 
                            type="submit" 
                            className="w-full h-11 text-base font-medium transition-all duration-200 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500" 
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Saving Challenge...
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-5 w-5" />
                                Save Challenge
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guide" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
