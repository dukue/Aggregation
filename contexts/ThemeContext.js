import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [primaryColor, setPrimaryColor] = useState('#2196F3'); // 默认蓝色

  // 加载保存的主题设置
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const [savedMode, savedColor] = await Promise.all([
          AsyncStorage.getItem('themeMode'),
          AsyncStorage.getItem('primaryColor'),
        ]);
        
        if (savedMode !== null) {
          setIsDarkMode(savedMode === 'dark');
        }
        if (savedColor !== null) {
          setPrimaryColor(savedColor);
        }
      } catch (error) {
        console.error('加载主题设置失败:', error);
      }
    };

    loadThemeSettings();
  }, []);

  // 切换深色模式
  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('themeMode', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('保存主题模式失败:', error);
    }
  };

  // 修改主题色
  const changePrimaryColor = async (color) => {
    try {
      setPrimaryColor(color);
      await AsyncStorage.setItem('primaryColor', color);
    } catch (error) {
      console.error('保存主题色失败:', error);
    }
  };

  // 创建自定义主题
  const theme = {
    ...(isDarkMode ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDarkMode ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: primaryColor,
      // 根据主色调生成其他颜色
      secondary: primaryColor + '99', // 60% 透明度
      tertiary: primaryColor + '66', // 40% 透明度
    },
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        isDarkMode, 
        toggleTheme, 
        theme,
        primaryColor,
        changePrimaryColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}; 