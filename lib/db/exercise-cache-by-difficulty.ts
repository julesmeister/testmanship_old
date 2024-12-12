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
  attempts: number;
}

export class ExerciseCacheByDifficultyDB extends Dexie {
  difficultyExerciseContent: Dexie.Table<CachedExerciseContentByDifficulty, string>;
  userProgress: Dexie.Table<CachedUserProgressByDifficulty, string>;

  constructor() {
    super('ExerciseCacheByDifficultyDB');
    this.version(1).stores({
      difficultyExerciseContent: '++id, exercise_id, topic, description, content, exercise_types, difficulty, order_index, cached_at',
      userProgress: '++id, user_id, difficulty, exercise_id, score, cached_at, attempts'
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

  async clearSpecificExerciseCache(exerciseId: string) {
    await this.difficultyExerciseContent
      .where({ exercise_id: exerciseId })
      .delete();
  }

  async clearSpecificUserProgressCache(userId: string, difficulty: string) {
    await this.userProgress
      .where({ user_id: userId, difficulty: difficulty })
      .delete();
  }

  async clearAllExerciseCache() {
    console.log(' Clearing ALL exercise cache');
    const cachedExercisesCount = await this.difficultyExerciseContent.count();
    await this.difficultyExerciseContent.clear();
    console.log(` Cleared ${cachedExercisesCount} cached exercises`);
  }

  async clearAllUserProgressCache() {
    console.log(' Clearing ALL user progress cache');
    const cachedProgressCount = await this.userProgress.count();
    await this.userProgress.clear();
    console.log(` Cleared ${cachedProgressCount} user progress entries`);
  }

  async clearExpiredCache() {
    // Kept for backwards compatibility, but does nothing
    return;
  }

  async updateExerciseTypes(exerciseId: string, exercise_types: string[]) {
    const existingEntries = await this.difficultyExerciseContent
      .where({ exercise_id: exerciseId })
      .toArray();

    if (existingEntries.length > 0) {
      const updates = existingEntries.map(entry => ({
        ...entry,
        exercise_types,
        cached_at: Date.now()
      }));
      await this.difficultyExerciseContent.bulkPut(updates);
      console.log(` Updated exercise types for exercise ${exerciseId}`);
    }
  }

  async saveUserExerciseScore(userId: string, exerciseId: string, score: number, difficulty: string, attempts: number) {
    const existingRecord = await this.userProgress
      .where({ user_id: userId, exercise_id: exerciseId })
      .first();

    console.log('Existing Record:', existingRecord); // Log the existing record

    if (existingRecord) {
      if (existingRecord.id === undefined) {
        throw new Error('Existing record ID must be defined.');
      }
      const updateResult = await this.userProgress.update(existingRecord.id, { score, cached_at: Date.now(), attempts });
      console.log('Update Result:', updateResult); // Log the result of the update
    } else {
      const addResult = await this.userProgress.add({ user_id: userId, exercise_id: exerciseId, score, cached_at: Date.now(), difficulty, attempts });
      console.log('Add Result:', addResult); // Log the result of the add operation
    }
  }
}

export const exerciseCacheByDifficulty = new ExerciseCacheByDifficultyDB();
