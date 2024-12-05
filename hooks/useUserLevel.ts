import { useState } from 'react';
import { User } from '@supabase/auth-helpers-nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface UseUserLevelProps {
  user: User | null | undefined;
  initialLevel?: string;
}

export function useUserLevel({ user, initialLevel }: UseUserLevelProps) {
  const [level, setLevel] = useState(initialLevel);
  const supabase = createClientComponentClient();

  const updateLevel = async (newLevel: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_progress')
        .update({ last_active_level: newLevel })
        .eq('user_id', user.id);

      if (error) throw error;
      setLevel(newLevel);
      return { success: true };
    } catch (error) {
      console.error('Error updating difficulty level:', error);
      return { success: false, error };
    }
  };

  return {
    level,
    updateLevel,
  };
}
