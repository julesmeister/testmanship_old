import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { useLanguageStore } from '@/stores/language';
import { ExerciseCacheByDifficultyDB } from '@/lib/db/exercise-cache-by-difficulty'; // Adjust the import path as necessary
interface TopicData {
    id: string;
    order_index: number;
}

interface TopicUpdate {
    id: string;
    topic: any;
    order_index: number;
    description: string;
}

const useUpdateOrderIndex = (supabase: SupabaseClient, selectedLevel: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { selectedLanguageId, languages } = useLanguageStore();

    const updateOrderIndex = async (topics: TopicData[]) => {
        setIsLoading(true);
        setError(null);
        const updates = topics.map(topic => ({
            id: topic.id,
            order_index: topic.order_index,
        }));

        const validUpdates = updates.filter(update => update.order_index !== null && update.order_index !== undefined && update.id !== null && update.id !== undefined);

        const lang = languages.find(lang => lang.id === selectedLanguageId)?.name || 'German';
        const currentTopics = await supabase
            .from('exercises')
            .select('*')
            .eq('difficulty_level', selectedLevel)
            .eq('lang', lang)
            .in('id', validUpdates.map(update => update.id));

        const updatesWithTopics = validUpdates.map(update => {
            const currentTopic = currentTopics && currentTopics.data ? currentTopics.data.find(topic => topic.id === update.id) : null;
            return {
                id: update.id,
                topic: currentTopic ? currentTopic.topic : null,
                order_index: update.order_index,
                description: currentTopic ? currentTopic.description : 'Default description',
                exercise_types: currentTopic ? currentTopic.exercise_types : 'Default value', // Get current or set default
                grammar_category: currentTopic ? currentTopic.grammar_category : 'Default value',
            };
        });

        const { error: supabaseError } = currentTopics;

        if (supabaseError) {
            console.error('Error updating order_index:', supabaseError);
            console.error('Supabase error object:', JSON.stringify(supabaseError, null, 2));
            console.error('Supabase error details:', supabaseError.details);
            setError(supabaseError.message);
            setIsLoading(false);
        } else {
            const { error: upsertError } = await supabase
                .from('exercises')
                .upsert(updatesWithTopics);

            if (upsertError) {
                console.error('Error during upsert:', upsertError);
                setError(upsertError.message);
            } else {
                console.log('Order index updated successfully');
                // clear cache 
                const cache = new ExerciseCacheByDifficultyDB();
                await cache.clearAllExerciseCache();
            }
            setIsLoading(false);
        }
        
    };
    const success = error === null; // or however you determine success

    return { updateOrderIndex, isLoading, error, success };
};

export default useUpdateOrderIndex;