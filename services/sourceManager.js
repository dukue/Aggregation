import AsyncStorage from '@react-native-async-storage/async-storage';

class SourceManager {
  constructor() {
    this.sources = new Map();
    this.initialized = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    if (!this.initialized) {
      await this.loadSources();
      this.initialized = true;
    }
    return this;
  }

  async loadSources() {
    try {
      const sourcesStr = await AsyncStorage.getItem('book_sources');
      if (sourcesStr) {
        const sources = JSON.parse(sourcesStr);
        this.sources.clear();
        sources.forEach(source => {
          this.sources.set(source.bookSourceUrl, {
            source: {
              ...source,
              enabled: source.enabled ?? true,
              bookSourceGroup: source.bookSourceGroup || '',
            }
          });
        });
      }
    } catch (error) {
      console.error('加载书源失败:', error);
      throw error;
    }
  }

  async addSource(source) {
    await this.initPromise;
    try {
      const formattedSource = {
        ...source,
        enabled: source.enabled ?? true,
        bookSourceGroup: source.bookSourceGroup || '',
      };

      this.sources.set(formattedSource.bookSourceUrl, {
        source: formattedSource
      });
      
      await this.saveSources();
    } catch (error) {
      console.error('添加书源失败:', error);
      throw error;
    }
  }

  async deleteSource(sourceUrl) {
    await this.initPromise;
    try {
      if (this.sources.has(sourceUrl)) {
        this.sources.delete(sourceUrl);
        await this.saveSources();
      } else {
        throw new Error('书源不存在');
      }
    } catch (error) {
      console.error('删除书源失败:', error);
      throw error;
    }
  }

  async updateSource(source) {
    await this.initPromise;
    try {
      this.sources.set(source.bookSourceUrl, {
        source: source
      });
      await this.saveSources();
    } catch (error) {
      console.error('更新书源失败:', error);
      throw error;
    }
  }

  async toggleSource(sourceUrl) {
    await this.initPromise;
    const source = this.sources.get(sourceUrl);
    if (source) {
      source.source.enabled = !source.source.enabled;
      await this.saveSources();
    }
  }

  async saveSources() {
    try {
      const sourcesArray = Array.from(this.sources.values()).map(parser => parser.source);
      await AsyncStorage.setItem('book_sources', JSON.stringify(sourcesArray));
    } catch (error) {
      console.error('保存书源失败:', error);
      throw error;
    }
  }

  getSource(url) {
    return this.sources.get(url);
  }

  getAllSources() {
    return Array.from(this.sources.values());
  }
}

export const sourceManager = new SourceManager(); 