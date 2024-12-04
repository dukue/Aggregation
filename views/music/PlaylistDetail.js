import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Pressable, Dimensions, FlatList, Animated, ToastAndroid } from 'react-native';
import { Surface, Text, useTheme, IconButton, ActivityIndicator } from 'react-native-paper';
import { BlurView } from '@react-native-community/blur';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import { musicApi } from '../../services/musicApi';
import { 
  ChevronLeft, 
  MoreHorizontal, 
  Play, 
  Heart,
  Share2,
  Download,
  ListPlus,
  Pause,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 280;

// 创建动画版本的 FlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const PlaylistDetail = ({ route, navigation }) => {
  const theme = useTheme();
  const { playMusic, playPlaylist, addToPlaylist, currentTrack, isPlaying, togglePlay } = useMusicPlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollY = new Animated.Value(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // 加载歌单数据
  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const data = await musicApi.getPlaylistDetail(route.params.playlistId);
        setPlaylist(data);
      } catch (error) {
        console.error('加载歌单失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlaylist();
  }, [route.params.playlistId]);

  // 检查歌单收藏状态
  useEffect(() => {
    const checkSubscribeStatus = async () => {
      if (playlist?.id) {
        try {
          const status = await musicApi.checkPlaylistSubscribed(playlist.id);
          setIsSubscribed(status);
        } catch (error) {
          console.error('检查歌单收藏状态失败:', error);
        }
      }
    };
    checkSubscribeStatus();
  }, [playlist]);

  // 收藏/取消收藏歌单
  const handleSubscribe = async () => {
    if (!playlist) return;
    
    try {
      const success = await musicApi.subscribePlaylist(playlist.id, !isSubscribed);
      if (success) {
        setIsSubscribed(!isSubscribed);
        ToastAndroid.show(
          isSubscribed ? '已取消收藏' : '收藏成功',
          ToastAndroid.SHORT
        );
      }
    } catch (error) {
      console.error('收藏歌单失败:', error);
      ToastAndroid.show('操作失败，请检查登录状态', ToastAndroid.SHORT);
    }
  };

  // 分享歌单
  const handleShare = async () => {
    if (!playlist) return;
    
    try {
      await musicApi.shareResource(playlist.id, 'playlist');
      ToastAndroid.show('分享成功', ToastAndroid.SHORT);
    } catch (error) {
      console.error('分享失败:', error);
      ToastAndroid.show('分享失败，请重试', ToastAndroid.SHORT);
    }
  };

  // 修改歌曲项渲染函数
  const renderTrackItem = ({ item, index }) => {
    // 获取歌曲封面
    const coverUrl = item.al?.picUrl || // 专辑封面
                    item.album?.picUrl || // 备选专辑封面
                    playlist?.coverImgUrl; // 歌单封面作为后备

    // 获取艺术家名称
    const artistName = item.ar?.map(artist => artist.name).join(' / ') || // 主要艺术家
                      item.artists?.map(artist => artist.name).join(' / ') || // 备选艺术家
                      '未知歌手';

    // 判断是否是当前播放的歌曲
    const isCurrentTrack = currentTrack?.id === item.id;

    return (
      <Pressable 
        onPress={() => isCurrentTrack ? togglePlay() : playMusic(item)}
        style={({ pressed }) => [
          styles.trackItem,
          { 
            backgroundColor: theme.colors.elevation.level1,
            transform: [{ scale: pressed ? 0.98 : 1 }],  // 添加按压效果
          }
        ]}
      >
        <View style={styles.indexContainer}>
          <Text style={[
            styles.trackIndex,
            { color: theme.colors.onSurfaceVariant }
          ]}>
            {(index + 1).toString().padStart(2, '0')}
          </Text>
        </View>
        <Image 
          source={{ uri: coverUrl }}
          style={styles.trackCover}
        />
        <View style={styles.trackInfo}>
          <Text 
            variant="bodyLarge" 
            numberOfLines={1}
            style={{ color: theme.colors.onSurface }}
          >
            {item.name}
          </Text>
          <Text 
            variant="bodySmall" 
            numberOfLines={1}
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {artistName}
          </Text>
        </View>
        <View style={styles.trackActions}>
          <IconButton
            icon={({ size }) => 
              isCurrentTrack && isPlaying ? 
                <Pause size={size} color={theme.colors.primary} /> : 
                <Play size={size} color={theme.colors.onSurfaceVariant} />
            }
            size={20}
            onPress={() => isCurrentTrack ? togglePlay() : playMusic(item)}
          />
          <IconButton
            icon={({ size }) => <ListPlus size={size} color={theme.colors.onSurfaceVariant} />}
            size={20}
            onPress={() => {
              addToPlaylist(item);
              ToastAndroid.show('已添加到播放列表', ToastAndroid.SHORT);
            }}
          />
        </View>
      </Pressable>
    );
  };

  // 修改动画值计算
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 80],
    outputRange: [0, -HEADER_HEIGHT + 80],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 120],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // 添加操作按钮的动画
  const actionsTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 80],
    outputRange: [HEADER_HEIGHT, 80],
    extrapolate: 'clamp',
  });

  // 添加标题动画
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 120],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const defaultTitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 120],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 动态头部 - 使用 transform 代替 height */}
      <Animated.View 
        style={[
          styles.header,
          {
            transform: [{ translateY: headerTranslateY }],
          }
        ]}
      >
        <Animated.Image
          source={{ uri: playlist?.coverImgUrl }}
          style={[
            StyleSheet.absoluteFill,
            { opacity: headerOpacity },
          ]}
          blurRadius={20}
        />
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={20}
        />
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: headerOpacity,
              transform: [{ scale: headerScale }],
            }
          ]}
        >
          <Image
            source={{ uri: playlist?.coverImgUrl }}
            style={styles.cover}
          />
          <View style={styles.playlistInfo}>
            <Text variant="headlineSmall" style={styles.title}>
              {playlist?.name}
            </Text>
            <Text variant="bodyMedium" style={styles.creator}>
              {playlist?.creator?.nickname}
            </Text>
            <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
              {playlist?.description || '暂无简介'}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* 顶部操作栏 */}
      <View style={styles.toolbar}>
        <IconButton
          icon={({ size }) => <ChevronLeft size={size} color="#fff" />}
          size={24}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.titleContainer}>
          <Animated.Text 
            variant="titleMedium" 
            style={[
              styles.toolbarTitle,
              { opacity: defaultTitleOpacity }
            ]}
          >
            歌单详情
          </Animated.Text>
          <Animated.Text 
            variant="titleMedium" 
            style={[
              styles.toolbarTitle,
              styles.playlistTitle,
              { opacity: titleOpacity }
            ]}
            numberOfLines={1}
          >
            {playlist?.name}
          </Animated.Text>
        </View>
        <IconButton
          icon={({ size }) => <Share2 size={size} color="#fff" />}
          size={24}
          onPress={handleShare}
        />
      </View>

      {/* 修改操作按钮部分 */}
      <Animated.View 
        style={[
          styles.actions,
          {
            transform: [{ translateY: actionsTranslateY }],
          }
        ]}
      >
        <IconButton
          icon={({ size }) => <Play size={size} color="#fff" />}
          mode="contained"
          size={24}
          onPress={() => playPlaylist(playlist.tracks)}
          style={{ backgroundColor: theme.colors.primary }}
        />
        <IconButton
          icon={({ size }) => (
            <Heart 
              size={size} 
              color={isSubscribed ? theme.colors.error : "#fff"} 
              fill={isSubscribed ? theme.colors.error : "none"}
            />
          )}
          size={24}
          onPress={handleSubscribe}
        />
        <IconButton
          icon={({ size }) => <Download size={size} color="#fff" />}
          size={24}
          onPress={() => {
            ToastAndroid.show('暂不支持下载功能', ToastAndroid.SHORT);
          }}
        />
      </Animated.View>

      {/* 修改列表部分的 padding */}
      <AnimatedFlatList
        data={playlist?.tracks}
        renderItem={renderTrackItem}
        keyExtractor={item => item.id.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + 60,
          paddingBottom: 20,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,  // 固定高度
    overflow: 'hidden',
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerContent: {
    flex: 1,
    padding: 16,
    paddingTop: 80,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cover: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    color: '#fff',
    marginBottom: 4,
  },
  creator: {
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  description: {
    color: 'rgba(255,255,255,0.5)',
  },
  toolbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  titleContainer: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
    position: 'relative',
  },
  toolbarTitle: {
    color: '#fff',
    textAlign: 'center',
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 16,
  },
  playlistTitle: {
    position: 'absolute',
    width: '100%',
  },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    // 添加阴影效果
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,  // Android 阴影
    // 确保阴影可见
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  indexContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackIndex: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  trackCover: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
    // 添加封面阴影
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default PlaylistDetail; 