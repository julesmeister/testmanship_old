"use client";

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/layout';
import ExerciseOverview from './components/overview';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useUserLevel } from '@/hooks/useUserLevel';
import ExerciseList from './components/exercise-list';
import ExerciseDetails from './components/exercise-details';
import ExercisePlaceholder from './components/exercise-placeholder'; // Changed to default import
import { ExerciseGrade } from './components/exercise-grade'; // Changed to named import
import { useExercises } from '@/hooks/useExercises';
import { exerciseCacheByDifficulty } from '@/lib/db/exercise-cache-by-difficulty';
import { clear } from 'console';

interface Props {
  title?: string;
  description?: string;
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

export default function Exercise({ title, description, user, userDetails }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  const [weakestSkills, setWeakestSkills] = useState<string[]>([]);
  const [userProgressId, setUserProgressId] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [exercisesTaken, setExercisesTaken] = useState(0);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [shouldRefresh, setShouldRefresh] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0); // Initialize a refresh key

  const { updateLevel } = useUserLevel({ user, setLevel: setDifficulty, initialLevel: difficulty || 'A1' });

  const { clearCache } = useUserProgress(supabase, user?.id as string, {
    setWeakestSkills,
    setUserProgressId,
    setUpdatedAt,
    setCurrentStreak,
    setExercisesTaken,
    setDifficulty,
  });

  const handleScoreSaved = () => {
    // Instead of refreshing immediately, set a flag
    setShouldRefresh(true);
  };

  const handleTryAgain = () => {
    setShowResults(false);
    // If we have a pending refresh, do it now
    if (shouldRefresh) {
      setRefreshKey((prevKey) => prevKey + 1);
      setShouldRefresh(false);
    }
    // Temporarily clear the exercise
    const currentExerciseId = selectedExerciseId;
    setSelectedExerciseId(null);
    // Bring it back after a short delay
    setTimeout(() => {
      setSelectedExerciseId(currentExerciseId);
    }, 100);
  };

  const smoothScrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleLevelChange = async (newLevel: string) => {
    const result = await updateLevel(newLevel);
    if (!result || !result.success) {
      console.error('Failed to update level');
      return;
    }
  };

  const handleExerciseComplete = (score: number, total: number) => {
    setCorrectCount(score);
    setTotalQuestions(total);
    setShowResults(true);
    smoothScrollToTop();
    clearCache();
  };

  const handleExerciseSelect = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    smoothScrollToTop();
    setShowResults(false);
  };

  if (!user) {
    router.push('/dashboard/signin');
    return null;
  }


  const { exercises: fetchedExercises, isLoading: exercisesLoading } = useExercises({
    supabase,
    user: user ?? null,
    difficulty: difficulty || 'A1',
    refreshKey,
  });

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
            exercises={fetchedExercises}
            selectedId={selectedExerciseId}
            onSelect={handleExerciseSelect}
          />
        </div>

        <div className="md:col-span-3">
          {selectedExerciseId ? (
            <ExerciseDetails
              exerciseId={selectedExerciseId}
              exercise={fetchedExercises.find(exercise => exercise.id === selectedExerciseId)}
              onComplete={handleExerciseComplete}
              onStart={() => console.log('Starting exercise...')}
              onContinue={() => console.log('Continuing exercise...')}
              supabase={supabase}
              setShowResults={setShowResults}
            />
          ) : (
            <ExercisePlaceholder />
          )}
        </div>
        {/* Grading Section */}
        <div className="mt-6" id="grading-section">
          <ExerciseGrade
            showResults={showResults}
            correctCount={correctCount}
            totalQuestions={totalQuestions}
            onTryAgain={handleTryAgain}
            userId={user.id}
            exerciseId={selectedExerciseId}
            supabase={supabase}
            difficulty={difficulty || 'A1'}
            onScoreSaved={handleScoreSaved}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
