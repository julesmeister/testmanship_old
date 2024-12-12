import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

interface TopicData {
  topic: string;
  description: string;
  exercise_types: string[];
  difficulty_level?: string;
  grammar_category?: string;
}

export function useAddTopic(supabase: SupabaseClient, selectedLevel: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getLastOrderIndex = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('order_index', { count: 'exact' })
      .order('order_index', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last order index:', error);
      throw error;
    }

    return data && data.length > 0 ? data[0].order_index : 0; // Return 0 if no entries found
  };

  const addTopic = async (data: TopicData): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Fetch the last order index before adding a new topic
      const lastOrderIndex = await getLastOrderIndex();
      const newOrderIndex = lastOrderIndex + 1; // Increment for new topic

      // Log the data being sent
      console.log('Adding topic with data:', data);

      // Validate required fields
      if (!data.topic || !data.description || !data.exercise_types) {
        console.error('Missing required fields in topic data.');
        throw new Error('Please fill in all required fields.');
      }

      const { error } = await supabase
        .from('exercises')
        .insert([{
          ...data,
          difficulty_level: selectedLevel,
          order_index: newOrderIndex, // Include new order index
        }]);

      if (error) {
        console.error('Error adding topic:', error);
        throw error;
      }

      setIsOpen(false);
      return true; // Return true on success
    } catch (error) {
      console.error('Error in addTopic:', error);
      return false; // Return false on error
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    isLoading,
    addTopic
  };
}
