import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useThemeMode } from './contexts/ThemeContext';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import { MusicUserProvider } from './contexts/MusicUserContext';
import MobileBottomTabs from './components/MobileBottomTabs';
import FloatingMusicPlayer from './components/FloatingMusicPlayer';
import TrackPlayer from 'react-native-track-player';
import { setupPlayer } from './services/trackPlayerService';
import { BookSourceProvider } from './contexts/BookSourceContext';

// 在 App 组件外部注册服务
TrackPlayer.registerPlaybackService(() => require('./services/trackPlayerService').default);

// 分离主题相关的组件
const ThemedApp = () => {
  const { theme } = useThemeMode();

  return (
    <PaperProvider theme={theme}>
      <MusicPlayerProvider>
        <MusicUserProvider>
          <BookSourceProvider>
            <NavigationContainer>
              <MobileBottomTabs />
              <FloatingMusicPlayer />
            </NavigationContainer>
          </BookSourceProvider>
        </MusicUserProvider>
      </MusicPlayerProvider>
    </PaperProvider>
  );
};

const App = () => {
  // 在应用启动时初始化播放器
  useEffect(() => {
    setupPlayer().catch(console.error);
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App; 