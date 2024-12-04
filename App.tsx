/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import { useColorScheme, StatusBar, Platform } from 'react-native';
import MobileBottomTabs from './components/MobileBottomTabs';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import { MusicUserProvider } from './contexts/MusicUserContext';
import { ThemeProvider, useThemeMode } from './contexts/ThemeContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MusicUserProvider>
          <MusicPlayerProvider>
            <AppContent />
          </MusicPlayerProvider>
        </MusicUserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const AppContent = () => {
  const { isDarkMode, primaryColor } = useThemeMode();

  // 修改状态栏处理
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
  }, [isDarkMode]);

  // 自定义浅色主题
  const lightTheme = {
    ...MD3LightTheme,
    dark: false,
    mode: 'adaptive',
    roundness: 2,
    colors: {
      ...MD3LightTheme.colors,
      primary: primaryColor,
      primaryContainer: isDarkMode ? '#1A472E' : '#E3F2E6',
      secondary: '#1ED760',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceVariant: '#F5F5F5',
      elevation: {
        level0: 'transparent',
        level1: '#F5F5F5',
        level2: '#EEEEEE',
        level3: '#E0E0E0',
        level4: '#BDBDBD',
        level5: '#9E9E9E',
      },
    },
  };

  // 自定义深色主题
  const darkTheme = {
    ...MD3DarkTheme,
    dark: true,
    mode: 'adaptive',
    roundness: 2,
    colors: {
      ...MD3DarkTheme.colors,
      primary: primaryColor,
      primaryContainer: isDarkMode ? '#1A472E' : '#E3F2E6',
      secondary: '#1ED760',
      background: '#121212',
      surface: '#121212',
      surfaceVariant: '#282828',
      elevation: {
        level0: 'transparent',
        level1: '#282828',
        level2: '#181818',
        level3: '#404040',
        level4: '#282828',
        level5: '#181818',
      },
      onSurface: '#FFFFFF',
      onSurfaceVariant: 'rgba(255, 255, 255, 0.7)',
      onSurfaceDisabled: 'rgba(255, 255, 255, 0.5)',
    },
  };

  // 适配导航主题
  const { LightTheme: NavLight, DarkTheme: NavDark } = adaptNavigationTheme({
    reactNavigationLight: DefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

  const theme = isDarkMode ? darkTheme : lightTheme;
  const navTheme = {
    ...(isDarkMode ? NavDark : NavLight),
    colors: {
      ...(isDarkMode ? NavDark.colors : NavLight.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.surfaceVariant,
    },
  };

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <PaperProvider theme={theme}>
        <NavigationContainer theme={navTheme}>
          <MobileBottomTabs />
        </NavigationContainer>
      </PaperProvider>
    </>
  );
};

export default App;
