import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useThemeMode } from './contexts/ThemeContext';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import { MusicUserProvider } from './contexts/MusicUserContext';
import MobileBottomTabs from './components/MobileBottomTabs';

// 分离主题相关的组件
const ThemedApp = () => {
  const { theme } = useThemeMode();

  return (
    <PaperProvider theme={theme}>
      <MusicPlayerProvider>
        <MusicUserProvider>
          <NavigationContainer>
            <MobileBottomTabs />
          </NavigationContainer>
        </MusicUserProvider>
      </MusicPlayerProvider>
    </PaperProvider>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App; 