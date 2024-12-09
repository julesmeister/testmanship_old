import Dexie from 'dexie';

export interface CachedExerciseContentByDifficulty {
  id?: string;
  exercise_id: string;
  topic?: string;
  description?: string;
  content: any;
  exercise_types: string[];
  difficulty: string;
  order_index: number;
  cached_at: number;
}

export interface CachedUserProgressByDifficulty {
  id?: string;
  user_id: string;
  difficulty: string;
  exercise_id: string;
  score?: number;
  cached_at: number;
}

export class ExerciseCacheByDifficultyDB extends Dexie {
  difficultyExerciseContent: Dexie.Table<CachedExerciseContentByDifficulty, string>;
  userProgress: Dexie.Table<CachedUserProgressByDifficulty, string>;

  constructor() {
    super('ExerciseCacheByDifficultyDB');
    this.version(1).stores({
      difficultyExerciseContent: '++id, exercise_id, topic, description, content, exercise_types, difficulty, order_index, cached_at',
      userProgress: '++id, user_id, difficulty, exercise_id, score, cached_at'
    });
    this.difficultyExerciseContent = this.table('difficultyExerciseContent');
    this.userProgress = this.table('userProgress');
  }

  async getCachedContent(exerciseId: string, difficulty: string): Promise<CachedExerciseContentByDifficulty[]> {
    const cachedContent = await this.difficultyExerciseContent
      .where({ exercise_id: exerciseId, difficulty: difficulty })
      .toArray();
    return cachedContent;
  }

  async cacheContent(content: CachedExerciseContentByDifficulty[]) {
    console.log(`cacheContent: content=${JSON.stringify(content.map(item => ({
      exercise_id: item.exercise_id,
      topic: item.topic,
      order_index: item.order_index,
      difficulty: item.difficulty
    })), null, 2)}`);

    const cachedContent = content.map(item => ({
      ...item,
      order_index: item.order_index,  
      cached_at: Date.now()
    }));

    await this.difficultyExerciseContent.bulkPut(cachedContent);
    console.log(`Cached ${cachedContent.length} exercises with order_index:`, 
      cachedContent.map(item => `${item.exercise_id}: ${item.order_index}`));
  }

  async getCachedUserProgress(userId: string, difficulty: string): Promise<CachedUserProgressByDifficulty[]> {
    return this.userProgress
      .where({ user_id: userId, difficulty: difficulty })
      .toArray();
  }

  async cacheUserProgress(progress: CachedUserProgressByDifficulty[]) {
    const cachedProgress = progress.map(item => ({
      ...item,
      cached_at: Date.now()
    }));
    await this.userProgress.bulkPut(cachedProgress);
  }

  async clearSpecificExerciseCache(exerciseId: string, difficulty: string) {
    await this.difficultyExerciseContent
      .where({ exercise_id: exerciseId, difficulty: difficulty })
      .delete();
  }

  async clearSpecificUserProgressCache(userId: string, difficulty: string) {
    await this.userProgress
      .where({ user_id: userId, difficulty: difficulty })
      .delete();
  }

  async clearAllExerciseCache() {
    console.log('🗑️ Clearing ALL exercise cache');
    const cachedExercisesCount = await this.difficultyExerciseContent.count();
    await this.difficultyExerciseContent.clear();
    console.log(`🧹 Cleared ${cachedExercisesCount} cached exercises`);
  }

  async clearAllUserProgressCache() {
    console.log('🗑️ Clearing ALL user progress cache');
    const cachedProgressCount = await this.userProgress.count();
    await this.userProgress.clear();
    console.log(`🧹 Cleared ${cachedProgressCount} user progress entries`);
  }

  async clearExpiredCache() {
    // Kept for backwards compatibility, but does nothing
    return;
  }
}

export const exerciseCacheByDifficulty = new ExerciseCacheByDifficultyDB();
