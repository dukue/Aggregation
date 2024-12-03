import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, useTheme, Surface, Button, IconButton } from 'react-native-paper';
import { musicApi } from '../../services/musicApi';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import { useMusicUser } from '../../contexts/MusicUserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
  Calendar, 
  Play, 
  Music, 
  ListMusic,
  PlayCircle,
  Mic2, // 歌手图标
  Disc, // 专辑图标
  TrendingUp // 排行榜图标
} from 'lucide-react-native';
import PlaylistCard from '../../components/PlaylistCard';
import { Animated } from 'react-native';

const MusicDiscover = ({ navigation }) => {
  const theme = useTheme();
  const { playMusic } = useMusicPlayer();
  const { user } = useMusicUser();
  const [refreshing, setRefreshing] = useState(false);
  const [recommendSongs, setRecommendSongs] = useState([]);
  const [recommendPlaylists, setRecommendPlaylists] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [newSongs, setNewSongs] = useState([]);

  const formatPlayCount = (count) => {
    if (count >= 100000000) {
      return (count / 100000000).toFixed(1) + '亿';
    } else if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
  };

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [songs, dailyPlaylists, recommendedPlaylists, latest] = await Promise.all([
        user ? musicApi.getDailyRecommendSongs() : [],
        user ? musicApi.getDailyRecommendPlaylists() : [],
        musicApi.getRecommendPlaylists(),
        musicApi.getNewSongs(),
      ]);
      setRecommendSongs(songs);
      setRecommendPlaylists(dailyPlaylists);
      setPlaylists(recommendedPlaylists);
      setNewSongs(latest);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const renderDailyRecommend = () => {
    if (!user) return null;

    return (
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>每日推荐</Text>
        <Surface style={[styles.dailyCard, { backgroundColor: theme.colors.elevation.level2 }]} elevation={2}>
          <View style={styles.dailyHeader}>
            <Calendar size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.dailyTitle}>
              {new Date().getDate()}日推荐
            </Text>
          </View>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {recommendSongs.length}首音乐
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('DailyRecommend', { songs: recommendSongs })}
            style={styles.dailyButton}
          >
            查看全部
          </Button>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.songList}>
            {recommendSongs.slice(0, 6).map((song, index) => (
              <TouchableOpacity
                key={song.id}
                onPress={() => playMusic(song)}
                style={styles.songCard}
              >
                <Image source={{ uri: song.al.picUrl }} style={styles.songCover} />
                <Text numberOfLines={1} style={styles.songName}>{song.name}</Text>
                <Text numberOfLines={1} style={styles.artistName}>
                  {song.ar.map(artist => artist.name).join(' / ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Surface>
      </View>
    );
  };

  const renderRecommendPlaylists = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text variant="titleLarge">推荐歌单</Text>
        <IconButton
          icon={({ size, color }) => <ListMusic size={size} color={color} />}
          size={24}
          iconColor={theme.colors.primary}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {playlists.map(playlist => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            onPress={() => navigation.navigate('PlaylistDetail', { playlistId: playlist.id })}
            horizontal
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadData} />
      }
    >
      {renderDailyRecommend()}
      {renderRecommendPlaylists()}
      {/* 其他现有的推荐内容 */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  dailyCard: {
    padding: 16,
    borderRadius: 12,
  },
  dailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyTitle: {
    marginLeft: 8,
  },
  dailyButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  songList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  songCard: {
    width: 120,
    marginRight: 12,
  },
  songCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  songName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 12,
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playlistCard: {
    width: 140,
    marginRight: 12,
  },
  playlistCover: {
    width: 140,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  playlistInfo: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  playCount: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  playlistTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  // ... 其他现有样式
});

export default MusicDiscover; 