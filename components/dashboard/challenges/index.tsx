'use client';

import { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useChallenges } from '@/hooks/useChallenges';
import { useChallengeFilters } from '@/hooks/useChallengeFilters';
import { usePagination } from '@/hooks/usePagination';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const ITEMS_PER_PAGE = 30;

export default function Challenges({ user, userDetails }: Props) {
  const { challenges, isLoading, error } = useChallenges();
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
              <div className="w-full">
                <CardTitle className="text-2xl font-semibold text-foreground">Writing Challenges</CardTitle>
                <p className="text-muted-foreground mt-1">Improve your language skills with our curated challenges</p>
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
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setSelectedLevel(selectedLevel === level.value ? null : level.value)}
                      className={`
                        px-2.5 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5
                        ${selectedLevel === level.value
                          ? `${level.bgColor} ${level.textColor}`
                          : 'bg-secondary hover:bg-secondary/80'}
                      `}
                    >
                      {level.label}
                      {selectedLevel === level.value && (
                        <X className="h-3.5 w-3.5 opacity-70 hover:opacity-100" />
                      )}
                    </button>
                  ))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {paginatedChallenges.length === 0 ? (
                    <>
                      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-lg font-medium text-muted-foreground">No challenges found</p>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                      </div>
                      {/* Placeholder cards to maintain layout */}
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="p-4 rounded-lg border bg-card/50 animate-pulse">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="w-12 h-5 bg-muted rounded-full"></div>
                              <div className="w-16 h-4 bg-muted rounded-md"></div>
                            </div>
                            <div>
                              <div className="w-3/4 h-5 bg-muted rounded-md"></div>
                              <div className="space-y-2 mt-2">
                                <div className="w-full h-4 bg-muted rounded-md"></div>
                                <div className="w-2/3 h-4 bg-muted rounded-md"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    paginatedChallenges.map((challenge) => (
                      <Link 
                        href={`/dashboard/test?challenge=${challenge.id}`}
                        key={challenge.id}
                        className="block group"
                      >
                        <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span
                                className={`
                                  inline-flex text-xs font-medium px-2 py-0.5 rounded-full
                                  ${challenge.difficulty_level
                                    ? `${difficultyLevels.find(l => l.value === challenge.difficulty_level.toLowerCase())?.bgColor || ''} ${difficultyLevels.find(l => l.value === challenge.difficulty_level.toLowerCase())?.textColor || ''}`
                                    : 'bg-secondary text-secondary-foreground'}
                                `}
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
                      </Link>
                    ))
                  )}
                </div>

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
