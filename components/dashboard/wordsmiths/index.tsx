"use client";

import { useEffect, useState } from 'react';
import { User } from '@supabase/auth-helpers-nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Clock, Star, Users } from 'lucide-react';
import DashboardLayout from '@/components/layout';
import { formatDistanceToNow } from 'date-fns';

// Raw data type from Supabase
interface RawWordsmithUser {
  id: string;
  full_name: string;
  avatar_url: string;
  credits: number;
  trial_credits: number;
  target_language: { name: string }[] | null;
  native_language: { name: string }[] | null;
  updated_at: string;
}

// Processed data type for the component
interface WordsmithUser {
  id: string;
  full_name: string;
  avatar_url: string;
  credits: number;
  trial_credits: number;
  target_language?: { name: string };
  native_language?: { name: string };
  updated_at: string;
}

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

export default function Wordsmiths({ user, userDetails }: Props) {
  const supabase = createClientComponentClient();
  const [users, setUsers] = useState<WordsmithUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  const content = (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Wordsmiths</h2>
        <p className="text-muted-foreground">
          Browse and discover fellow language learners in the community.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total Wordsmiths</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Star className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {users.reduce((sum, user) => sum + user.credits, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Credits</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {users.filter(u => new Date(u.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-sm text-muted-foreground">Active This Week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search Wordsmiths by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="group overflow-hidden transition-colors hover:border-primary">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 ring-2 ring-background">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {user.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{user.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last active {formatDistanceToNow(new Date(user.updated_at))} ago
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.target_language && (
                        <Badge variant="secondary" className="group-hover:bg-primary/10">
                          Learning: {user.target_language.name}
                        </Badge>
                      )}
                      {user.native_language && (
                        <Badge variant="outline" className="group-hover:border-primary/30">
                          Native: {user.native_language.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-6 text-sm">
                  <div>
                    <Label className="font-normal text-muted-foreground">Credits</Label>
                    <p className="mt-1 text-xl font-semibold text-foreground">{user.credits}</p>
                  </div>
                  <div>
                    <Label className="font-normal text-muted-foreground">Trial Credits</Label>
                    <p className="mt-1 text-xl font-semibold text-foreground">{user.trial_credits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="relative">
            <Users className="h-20 w-20 text-muted-foreground/20" />
            
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-foreground">No Wordsmiths Found</h3>
          {searchQuery ? (
            <>
              <p className="mt-3 max-w-[500px] text-muted-foreground">
                No users match your search criteria. Try adjusting your search terms or clearing the search to see all Wordsmiths.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-6 text-sm [&_svg]:mx-auto [&_svg]:mb-2">
                <div className="space-y-1 text-muted-foreground">
                  <Search className="h-5 w-5" />
                  <p className="font-medium">Search Tips</p>
                  <p>Try searching by name, native language, or target language</p>
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <p className="font-medium">About Wordsmiths</p>
                  <p>Connect with language learners who share your learning goals</p>
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <Star className="h-5 w-5" />
                  <p className="font-medium">Why Connect?</p>
                  <p>Exchange language knowledge and earn credits through helping others</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 max-w-[500px] text-muted-foreground">
                Wordsmiths are passionate language learners in our community. They earn credits by helping others learn their native language
                and spend them to receive help with their target language.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm [&_svg]:mx-auto [&_svg]:mb-2">
                <div className="space-y-1 text-muted-foreground">
                  <Star className="h-5 w-5" />
                  <p>Earn credits by helping others</p>
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <p>Track learning progress</p>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );

  return (
    <DashboardLayout 
      user={user} 
      userDetails={userDetails}
      title="Wordsmiths"
      description="Discover and connect with fellow language learners in our community."
    >
      {content}
    </DashboardLayout>
  );
}
