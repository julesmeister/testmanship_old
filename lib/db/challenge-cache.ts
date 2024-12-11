import Dexie from 'dexie';
import { type Challenge } from '@/types/challenge';

export interface CachedChallenge extends Challenge {
  cached_at: number;
  difficulty_level: string;
}

export class ChallengeCacheDB extends Dexie {
  challenges: Dexie.Table<CachedChallenge, string>;

  constructor() {
    super('ChallengeCacheDB');
    this.version(1).stores({
      challenges: 'id, difficulty_level, title, cached_at'
    });
    this.challenges = this.table('challenges');
  }

  async getCachedChallenges(difficultyLevel: string, searchQuery?: string): Promise<CachedChallenge[]> {
    let collection = this.challenges.where('difficulty_level').equals(difficultyLevel.toUpperCase());
    
    if (searchQuery) {
      // Filter in memory for title search
      const challenges = await collection.toArray();
      return challenges.filter(challenge => 
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return collection.toArray();
  }

  async cacheChallenges(challenges: Challenge[], difficultyLevel: string) {
    const cachedChallenges = challenges.map(challenge => ({
      ...challenge,
      difficulty_level: difficultyLevel.toUpperCase(),
      cached_at: Date.now()
    }));
    await this.challenges.bulkPut(cachedChallenges);
  }

  async clearCache() {
    await this.challenges.clear();
  }
}

export const challengeCache = new ChallengeCacheDB();
