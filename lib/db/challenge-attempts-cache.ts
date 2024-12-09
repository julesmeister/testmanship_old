import Dexie from 'dexie';
import { ChallengeAttempt } from '@/types/challenge';

export interface CachedChallengeAttempt extends ChallengeAttempt {
  // Caching metadata
  cached_at: number;  // Timestamp of when this was cached
  cache_expiry: number;  // Timestamp when this cache entry expires
  
  // Additional fields from Supabase query
  attempt_id?: string;  // Original ID from database
  challenge_id: string;  
  challenge_title?: string;
  difficulty_level?: string;
  performance_score?: number;
  paragraph_count?: number;
  word_count: number;
  completed_at: Date;
  time_spent: number;
  format_name?: string;
  content: string;
  feedback?: string;
  
  // Explicit user tracking
  user_id: string;
}

export class ChallengeAttemptsCache extends Dexie {
  challengeAttempts: Dexie.Table<CachedChallengeAttempt, string>;

  constructor() {
    super('ChallengeAttemptsCache');
    this.version(1).stores({
      challengeAttempts: '++id, user_id, challenge_id, cached_at, cache_expiry, attempt_id, challenge_title, difficulty_level, performance_score, paragraph_count, word_count, completed_at, time_spent, format_name, content, feedback'
    });
    this.challengeAttempts = this.table('challengeAttempts');
  }

  async getCachedAttempts(userId: string, maxAgeMinutes: number = 60): Promise<CachedChallengeAttempt[]> {
    const currentTime = Date.now();
    
    return this.challengeAttempts
      .where('user_id').equals(userId)
      .and(item => item.cache_expiry > currentTime)
      .toArray();
  }

  async cacheAttempts(
    attempts: (ChallengeAttempt & { 
      attempt_id?: string;
      challenge_id: string;
      challenge_title?: string;
      difficulty_level?: string;
      performance_score?: number;
      paragraph_count?: number;
      word_count?: number;
      completed_at?: Date | string;
      time_spent?: number;
      format_name?: string;
      content?: string;
      feedback?: string;
    })[], 
    userId: string, 
    cacheValidityMinutes: number = 60
  ): Promise<void> {
    const currentTime = Date.now();
    const expiryTime = currentTime + (cacheValidityMinutes * 60 * 1000);

    const cachedAttempts: CachedChallengeAttempt[] = attempts.map(attempt => ({
      ...attempt,
      user_id: userId,
      cached_at: currentTime,
      cache_expiry: expiryTime,
      attempt_id: attempt.attempt_id,
      challenge_id: attempt.challenge_id,
      challenge_title: attempt.challenge_title,
      difficulty_level: attempt.difficulty_level,
      performance_score: attempt.performance_score,
      paragraph_count: attempt.paragraph_count,
      word_count: attempt.word_count,
      completed_at: attempt.completed_at,
      time_spent: attempt.time_spent,
      format_name: attempt.format_name,
      content: attempt.content,
      feedback: attempt.feedback
    }));

    // Clear previous cache for this user before adding new entries
    await this.challengeAttempts
      .where('user_id').equals(userId)
      .delete();

    await this.challengeAttempts.bulkAdd(cachedAttempts);
  }

  async clearExpiredCache(userId?: string): Promise<number> {
    const currentTime = Date.now();
    
    if (userId) {
      return this.challengeAttempts
        .where('user_id').equals(userId)
        .and(item => item.cache_expiry <= currentTime)
        .delete();
    }
    
    return this.challengeAttempts
      .where('cache_expiry').below(currentTime)
      .delete();
  }

  async clear(userId?: string): Promise<number> {
    if (!userId) {
      // Clear entire cache and return number of records deleted
      const count = await this.challengeAttempts.count();
      await this.challengeAttempts.clear();
      return count;
    }
    
    // Clear cache for specific user and return number of records deleted
    const count = await this.challengeAttempts.where('user_id').equals(userId).count();
    await this.challengeAttempts.where('user_id').equals(userId).delete();
    return count;
  }
}

export const challengeAttemptsCache = new ChallengeAttemptsCache();
