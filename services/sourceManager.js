import { database } from './database';

class SourceManager {
  constructor() {
    this.sources = new Map();
    this.initPromise = this.init();
  }

  async init() {
    try {
      await database.init();
      const sources = await database.getAllSources();
      this.sources = new Map(
        sources.map(source => [source.bookSourceUrl, { source }])
      );
    } catch (error) {
      console.error('初始化书源管理器失败:', error);
      throw error;
    }
  }

  getAllSources() {
    return Array.from(this.sources.values());
  }

  // 获取所有书源分组
  getGroups() {
    const groups = new Set();
    this.sources.forEach(({ source }) => {
      if (source.bookSourceGroup) {
        source.bookSourceGroup.split(',').forEach(group => {
          groups.add(group.trim());
        });
      }
    });
    return Array.from(groups);
  }

  // 按分组获取书源
  getSourcesByGroup(group) {
    return Array.from(this.sources.values()).filter(({ source }) => 
      source.bookSourceGroup && source.bookSourceGroup.split(',').some(g => 
        g.trim() === group
      )
    );
  }

  async addSource(source) {
    try {
      if (!source.bookSourceName) {
        throw new Error('书源名称不能为空');
      }
      if (!source.bookSourceUrl) {
        throw new Error('书源URL不能为空');
      }

      const id = await database.addSource(source);
      this.sources.set(source.bookSourceUrl, {
        source: {
          ...source,
          id,
          bookSourceName: source.bookSourceName,
          bookSourceGroup: source.bookSourceGroup || '',
          enabled: source.enabled ?? true
        }
      });
    } catch (error) {
      console.error('添加书源失败:', error);
      throw error;
    }
  }

  async deleteSource(sourceUrl) {
    try {
      const source = this.sources.get(sourceUrl);
      if (source) {
        await database.removeSource(source.source.id);
        this.sources.delete(sourceUrl);
      } else {
        throw new Error('书源不存在');
      }
    } catch (error) {
      console.error('删除书源失败:', error);
      throw error;
    }
  }

  async updateSource(source) {
    try {
      const existingSource = this.sources.get(source.bookSourceUrl);
      if (!existingSource) {
        throw new Error('书源不存在');
      }

      const updatedSource = {
        ...existingSource.source,
        ...source,
        baseUrl: source.bookSourceUrl,
        group: source.bookSourceGroup
      };

      await database.updateSource(updatedSource.id, updatedSource);
      this.sources.set(source.bookSourceUrl, {
        source: {
          ...source,
          id: existingSource.source.id
        }
      });
    } catch (error) {
      console.error('更新书源失败:', error);
      throw error;
    }
  }

  async toggleSource(sourceUrl) {
    try {
      const source = this.sources.get(sourceUrl);
      if (source) {
        const enabled = !source.source.enabled;
        await database.updateSource(source.source.id, { enabled });
        source.source.enabled = enabled;
      }
    } catch (error) {
      console.error('切换书源状态失败:', error);
      throw error;
    }
  }

  getSource(url) {
    return this.sources.get(url);
  }
}

// 导出单例实例
export const sourceManager = new SourceManager(); 