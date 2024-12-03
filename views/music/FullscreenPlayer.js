import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions, Animated, ToastAndroid } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { BlurView } from '@react-native-community/blur';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import Slider from '@react-native-community/slider';
import { 
  ChevronDown,
  Heart,
  ListMusic,
  Share2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Music,
  Shuffle,
} from 'lucide-react-native';
import PlaylistModal from '../../components/PlaylistModal';
import { musicApi } from '../../services/musicApi';
import LyricView from '../../components/LyricView';
import { useNavigation, CommonActions } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const FullscreenPlayer = ({ navigation, route }) => {
  const theme = useTheme();
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    playNext, 
    playPrevious,
    progress = { position: 0, duration: 0 },
    seekTo,
    playMode,
    togglePlayMode,
    toggleLike,
    isLiked,
  } = useMusicPlayer();

  const [playlistVisible, setPlaylistVisible] = useState(false);
  const [lyrics, setLyrics] = useState([]);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isCurrentLiked, setIsCurrentLiked] = useState(false);

  // 淡入动画
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // 加载歌词
  useEffect(() => {
    const loadLyrics = async () => {
      if (currentTrack?.id) {
        try {
          const data = await musicApi.getLyric(currentTrack.id);
          setLyrics(data || []);
        } catch (error) {
          console.error('获取歌词失败:', error);
          setLyrics([]);
        }
      }
    };
    loadLyrics();
  }, [currentTrack]);

  // 添加检查收藏状态的效果
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (currentTrack?.id) {
        try {
          const status = await musicApi.checkSongLike(currentTrack.id);
          setIsCurrentLiked(status);
        } catch (error) {
          console.error('检查收藏状态失败:', error);
        }
      }
    };
    checkLikeStatus();
  }, [currentTrack]);

  // 修改收藏按钮的处理函数
  const handleLike = async () => {
    if (!currentTrack) return;
    
    try {
      await toggleLike(currentTrack);
      // 更新当前状态
      setIsCurrentLiked(!isCurrentLiked);
    } catch (error) {
      console.error('收藏操作失败:', error);
    }
  };

  // 获取播放模式图标
  const getPlayModeIcon = () => {
    switch (playMode) {
      case 'shuffle':
        return <Shuffle color="#fff" size={24} />;
      case 'repeat':
        return <Repeat color="#fff" size={24} />;
      default: // 'sequential'
        return <Music color="#fff" size={24} />;
    }
  };

  // 获取播放模式提示文本
  const getPlayModeText = () => {
    switch (playMode) {
      case 'shuffle':
        return '单曲循环';
      case 'repeat':
        return '顺序播放';
      default:
        return '随机播放';
    }
  };

  // 修改返回处理函数
  const handleBack = () => {
    const returnTo = route.params?.returnTo;
    if (returnTo && returnTo !== 'Music') {
      // 如果有返回目标且不是音乐页面，就导航到那里
      navigation.getParent()?.navigate(returnTo);
    }
    // 无论如何都执行返回操作
    navigation.goBack();
  };

  // 修改组件返回逻辑
  if (!currentTrack) {
    // 不再直接导航到音乐模块，而是返回上一页
    navigation.goBack();
    return null;
  }

  // 在组件挂载时隐藏底部标签栏
  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });

    // 在组件卸载时恢复底部标签栏
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined
      });
    };
  }, [navigation]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* 背景 */}
      <Image
        source={{ uri: currentTrack?.al?.picUrl }}
        style={StyleSheet.absoluteFill}
        blurRadius={20}
      />
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="dark"
        blurAmount={20}
      />

      {/* 主内容 */}
      <View style={styles.content}>
        {/* 顶部栏 */}
        <View style={styles.header}>
          <IconButton
            icon={({ size }) => <ChevronDown size={size} color="#fff" />}
            size={24}
            onPress={handleBack}
          />
          <View style={styles.headerTitle}>
            <Text variant="titleMedium" style={styles.songName}>
              {currentTrack.name}
            </Text>
            <Text variant="bodyMedium" style={styles.artistName}>
              {currentTrack.ar?.map(artist => artist.name).join(' / ')}
            </Text>
          </View>
          <IconButton
            icon={({ size }) => <Share2 size={size} color="#fff" />}
            size={24}
          />
        </View>

        {/* 封面/歌词切换区域 */}
        <View style={styles.mainContent}>
          {showLyrics ? (
            <LyricView
              lyrics={lyrics}
              currentTime={progress?.position || 0}
              onPress={() => setShowLyrics(false)}
            />
          ) : (
            <View style={styles.coverContainer}>
              <Image
                source={{ uri: currentTrack.al?.picUrl }}
                style={styles.cover}
              />
              <IconButton
                icon={({ size }) => <ListMusic size={size} />}
                iconColor="#fff"
                style={styles.lyricsButton}
                onPress={() => setShowLyrics(true)}
              />
            </View>
          )}
        </View>

        {/* 控制区域 */}
        <View style={styles.controls}>
          {/* 进度条 */}
          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              value={progress?.position || 0}
              maximumValue={progress?.duration || 0}
              minimumValue={0}
              onSlidingComplete={seekTo}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor={theme.colors.primary}
            />
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>
                {formatTime(progress?.position || 0)}
              </Text>
              <Text style={styles.timeText}>
                {formatTime(progress?.duration || 0)}
              </Text>
            </View>
          </View>

          {/* 播放控制按钮 */}
          <View style={styles.controlButtons}>
            <IconButton
              icon={({ size }) => <SkipBack size={size} color="#fff" />}
              size={32}
              onPress={playPrevious}
            />
            <IconButton
              icon={({ size }) => 
                isPlaying ? 
                  <Pause size={size} color="#fff" /> : 
                  <Play size={size} color="#fff" />
              }
              size={48}
              onPress={togglePlay}
              style={styles.playButton}
            />
            <IconButton
              icon={({ size }) => <SkipForward size={size} color="#fff" />}
              size={32}
              onPress={playNext}
            />
          </View>

          {/* 底部按钮 */}
          <View style={styles.bottomButtons}>
            <IconButton
              icon={({ size }) => (
                <Heart 
                  size={size} 
                  color={isCurrentLiked ? theme.colors.error : "#fff"} 
                  fill={isCurrentLiked ? theme.colors.error : "none"}
                />
              )}
              size={24}
              onPress={handleLike}
            />
            <IconButton
              icon={({ size }) => getPlayModeIcon()}
              iconColor="#fff"
              size={24}
              onPress={() => {
                togglePlayMode();
                ToastAndroid.show(getPlayModeText(), ToastAndroid.SHORT);
              }}
            />
            <IconButton
              icon={({ size }) => <ListMusic size={size} color="#fff" />}
              size={24}
              onPress={() => setPlaylistVisible(true)}
            />
          </View>
        </View>
      </View>

      {/* 播放列表模态框 */}
      <PlaylistModal
        visible={playlistVisible}
        onDismiss={() => setPlaylistVisible(false)}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  songName: {
    color: '#fff',
    textAlign: 'center',
  },
  artistName: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContainer: {
    position: 'relative',
    width: SCREEN_WIDTH - 80,
    aspectRatio: 1,
  },
  cover: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  lyricsButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controls: {
    paddingBottom: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  timeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  playButton: {
    marginHorizontal: 24,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    marginTop: 16,
  },
});

export default FullscreenPlayer; 