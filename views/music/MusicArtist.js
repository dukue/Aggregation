import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Surface, Text, useTheme, Avatar, Chip } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const MusicArtist = () => {
  const theme = useTheme();

  const artists = [
    {
      id: 1,
      name: '周杰伦',
      fans: '5000万',
      tags: ['华语', '流行', 'R&B'],
    },
    {
      id: 2,
      name: '林俊杰',
      fans: '3000万',
      tags: ['华语', '流行', '抒情'],
    },
    {
      id: 3,
      name: '邓紫棋',
      fans: '2800万',
      tags: ['华语', '流行', '摇滚'],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.sectionTitle}>
        热门歌手
      </Text>

      {artists.map((artist, index) => (
        <Animated.View
          key={artist.id}
          entering={FadeInUp.delay(index * 200)}
        >
          <Surface
            style={[
              styles.artistCard,
              { backgroundColor: theme.colors.elevation.level1 },
            ]}
            elevation={1}
          >
            <View style={styles.artistHeader}>
              <Avatar.Text
                size={60}
                label={artist.name.substring(0, 1)}
                style={{ backgroundColor: theme.colors.tertiary }}
              />
              <View style={styles.artistInfo}>
                <Text variant="titleLarge">{artist.name}</Text>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {artist.fans} 粉丝
                </Text>
              </View>
            </View>
            <View style={styles.tags}>
              {artist.tags.map((tag, tagIndex) => (
                <Chip
                  key={tagIndex}
                  style={[styles.tag, { backgroundColor: theme.colors.elevation.level3 }]}
                  textStyle={{ color: theme.colors.tertiary }}
                >
                  {tag}
                </Chip>
              ))}
            </View>
            <View style={styles.popularSongs}>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                热门歌曲
              </Text>
              {[1, 2, 3].map((song) => (
                <Surface
                  key={song}
                  style={[
                    styles.songItem,
                    { backgroundColor: theme.colors.elevation.level2 },
                  ]}
                >
                  <Text variant="bodyMedium">热门单曲 {song}</Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    播放 {Math.floor(Math.random() * 1000)}万
                  </Text>
                </Surface>
              ))}
            </View>
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
  sectionTitle: {
    marginBottom: 16,
  },
  artistCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  artistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  artistInfo: {
    marginLeft: 16,
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  popularSongs: {
    marginTop: 8,
  },
  songItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
});

export default MusicArtist; 