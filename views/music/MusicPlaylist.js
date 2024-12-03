import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Surface, Text, useTheme, IconButton, TouchableRipple } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const MusicPlaylist = () => {
  const theme = useTheme();

  const categories = [
    { id: 1, name: '华语', icon: 'music' },
    { id: 2, name: '流行', icon: 'star' },
    { id: 3, name: '摇滚', icon: 'guitar-electric' },
    { id: 4, name: '民谣', icon: 'guitar-acoustic' },
    { id: 5, name: '电子', icon: 'sine-wave' },
    { id: 6, name: '轻音乐', icon: 'music-note' },
  ];

  const playlists = [
    { id: 1, title: '华语经典', songs: 100, plays: '100万' },
    { id: 2, title: '欧美热歌', songs: 80, plays: '80万' },
    { id: 3, title: '轻音乐集', songs: 50, plays: '60万' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.categories}>
        {categories.map((category, index) => (
          <Animated.View
            key={category.id}
            entering={FadeInUp.delay(index * 100)}
            style={styles.categoryCard}
          >
            <TouchableRipple
              onPress={() => {}}
              style={{ borderRadius: 12 }}
            >
              <Surface
                style={[
                  styles.category,
                  { backgroundColor: theme.colors.elevation.level1 },
                ]}
                elevation={1}
              >
                <Icon name={category.icon} size={24} color={theme.colors.tertiary} />
                <Text
                  variant="bodyMedium"
                  style={{ marginTop: 8, color: theme.colors.onSurface }}
                >
                  {category.name}
                </Text>
              </Surface>
            </TouchableRipple>
          </Animated.View>
        ))}
      </View>

      <Text variant="titleLarge" style={styles.sectionTitle}>
        热门歌单
      </Text>

      {playlists.map((playlist, index) => (
        <Animated.View
          key={playlist.id}
          entering={FadeInUp.delay(300 + index * 100)}
        >
          <Surface
            style={[
              styles.playlist,
              { backgroundColor: theme.colors.elevation.level1 },
            ]}
            elevation={1}
          >
            <View style={styles.playlistIcon}>
              <Icon name="playlist-music" size={40} color={theme.colors.tertiary} />
            </View>
            <View style={styles.playlistInfo}>
              <Text variant="titleMedium">{playlist.title}</Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {playlist.songs} 首歌曲 · {playlist.plays} 次播放
              </Text>
            </View>
            <IconButton
              icon="play-circle"
              size={30}
              iconColor={theme.colors.tertiary}
              onPress={() => {}}
            />
          </Surface>
        </Animated.View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryCard: {
    width: '31%',
    marginBottom: 12,
  },
  category: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  playlist: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  playlistIcon: {
    marginRight: 16,
  },
  playlistInfo: {
    flex: 1,
  },
});

export default MusicPlaylist; 