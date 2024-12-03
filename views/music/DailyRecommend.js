import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, useTheme, Surface, IconButton } from 'react-native-paper';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Play, Pause } from 'lucide-react-native';

const PAGE_SIZE = 20; // 每页显示的数量

const DailyRecommend = ({ route }) => {
  const { songs: allSongs } = route.params;
  const theme = useTheme();
  const { playMusic, isPlaying, currentTrack } = useMusicPlayer();
  const [displayedSongs, setDisplayedSongs] = useState(allSongs.slice(0, PAGE_SIZE));
  const [loading, setLoading] = useState(false);

  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (loading || displayedSongs.length >= allSongs.length) return;

    setLoading(true);
    // 模拟网络延迟
    setTimeout(() => {
      const nextBatch = allSongs.slice(
        displayedSongs.length,
        displayedSongs.length + PAGE_SIZE
      );
      setDisplayedSongs(prev => [...prev, ...nextBatch]);
      setLoading(false);
    }, 500);
  }, [loading, displayedSongs.length, allSongs]);

  // 渲染底部加载指示器
  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  // 渲染列表项
  const renderItem = useCallback(({ item, index }) => (
    <Surface 
      style={[styles.songItem, { backgroundColor: theme.colors.elevation.level1 }]}
      elevation={1}
    >
      <Text style={styles.songIndex}>{index + 1}</Text>
      <View style={[styles.songCover, { backgroundColor: theme.colors.elevation.level3 }]}>
        {item.al.picUrl ? (
          <Image 
            source={{ uri: item.al.picUrl }} 
            style={styles.coverImage}
          />
        ) : (
          <Icon 
            name="music" 
            size={24} 
            color={theme.colors.onSurfaceVariant}
            style={styles.defaultIcon}
          />
        )}
      </View>
      <View style={styles.songInfo}>
        <Text variant="titleMedium" numberOfLines={1}>{item.name}</Text>
        <Text 
          variant="bodyMedium" 
          style={{ color: theme.colors.onSurfaceVariant }}
          numberOfLines={1}
        >
          {item.ar.map(artist => artist.name).join(' / ')}
        </Text>
      </View>
      <IconButton
        icon={({ size, color }) => 
          isPlaying && currentTrack?.id === item.id 
            ? <Pause size={size} color={color} /> 
            : <Play size={size} color={color} />
        }
        onPress={() => playMusic(item)}
      />
    </Surface>
  ), [theme, playMusic, isPlaying, currentTrack]);

  // 提取 keyExtractor 函数
  const keyExtractor = useCallback((item) => item.id.toString(), []);

  // 获取列表项布局以优化性能
  const getItemLayout = useCallback((data, index) => ({
    length: 72, // 项目高度
    offset: 72 * index,
    index,
  }), []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={displayedSongs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        getItemLayout={getItemLayout}
        // 启用窗口化
        windowSize={10}
        // 最大渲染数量
        maxToRenderPerBatch={10}
        // 初始渲染数量
        initialNumToRender={10}
        // 维护渲染窗口之外的项目数量
        removeClippedSubviews={true}
        // 更新项目之间的时间间隔
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    height: 64, // 固定高度以优化性能
  },
  songIndex: {
    width: 32,
    textAlign: 'center',
  },
  songCover: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  defaultIcon: {
    opacity: 0.5,
  },
  songInfo: {
    flex: 1,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default React.memo(DailyRecommend); // 使用 React.memo 优化组件重渲染
 