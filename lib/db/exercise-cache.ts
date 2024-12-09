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

  async getCachedContent(exerciseId: string, exerciseType: string): Promise<CachedExerciseContent[]> {
    return this.exerciseContent
      .where({ exercise_id: exerciseId, exercise_type: exerciseType })
      .toArray();
  }

  async cacheContent(content: CachedExerciseContent[]) {
    const cachedContent = content.map(item => ({
      ...item,
      cached_at: Date.now()
    }));
    await this.exerciseContent.bulkPut(cachedContent);
  }

  async clearSpecificCache(exerciseId: string, exerciseType: string) {
    await this.exerciseContent
      .where({ exercise_id: exerciseId, exercise_type: exerciseType })
      .delete();
  }

  async clearAllCache() {
    await this.exerciseContent.clear();
  }

  async clearExpiredCache() {
    // Kept for backwards compatibility, but does nothing
    return;
  }
}

export const exerciseCache = new ExerciseCacheDB();
