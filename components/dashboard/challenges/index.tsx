'use client';

import { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from '@/components/ui/input';
import { Search, Clock, X, Plus, PenLine, Users, ArrowRight, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useChallenges } from '@/hooks/useChallenges';
import { useChallengeFilters } from '@/hooks/useChallengeFilters';
import { usePagination } from '@/hooks/usePagination';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Badge } from '@/components/ui/badge';
import { Challenge } from "@/types/challenge";

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const ITEMS_PER_PAGE = 30;

export default function Challenges({ user, userDetails }: Props) {
  const { challenges, isLoading, error } = useChallenges();
  const [userStats, setUserStats] = useState<{ userCount: number; totalCount: number }>({ userCount: 0, totalCount: 0 });
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showUserChallengesOnly, setShowUserChallengesOnly] = useState(false);
  const [creatorName, setCreatorName] = useState<string>("");

  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return;

      const [userChallenges, totalChallenges] = await Promise.all([
        supabase.from('challenges').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('challenges').select('id', { count: 'exact' })
      ]);

      setUserStats({
        userCount: userChallenges.count || 0,
        totalCount: totalChallenges.count || 0
      });
    }

    fetchStats();
  }, [user?.id, supabase]);

  useEffect(() => {
    async function fetchCreatorDetails() {
      if (selectedChallenge?.created_by) {
        console.log('Fetching creator details for:', selectedChallenge.created_by);
        const { data, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', selectedChallenge.created_by)
          .single();

        if (error) {
          console.error('Error fetching creator details:', error);
          return;
        }

        console.log('Creator data:', data);
        if (data?.full_name) {
          console.log('Setting creator name to:', data.full_name);
          setCreatorName(data.full_name);
        }
      } else {
        console.log('No creator_by ID found in selected challenge');
      }
    }

    fetchCreatorDetails();
    return () => {
      setCreatorName(""); // Clear creator name when dialog closes
    };
  }, [selectedChallenge, supabase]);

  const {
    searchQuery,
    setSearchQuery,
    selectedLevel,
    setSelectedLevel,
    filteredChallenges,
    difficultyLevels
  } = useChallengeFilters(challenges);

  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    isFirstPage,
    isLastPage,
    hasPages
  } = usePagination({
    totalItems: filteredChallenges.length,
    itemsPerPage: ITEMS_PER_PAGE
  });

  const paginatedChallenges = filteredChallenges.slice(startIndex, endIndex);

  if (error) {
    return (
      <DashboardLayout
        user={user}
        userDetails={userDetails}
        title="Writing Challenges"
        description="Browse and start writing challenges"
      >
        <div className="flex items-center justify-center h-96">
          <p className="text-destructive">Error loading challenges. Please try again later.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Writing Challenges"
      description="Browse and start writing challenges"
    >
      <div className="min-h-screen w-full">
        <Card className="w-full">
          <CardHeader className="border-b">
            <div className="flex flex-col space-y-6 w-full">
              <div className="flex items-start justify-between w-full">
                <div>
                  <CardTitle className="text-2xl font-semibold text-foreground">Writing Challenges</CardTitle>
                  <p className="text-muted-foreground mt-1">Improve your language skills with our curated challenges</p>
                  <div className="flex gap-8 mt-4">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary/70 transition-colors relative group"
                      onClick={() => setShowUserChallengesOnly(prev => !prev)}>
                      <div className="p-2 rounded-md bg-primary/10">
                        <PenLine className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-foreground">{userStats.userCount}</span>
                        <span className="text-sm font-medium text-muted-foreground">Your challenges</span>
                      </div>
                      {showUserChallengesOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUserChallengesOnly(false);
                          }}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Clear filter</span>
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary/50">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-foreground">{userStats.totalCount}</span>
                        <span className="text-sm font-medium text-muted-foreground">Community challenges</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Link href="/dashboard/challenge-generator" className="shrink-0">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Challenge
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
                <div className="w-full max-w-md">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search challenges..."
                      className="pl-9 bg-background w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {difficultyLevels.map((level) => {
                    const levelColors = {
                      'a1': 'bg-emerald-400 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600',
                      'a2': 'bg-teal-400 hover:bg-teal-500 text-white dark:bg-teal-500 dark:hover:bg-teal-600',
                      'b1': 'bg-amber-400 hover:bg-amber-500 text-white dark:bg-amber-500 dark:hover:bg-amber-600',
                      'b2': 'bg-orange-400 hover:bg-orange-500 text-white dark:bg-orange-500 dark:hover:bg-orange-600',
                      'c1': 'bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-600 dark:hover:bg-rose-700',
                      'c2': 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800'
                    }[level.value];

                    return (
                      <button
                        key={level.value}
                        onClick={() => setSelectedLevel(selectedLevel === level.value ? null : level.value)}
                        className={`px-2.5 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                          selectedLevel === level.value
                          ? levelColors
                          : 'bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground'
                        }`}
                      >
                        {level.label}
                        {selectedLevel === level.value && (
                          <X className="h-3.5 w-3.5 text-current opacity-70 hover:opacity-100" />
                        )}
                      </button>
                    );
                  })}
                  {selectedLevel && (
                    <button
                      onClick={() => setSelectedLevel(null)}
                      className="px-2 py-1 rounded-md text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">Loading challenges...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {challenges
                    .filter(challenge => !showUserChallengesOnly || challenge.created_by === user?.id)
                    .map((challenge) => (
                      <div
                        onClick={() => {
                          console.log('Setting selected challenge:', challenge);
                          setSelectedChallenge(challenge);
                        }}
                        key={challenge.id}
                        className="block group cursor-pointer"
                      >
                        <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span
                                className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                                  challenge.difficulty_level ? {
                                    'a1': 'bg-emerald-400 text-white dark:bg-emerald-500',
                                    'a2': 'bg-teal-400 text-white dark:bg-teal-500',
                                    'b1': 'bg-amber-400 text-white dark:bg-amber-500',
                                    'b2': 'bg-orange-400 text-white dark:bg-orange-500',
                                    'c1': 'bg-rose-500 text-white dark:bg-rose-600',
                                    'c2': 'bg-red-600 text-white dark:bg-red-700'
                                  }[challenge.difficulty_level.toLowerCase()] || 'bg-secondary text-secondary-foreground'
                                  : 'bg-secondary text-secondary-foreground'
                                }`}
                              >
                                {challenge.difficulty_level ? challenge.difficulty_level.toUpperCase() : 'N/A'}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {challenge.time_allocation} min
                              </span>
                            </div>

                            <div>
                              <h3 className="font-medium text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {challenge.title}
                              </h3>
                              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                                {challenge.instructions}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <Dialog open={!!selectedChallenge} onOpenChange={() => setSelectedChallenge(null)}>
                  <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-sm border-none">
                    <DialogHeader className="pr-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full shrink-0
                                ${selectedChallenge?.difficulty_level ? {
                                  'a1': 'bg-emerald-400 text-white dark:bg-emerald-500',
                                  'a2': 'bg-teal-400 text-white dark:bg-teal-500',
                                  'b1': 'bg-amber-400 text-white dark:bg-amber-500',
                                  'b2': 'bg-orange-400 text-white dark:bg-orange-500',
                                  'c1': 'bg-rose-500 text-white dark:bg-rose-600',
                                  'c2': 'bg-red-600 text-white dark:bg-red-700'
                                }[selectedChallenge.difficulty_level.toLowerCase()] || 'bg-secondary text-secondary-foreground'
                                  : 'bg-secondary text-secondary-foreground'
                                }`}
                            >
                              {selectedChallenge?.difficulty_level ? selectedChallenge.difficulty_level.toUpperCase() : 'N/A'}
                            </span>
                            {selectedChallenge?.created_by === user?.id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Add edit functionality
                                  console.log('Edit challenge:', selectedChallenge);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit challenge</span>
                              </Button>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground flex items-center gap-1.5 shrink-0">
                            <Clock className="h-4 w-4" />
                            {selectedChallenge?.time_allocation} minutes
                          </span>
                        </div>
                        <DialogTitle className="text-2xl font-semibold pr-6">
                          {selectedChallenge?.title}
                          {creatorName ? (
                            <div className="text-sm font-normal text-muted-foreground mt-1">
                              Created by {creatorName}
                            </div>
                          ) : (
                            <div className="text-sm font-normal text-muted-foreground mt-1">
                              Loading creator...
                            </div>
                          )}
                        </DialogTitle>
                      </div>
                    </DialogHeader>
                    <div className="mt-1 space-y-6">
                      {/* Main Challenge Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-blue-500/10 space-y-2 border border-blue-500/20">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300">Time Allocation</h4>
                          </div>
                          <p className="text-2xl font-semibold text-blue-900 dark:text-blue-50">{selectedChallenge?.time_allocation} min</p>
                        </div>
                        {selectedChallenge?.word_count && (
                          <div className="p-4 rounded-lg bg-emerald-500/10 space-y-2 border border-emerald-500/20">
                            <div className="flex items-center gap-2">
                              <PenLine className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              <h4 className="font-medium text-sm text-emerald-700 dark:text-emerald-300">Target Word Count</h4>
                            </div>
                            <p className="text-2xl font-semibold text-emerald-900 dark:text-emerald-50">{selectedChallenge.word_count} words</p>
                          </div>
                        )}
                      </div>

                      {/* Instructions Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Instructions</h4>
                          <div className="h-px flex-1 bg-border"></div>
                        </div>
                        <div className="p-4 rounded-lg bg-card border">
                          <p className="text-foreground leading-relaxed">
                            {selectedChallenge?.instructions}
                          </p>
                        </div>
                      </div>

                      {/* Focus Areas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedChallenge?.grammar_focus && selectedChallenge.grammar_focus.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">Grammar Focus</h4>
                              <div className="h-px flex-1 bg-border"></div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedChallenge.grammar_focus.map((item, index) => (
                                <div key={index} className="px-2.5 py-1 rounded-md bg-blue-500/10 text-sm border border-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors">
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedChallenge?.vocabulary_themes && selectedChallenge.vocabulary_themes.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">Vocabulary Themes</h4>
                              <div className="h-px flex-1 bg-border"></div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedChallenge.vocabulary_themes.map((theme, index) => (
                                <div key={index} className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-sm border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors">
                                  {theme}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Start Challenge Button */}
                      <div className="pt-4">
                        <Link href={`/dashboard/test?challenge=${selectedChallenge?.id}`}>
                          <Button className="w-full gap-2 h-12 text-base">
                            Start Challenge
                            <ArrowRight className="h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {hasPages && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{startIndex + 1}</span> to{' '}
                        <span className="font-medium text-foreground">{endIndex}</span> of{' '}
                        <span className="font-medium text-foreground">{filteredChallenges.length}</span> challenges
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToFirstPage}
                        disabled={isFirstPage}
                        className="hidden sm:flex"
                      >
                        First
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={isFirstPage}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1 px-2">
                        <div className="text-sm">
                          Page <span className="font-medium">{currentPage}</span> of{' '}
                          <span className="font-medium">{totalPages}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={isLastPage}
                      >
                        Next
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToLastPage}
                        disabled={isLastPage}
                        className="hidden sm:flex"
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                )}
              </>

            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
