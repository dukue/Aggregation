import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Modal, Portal, Text, useTheme, IconButton } from 'react-native-paper';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { X as CloseIcon, Play, Pause, Music } from 'lucide-react-native';

// 使用 React.memo 优化列表项渲染
const PlaylistItem = React.memo(({ track, isPlaying, isCurrentTrack, onPlay, onRemove }) => {
  const theme = useTheme();

  return (
    <View style={styles.trackItem}>
      <IconButton
        icon={({ size }) => 
          isCurrentTrack && isPlaying ? 
            <Pause size={size} color={theme.colors.primary} /> : 
            <Play size={size} color={theme.colors.onSurfaceVariant} />
        }
        size={20}
        onPress={onPlay}
      />
      <View style={styles.trackInfo}>
        <Text 
          variant="bodyLarge" 
          style={[
            styles.trackTitle,
            { 
              color: isCurrentTrack ? theme.colors.primary : theme.colors.onSurface 
            }
          ]}
          numberOfLines={1}
        >
          {track.name}
        </Text>
        <Text 
          variant="bodySmall" 
          style={{ color: theme.colors.onSurfaceVariant }}
          numberOfLines={1}
        >
          {track.ar?.map(artist => artist.name).join(' / ')}
        </Text>
      </View>
      <IconButton
        icon={({ size }) => <CloseIcon size={size} color={theme.colors.onSurfaceVariant} />}
        size={20}
        onPress={onRemove}
      />
    </View>
  );
});

const PlaylistModal = ({ visible, onDismiss }) => {
  const theme = useTheme();
  const { 
    playlist, 
    currentTrack, 
    isPlaying, 
    playMusic, 
    removeFromPlaylist 
  } = useMusicPlayer();

  // 使用 useCallback 优化回调函数
  const handlePlay = useCallback((track) => {
    playMusic(track);
  }, [playMusic]);

  const handleRemove = useCallback((track) => {
    removeFromPlaylist(track);
  }, [removeFromPlaylist]);

  const renderItem = useCallback(({ item }) => (
    <PlaylistItem
      track={item}
      isPlaying={isPlaying}
      isCurrentTrack={currentTrack?.id === item.id}
      onPlay={() => handlePlay(item)}
      onRemove={() => handleRemove(item)}
    />
  ), [currentTrack?.id, isPlaying, handlePlay, handleRemove]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const ListEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Music size={48} color={theme.colors.onSurfaceVariant} />
      <Text 
        variant="bodyLarge" 
        style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
      >
        播放列表为空
      </Text>
    </View>
  ), [theme.colors.onSurfaceVariant]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.elevation.level2 }
        ]}
      >
        <View style={styles.header}>
          <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
            当前播放列表
          </Text>
          <IconButton
            icon={({ size }) => <CloseIcon size={size} />}
            onPress={onDismiss}
          />
        </View>
        <FlatList
          data={playlist}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  trackInfo: {
    flex: 1,
    marginHorizontal: 8,
  },
  trackTitle: {
    marginBottom: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
  },
});

export default React.memo(PlaylistModal); 