import Dexie from 'dexie';

export interface CachedExerciseContent {
  id?: string;
  exercise_id: string;
  topic: string;
  content: any;
  exercise_type: string;
  order_index: number;
  cached_at: number;
}

export class ExerciseCacheDB extends Dexie {
  exerciseContent: Dexie.Table<CachedExerciseContent, string>;

  constructor() {
    super('ExerciseCacheDB');
    this.version(1).stores({
      exerciseContent: '++id, exercise_id, exercise_type, cached_at'
    });
    this.exerciseContent = this.table('exerciseContent');
  }

  // Cache is valid for 1 hour
  private static CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

  async getCachedContent(exerciseId: string, exerciseType: string): Promise<CachedExerciseContent[]> {
    const now = Date.now();
    return this.exerciseContent
      .where({ exercise_id: exerciseId, exercise_type: exerciseType })
      .and(item => now - item.cached_at < ExerciseCacheDB.CACHE_DURATION)
      .toArray();
  }

  async cacheContent(content: CachedExerciseContent[]) {
    const cachedContent = content.map(item => ({
      ...item,
      cached_at: Date.now()
    }));
    await this.exerciseContent.bulkPut(cachedContent);
  }

  async clearExpiredCache() {
    const now = Date.now();
    await this.exerciseContent
      .where('cached_at')
      .below(now - ExerciseCacheDB.CACHE_DURATION)
      .delete();
  }
}

export const exerciseCache = new ExerciseCacheDB();
