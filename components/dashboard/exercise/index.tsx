"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/auth-helpers-nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import  { HiOutlinePuzzlePiece} from 'react-icons/hi2';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

export default function Exercise({ user, userDetails }: Props) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Initial data fetching logic here
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching exercise data:', error);
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  if (!user) {
    router.push('/dashboard/signin');
    return null;
  }

  return (
    <DashboardLayout
    user={user} 
      userDetails={userDetails} 
      title="Exercises"
      description="Practice your language skills with targeted exercises.">
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Exercises</h2>
            <p className="text-sm text-muted-foreground">
              Practice your language skills with targeted exercises
            </p>
          </div>
          <Button
            onClick={() => {/* Handle new exercise */}}
            className="flex items-center gap-2"
          >
            <HiOutlinePuzzlePiece className="h-4 w-4" />
            New Exercise
          </Button>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Exercise content will go here */}
                  <div className="text-center text-muted-foreground">
                    Exercise content coming soon
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
