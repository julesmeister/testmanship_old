import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

interface TopicData {
  id: string;
  topic: string;
  description: string;
  exercise_types: string[];
}

export function useTopics(supabase: SupabaseClient) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTopic = async (topic: string, description: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: existingTopics, error: fetchError } = await supabase
        .from('topics')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const newOrderIndex = existingTopics && existingTopics[0] 
        ? existingTopics[0].order_index + 1 
        : 0;

      const { data, error: insertError } = await supabase
        .from('topics')
        .insert([
          {
            topic,
            description,
            exercise_types: [],
            order_index: newOrderIndex
          }
        ])
        .select();

      if (insertError) throw insertError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createTopic,
    isLoading,
    error
  };
}
