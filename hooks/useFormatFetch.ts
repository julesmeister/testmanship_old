import { useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { formatCache } from '@/lib/db/format-cache';

interface Challenge {
  format_id?: string;
}

export const useFormatFetch = (
  selectedChallenge: Challenge | null,
  supabase: SupabaseClient
) => {
  const [format, setFormat] = useState<string>('Unknown Format');

  useEffect(() => {
    const fetchFormat = async () => {
      if (selectedChallenge?.format_id) {
        console.log('Fetching format for format_id:', selectedChallenge.format_id);
        
        // Check cache first
        const cachedFormat = await formatCache.getCachedFormat(selectedChallenge.format_id);
        
        if (cachedFormat) {
          console.log(' Cache Hit: Retrieved format from cache', {
            formatId: selectedChallenge.format_id,
            name: cachedFormat.name,
            cacheTimestamp: new Date(cachedFormat.cached_at).toISOString()
          });
          setFormat(cachedFormat.name);
          return;
        }

        console.log(' Cache Miss: Fetching format from Supabase');
        const { data: formatData, error } = await supabase
          .from('challenge_formats')
          .select('name')
          .eq('id', selectedChallenge.format_id)
          .single();

        if (formatData) {
          console.log('Format fetched successfully:', formatData.name);
          // Cache the format
          await formatCache.cacheFormat({
            id: selectedChallenge.format_id,
            name: formatData.name,
            cached_at: Date.now()
          });
          console.log(' Cache Update: Stored format in cache');
          setFormat(formatData.name);
        } else if (error) {
          console.error('Error fetching format:', error);
          setFormat('Unknown Format');
        }
      } else {
        console.log('No format_id available in selectedChallenge');
        setFormat('Unknown Format');
      }
    };

    fetchFormat();
  }, [selectedChallenge?.format_id, supabase]);

  return format;
};
