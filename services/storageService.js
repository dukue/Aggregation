import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // 保存播放列表
  async savePlaylist(tracks) {
    try {
      const now = Date.now();
      const playlistData = tracks.map((track, index) => ({
        id: track.id,
        data: track,
        addedAt: now + index
      }));
      await AsyncStorage.setItem('playlist', JSON.stringify(playlistData));
    } catch (error) {
      console.error('保存播放列表失败:', error);
    }
  }

  // 获取播放列表
  async getPlaylist() {
    try {
      const data = await AsyncStorage.getItem('playlist');
      if (data) {
        const playlistData = JSON.parse(data);
        return playlistData
          .sort((a, b) => a.addedAt - b.addedAt)
          .map(item => item.data);
      }
      return [];
    } catch (error) {
      console.error('获取播放列表失败:', error);
      return [];
    }
  }

  // 保存播放进度
  async saveProgress(trackId, position) {
    try {
      const key = `progress_${trackId}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        position,
        updatedAt: Date.now()
      }));
    } catch (error) {
      console.error('保存播放进度失败:', error);
    }
  }

  // 获取播放进度
  async getProgress(trackId) {
    try {
      const key = `progress_${trackId}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const { position } = JSON.parse(data);
        return position;
      }
      return 0;
    } catch (error) {
      console.error('获取播放进度失败:', error);
      return 0;
    }
  }

  // 保存最后播放的歌曲
  async saveLastPlayedTrack(track) {
    try {
      await AsyncStorage.setItem('last_played_track', JSON.stringify({
        track,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('保存最后播放歌曲失败:', error);
    }
  }

  // 获取最后播放的歌曲
  async getLastPlayedTrack() {
    try {
      const data = await AsyncStorage.getItem('last_played_track');
      if (data) {
        const { track } = JSON.parse(data);
        return track;
      }
      return null;
    } catch (error) {
      console.error('获取最后播放歌曲失败:', error);
      return null;
    }
  }

  // 保存收藏列表
  async saveLikedSongs(songs) {
    try {
      await AsyncStorage.setItem('liked_songs', JSON.stringify(songs));
    } catch (error) {
      console.error('保存收藏列表失败:', error);
    }
  }

  // 获取收藏列表
  async getLikedSongs() {
    try {
      const data = await AsyncStorage.getItem('liked_songs');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      return [];
    }
  }

  // 清理过期的播放进度
  async cleanupOldProgress(days = 7) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => key.startsWith('progress_'));
      const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

      for (const key of progressKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const { updatedAt } = JSON.parse(data);
          if (updatedAt < cutoff) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('清理播放进度失败:', error);
    }
  }
}

export const storage = new StorageService(); 