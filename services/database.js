import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    try {
      this.db = await SQLite.openDatabase({
        name: 'bookapp.db',
        location: 'default'
      });

      // 修改表结构以匹配书源格式
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS book_sources (
          id TEXT PRIMARY KEY,
          bookSourceUrl TEXT NOT NULL,
          bookSourceName TEXT NOT NULL,
          bookSourceGroup TEXT,
          bookSourceType INTEGER DEFAULT 0,
          loginUrl TEXT,
          header TEXT,
          enabled INTEGER DEFAULT 1,
          enabledExplore INTEGER DEFAULT 1,
          customOrder INTEGER DEFAULT 0,
          weight INTEGER DEFAULT 0,
          lastUpdateTime INTEGER,
          searchUrl TEXT NOT NULL,
          exploreUrl TEXT,
          ruleSearch TEXT NOT NULL,
          ruleExplore TEXT,
          ruleBookInfo TEXT NOT NULL,
          ruleToc TEXT NOT NULL,
          ruleContent TEXT NOT NULL
        );
      `);
    } catch (error) {
      console.error('初化数据库失败:', error);
      throw error;
    }
  }

  async getAllSources() {
    try {
      const [results] = await this.db.executeSql(
        'SELECT * FROM book_sources ORDER BY weight DESC, lastUpdateTime DESC'
      );
      return Array.from({ length: results.rows.length }, (_, i) => {
        const item = results.rows.item(i);
        return {
          id: item.id,
          bookSourceUrl: item.bookSourceUrl,
          bookSourceName: item.bookSourceName,
          bookSourceGroup: item.bookSourceGroup,
          bookSourceType: item.bookSourceType,
          loginUrl: item.loginUrl,
          header: item.header ? JSON.parse(item.header) : null,
          enabled: Boolean(item.enabled),
          enabledExplore: Boolean(item.enabledExplore),
          customOrder: item.customOrder,
          weight: item.weight,
          lastUpdateTime: item.lastUpdateTime,
          searchUrl: item.searchUrl,
          exploreUrl: item.exploreUrl,
          ruleSearch: JSON.parse(item.ruleSearch),
          ruleExplore: item.ruleExplore ? JSON.parse(item.ruleExplore) : null,
          ruleBookInfo: JSON.parse(item.ruleBookInfo),
          ruleToc: JSON.parse(item.ruleToc),
          ruleContent: JSON.parse(item.ruleContent)
        };
      });
    } catch (error) {
      console.error('获取书源失败:', error);
      return [];
    }
  }

  async addSource(source) {
    try {
      const id = source.id || Math.random().toString(36).slice(2);
      await this.db.executeSql(`
        INSERT OR REPLACE INTO book_sources (
          id, bookSourceUrl, bookSourceName, bookSourceGroup, bookSourceType,
          loginUrl, header, enabled, enabledExplore, customOrder, weight,
          lastUpdateTime, searchUrl, exploreUrl, ruleSearch, ruleExplore,
          ruleBookInfo, ruleToc, ruleContent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        source.bookSourceUrl,
        source.bookSourceName,
        source.bookSourceGroup || '',
        source.bookSourceType || 0,
        source.loginUrl || null,
        source.header ? JSON.stringify(source.header) : null,
        source.enabled ? 1 : 0,
        source.enabledExplore ? 1 : 0,
        source.customOrder || 0,
        source.weight || 0,
        Date.now(),
        source.searchUrl,
        source.exploreUrl || null,
        JSON.stringify(source.ruleSearch),
        source.ruleExplore ? JSON.stringify(source.ruleExplore) : null,
        JSON.stringify(source.ruleBookInfo),
        JSON.stringify(source.ruleToc),
        JSON.stringify(source.ruleContent)
      ]);
      return id;
    } catch (error) {
      console.error('添加书源失败:', error);
      throw error;
    }
  }

  async removeSource(sourceId) {
    try {
      await this.db.executeSql(
        'DELETE FROM book_sources WHERE id = ?',
        [sourceId]
      );
    } catch (error) {
      console.error('删除书源失败:', error);
      throw error;
    }
  }

  async updateSource(sourceId, updates) {
    try {
      const validColumns = [
        'bookSourceName',
        'bookSourceUrl',
        'bookSourceGroup',
        'bookSourceType',
        'loginUrl',
        'header',
        'enabled',
        'enabledExplore',
        'customOrder',
        'weight',
        'searchUrl',
        'exploreUrl',
        'ruleSearch',
        'ruleExplore',
        'ruleBookInfo',
        'ruleToc',
        'ruleContent',
        'lastUpdateTime'
      ];

      const sets = [];
      const values = [];
      
      Object.entries(updates).forEach(([key, value]) => {
        if (validColumns.includes(key)) {
          sets.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (sets.length === 0) {
        throw new Error('No valid columns to update');
      }

      // 添加 lastUpdateTime
      sets.push('lastUpdateTime = ?');
      values.push(Date.now());
      
      // 添加 WHERE 条件的 ID
      values.push(sourceId);

      const sql = `
        UPDATE book_sources 
        SET ${sets.join(', ')}
        WHERE id = ?
      `;

      console.log('Executing SQL:', sql, values);
      await this.db.executeSql(sql, values);
    } catch (error) {
      console.error('更新书源失败:', error);
      throw error;
    }
  }

  async getSource(sourceId) {
    try {
      const [results] = await this.db.executeSql(
        'SELECT * FROM book_sources WHERE id = ?',
        [sourceId]
      );
      
      if (results.rows.length === 0) {
        return null;
      }

      const item = results.rows.item(0);
      return {
        ...item,
        enabled: Boolean(item.enabled),
        header: item.header ? JSON.parse(item.header) : null,
        ruleCategories: item.ruleCategories ? JSON.parse(item.ruleCategories) : null,
        ruleSearch: JSON.parse(item.ruleSearch),
        ruleBookInfo: JSON.parse(item.ruleBookInfo),
        ruleToc: JSON.parse(item.ruleToc),
        ruleContent: JSON.parse(item.ruleContent)
      };
    } catch (error) {
      console.error('获取书源失败:', error);
      return null;
    }
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const database = new Database(); 