'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

export default function LanguageTest() {
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchLanguages = async () => {
      console.log('🔄 Starting language fetch test...');
      
      try {
        const { data, error } = await supabase
          .from('supported_languages')
          .select('*');

        if (error) {
          console.error('❌ Error fetching languages:', error);
          setError(error);
          return;
        }

        console.log('✅ Languages fetched:', data);
        setData(data);
      } catch (err) {
        console.error('🔥 Unexpected error:', err);
        setError(err);
      }
    };

    fetchLanguages();
  }, [supabase]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        <h3 className="font-bold">Error fetching languages:</h3>
        <pre className="mt-2 text-sm overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  if (!data) {
    return <div className="p-4">Loading languages...</div>;
  }

  return (
    <div className="p-4">
      <h3 className="font-bold mb-2">Languages loaded:</h3>
      <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
