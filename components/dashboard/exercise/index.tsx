"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/auth-helpers-nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/layout';
import ExerciseOverview from './components/overview';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useUserLevel } from '@/hooks/useUserLevel';
import ExerciseList from './components/exercise-list';
import ExerciseDetails from './components/exercise-details'; 
interface Props {
  title?: string;
  description?: string;
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

export default function Exercise({ title, description, user, userDetails }: Props) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(true);

  const [weakestSkills, setWeakestSkills] = useState<string[]>([]);
  const [userProgressId, setUserProgressId] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [exercisesTaken, setExercisesTaken] = useState(0);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Array<{
    id: string;
    title: string;
    description: string;
    completed?: boolean;
    score?: number;
  }>>([]);

  const { updateLevel } = useUserLevel({ user, initialLevel: difficulty || 'A1' });

  useUserProgress(supabase, user?.id as string, {
    setWeakestSkills,
    setUserProgressId,
    setUpdatedAt,
    setCurrentStreak,
    setExercisesTaken,
    setDifficulty,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching exercise data:', error);
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data: exercisesData, error } = await supabase
          .from('exercises')
          .select('id, topic, description, difficulty_level, grammar_category')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (error) throw error;

        // Get user progress for completed exercises
        const { data: userProgress, error: progressError } = await supabase
          .from('user_exercise_progress')
          .select('exercise_id, score')
          .eq('user_id', user?.id);

        if (progressError) throw progressError;

        // Map database exercises to component format
        const formattedExercises = exercisesData.map(exercise => ({
          id: exercise.id,
          title: exercise.topic,
          description: exercise.description,
          completed: userProgress?.some(progress => progress.exercise_id === exercise.id) ?? false,
          score: userProgress?.find(progress => progress.exercise_id === exercise.id)?.score
        }));

        setExercises(formattedExercises);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchExercises();
    }
  }, [user, supabase]);

  const handleLevelChange = async (newLevel: string) => {
    const result = await updateLevel(newLevel);
    if (!result || !result.success) {
      console.error('Failed to update level');
      return;
    }
  };

  if (!user) {
    router.push('/dashboard/signin');
    return null;
  }

  return (
    <DashboardLayout
      user={user} 
      userDetails={userDetails} 
      title={title || 'Exercises'}
      description={description || "Practice your language skills with targeted exercises."}>
      <div className="grid gap-6">
        <ExerciseOverview
          difficultyLevel={difficulty || 'A1'}
          weakestSkills={weakestSkills}
          lastUpdated={updatedAt ? new Date(updatedAt) : new Date()}
          onLevelChange={handleLevelChange}
        />
        {/* Exercise List will go here */}
        {/* Exercise Details will go here */}
        {/* Exercise Grading will go here */}
      </div>
      <div className="mt-6 grid md:grid-cols-5 gap-6">
          <div className="md:col-span-1 space-y-6">
            <ExerciseList
              exercises={exercises}
              selectedId={selectedExerciseId}
              onSelect={setSelectedExerciseId}
            />
          </div>

          <div className="md:col-span-3">
            {selectedExerciseId !== null && selectedExerciseId !== undefined && (
              <ExerciseDetails
              exercise={
                exercises.find(exercise => exercise.id === selectedExerciseId)
              }
                onStart={() => console.log('Starting exercise...')}
                onContinue={() => console.log('Continuing exercise...')}
              />
            )}
          </div>
      </div>
    </DashboardLayout>
  );
}
