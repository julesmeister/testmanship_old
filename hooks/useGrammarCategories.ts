import { useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

export function useGrammarCategories(supabase: SupabaseClient) {
  const [grammarCategories, setGrammarCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrammarCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('exercises')
          .select('grammar_category')
          .neq('grammar_category', null);
        if (error) {
          console.error('Error fetching grammar categories:', error);
          setError(error.message);
        } else if (!data || data.length === 0) {
            console.warn('No grammar categories found.');
            setGrammarCategories([]); // Set to an empty array if no categories are found
        } else {
            const categories = [...new Set(data.map((item) => item.grammar_category))];
            setGrammarCategories(categories);
        }
      } catch (err) {
        console.error('Error fetching grammar categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrammarCategories();
  }, [supabase]);

  return { grammarCategories, loading, error };
}
