import React, { createContext, useContext, useState, useEffect } from 'react';
import SourceParser from '../services/sourceParser';
import database from '../services/database';

const BookSourceContext = createContext();

export const useBookSource = () => useContext(BookSourceContext);

export const BookSourceProvider = ({ children }) => {
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // 初始化数据库并加载书源
  useEffect(() => {
    initDatabase();
  }, []);

  const initDatabase = async () => {
    try {
      await database.init();
      await loadSources();
    } catch (error) {
      console.error('初始化数据库失败:', error);
    }
  };

  const loadSources = async () => {
    try {
      const sourcesData = database.getAllSources();
      setSources(Array.from(sourcesData));
      if (sourcesData.length > 0) {
        setSelectedSource(sourcesData[0]);
      }
    } catch (error) {
      console.error('加载书源失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSource = async (source) => {
    try {
      await database.addSource(source);
      await loadSources();
    } catch (error) {
      console.error('添加书源失败:', error);
      throw error;
    }
  };

  const removeSource = async (sourceId) => {
    try {
      await database.removeSource(sourceId);
      await loadSources();
    } catch (error) {
      console.error('删除书源失败:', error);
      throw error;
    }
  };

  const loadCategories = async () => {
    if (!selectedSource) return;
    
    setLoadingCategories(true);
    try {
      const parser = new SourceParser(selectedSource);
      const cats = await parser.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('加载分类失败:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  return (
    <BookSourceContext.Provider value={{
      sources,
      selectedSource,
      setSelectedSource,
      loading,
      addSource,
      removeSource,
      loadSources,
      categories,
      loadingCategories,
      loadCategories
    }}>
      {children}
    </BookSourceContext.Provider>
  );
}; 