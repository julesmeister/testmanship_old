import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { WordsmithUser, RawWordsmithUser } from '@/types/wordsmith';

export function useWordsmithUsers() {
  const supabase = createClientComponentClient();
  const [users, setUsers] = useState<WordsmithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      const { data: rawUsers, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          avatar_url,
          credits,
          trial_credits,
          target_language:target_language_id(name),
          native_language:native_language_id(name),
          updated_at
        `)
        .order('full_name');

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      // Process the raw data to match our interface
      const processedUsers: WordsmithUser[] = (rawUsers as RawWordsmithUser[]).map(user => ({
        ...user,
        target_language: user.target_language?.[0] || undefined,
        native_language: user.native_language?.[0] || undefined
      }));

      setUsers(processedUsers);
      setIsLoading(false);
    }

    fetchUsers();
  }, [supabase]);

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    totalCredits: users.reduce((sum, user) => sum + user.credits, 0),
    activeThisWeek: users.filter(u => new Date(u.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
  };

  return {
    users: filteredUsers,
    isLoading,
    searchQuery,
    setSearchQuery,
    stats
  };
}
