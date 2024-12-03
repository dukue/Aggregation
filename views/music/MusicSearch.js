import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ToastAndroid } from 'react-native';
import { Searchbar, List, useTheme, IconButton } from 'react-native-paper';
import { musicApi } from '../../services/musicApi';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import { 
  Search, 
  Music, 
  Play, 
  ListPlus,
  X as XIcon
} from 'lucide-react-native';

const MusicSearch = ({ navigation }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playMusic, addToPlaylist } = useMusicPlayer();

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await musicApi.searchMusic(query);
      setSearchResults(results);
      if (results.length === 0) {
        ToastAndroid.show('未找到相关歌曲', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('搜索失败:', error);
      ToastAndroid.show('搜索失败', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (song) => {
    try {
      await playMusic(song);
    } catch (error) {
      console.error('播放失败:', error);
      ToastAndroid.show('播放失败', ToastAndroid.SHORT);
    }
  };

  const handleAddToPlaylist = (song) => {
    try {
      addToPlaylist(song);
      ToastAndroid.show('已添加到播放列表', ToastAndroid.SHORT);
    } catch (error) {
      console.error('添加到播放列表失败:', error);
      ToastAndroid.show('添加失败', ToastAndroid.SHORT);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const renderItem = ({ item }) => (
    <List.Item
      title={item.name}
      description={item.ar?.map(artist => artist.name).join(' / ') || '未知歌手'}
      left={props => (
        <Music {...props} size={24} color={theme.colors.primary} />
      )}
      right={props => (
        <View style={styles.rightButtons}>
          <IconButton
            icon={({ size, color }) => <Play size={size} color={color} />}
            size={20}
            iconColor={theme.colors.primary}
            onPress={() => handlePlay(item)}
          />
          <IconButton
            icon={({ size, color }) => <ListPlus size={size} color={color} />}
            size={20}
            iconColor={theme.colors.primary}
            onPress={() => handleAddToPlaylist(item)}
          />
        </View>
      )}
      style={[styles.listItem, { backgroundColor: theme.colors.elevation.level1 }]}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="搜索音乐"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        loading={loading}
        icon={({ size, color }) => <Search size={size} color={color} />}
        clearIcon={({ size, color }) => <XIcon size={size} color={color} />}
        onClearIconPress={handleClearSearch}
      />
      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  listContainer: {
    paddingBottom: 80,
  },
  listItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  rightButtons: {
    flexDirection: 'row',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});

export default MusicSearch; 