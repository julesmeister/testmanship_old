import Dexie from 'dexie';

export interface CachedFormat {
  id: string;
  name: string;
  cached_at: number;
}

export class FormatCacheDB extends Dexie {
  formats: Dexie.Table<CachedFormat, string>;

  constructor() {
    super('FormatCacheDB');
    this.version(1).stores({
      formats: 'id, name, cached_at'
    });
    this.formats = this.table('formats');
  }

  async getCachedFormat(formatId: string): Promise<CachedFormat | undefined> {
    return this.formats.get(formatId);
  }

  async cacheFormat(format: CachedFormat) {
    await this.formats.put({
      ...format,
      cached_at: Date.now()
    });
  }

  async clearCache() {
    await this.formats.clear();
  }
}

export const formatCache = new FormatCacheDB();
