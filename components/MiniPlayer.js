import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Surface, Text, IconButton, useTheme, ProgressBar } from 'react-native-paper';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useProgress } from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';
import PlaylistModal from './PlaylistModal';

const MiniPlayer = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { currentTrack, isPlaying, togglePlay } = useMusicPlayer();
  const progress = useProgress();
  const [showPlaylist, setShowPlaylist] = useState(false);

  if (!currentTrack) return null;

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutDown}
      style={styles.container}
    >
      <Surface style={[styles.content, { backgroundColor: theme.colors.elevation.level3 }]} elevation={4}>
        <TouchableOpacity 
          style={styles.mainContent}
          onPress={() => navigation.navigate('Music', {
            screen: 'FullscreenPlayer'
          })}
        >
          <Image
            source={{ uri: currentTrack.al.picUrl }}
            style={styles.cover}
          />
          <View style={styles.info}>
            <Text variant="titleMedium" numberOfLines={1}>
              {currentTrack.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
              {currentTrack.ar.map(artist => artist.name).join(' / ')}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.controls}>
          <IconButton
            icon={isPlaying ? 'pause' : 'play'}
            size={24}
            iconColor={theme.colors.primary}
            onPress={togglePlay}
          />
          <IconButton
            icon="playlist-music"
            size={24}
            iconColor={theme.colors.primary}
            onPress={() => setShowPlaylist(true)}
          />
        </View>
        <ProgressBar
          progress={progress.duration > 0 ? progress.position / progress.duration : 0}
          color={theme.colors.primary}
          style={styles.progressBar}
        />
      </Surface>
      <PlaylistModal
        visible={showPlaylist}
        onDismiss={() => setShowPlaylist(false)}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 8,
  },
  content: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  info: {
    flex: 1,
    marginHorizontal: 12,
  },
  controls: {
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
  },
});

export default MiniPlayer; 