import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://124.223.107.207:3000';

// 添加 cookie 处理函数
const saveCookie = async (cookie) => {
  try {
    await AsyncStorage.setItem('music_cookie', cookie);
    // 更新 axios 默认请求头
    axios.defaults.headers.common['Cookie'] = cookie;
  } catch (error) {
    console.error('保存 cookie 失败:', error);
  }
};

// 在 musicApi.js 中添加格式化歌单数据的函数
const formatPlaylist = (playlist) => ({
  id: playlist.id,
  name: playlist.name || '未知歌单',
  coverImgUrl: playlist.coverImgUrl || playlist.picUrl, // 有些接口返回 picUrl
  playCount: playlist.playCount || 0,
  trackCount: playlist.trackCount || 0,
  creator: playlist.creator ? {
    nickname: playlist.creator.nickname || '未知用户',
    avatarUrl: playlist.creator.avatarUrl,
  } : null,
  description: playlist.description || '',
  tags: playlist.tags || [],
});

export const musicApi = {
  // 获取推荐歌单
  getRecommendPlaylists: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/personalized`);
      return response.data.result.map(formatPlaylist);
    } catch (error) {
      console.error('获取推荐歌单失败:', error);
      return [];
    }
  },

  // 获取新歌速递
  getNewSongs: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/personalized/newsong`);
      return response.data.result;
    } catch (error) {
      console.error('获取新歌失败:', error);
      return [];
    }
  },

  // 获取热门歌手
  getTopArtists: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/top/artists?limit=10`);
      return response.data.artists;
    } catch (error) {
      console.error('获取热门歌手失败:', error);
      return [];
    }
  },

  // 获取歌单详情
  getPlaylistDetail: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/playlist/detail?id=${id}`);
      if (response.data.code === 200) {
        const playlist = response.data.playlist;
        // 格式化歌单数据
        return {
          id: playlist.id,
          name: playlist.name,
          coverImgUrl: playlist.coverImgUrl,
          description: playlist.description,
          tags: playlist.tags,
          creator: {
            nickname: playlist.creator.nickname,
            avatarUrl: playlist.creator.avatarUrl,
          },
          tracks: playlist.tracks.map(track => ({
            id: track.id,
            name: track.name,
            ar: track.ar,
            al: track.al,
            fee: track.fee,
            // 其他需要的字段...
          })),
          trackCount: playlist.trackCount,
          playCount: playlist.playCount,
        };
      }
      throw new Error('获取歌单详情失败');
    } catch (error) {
      console.error('获取歌单详情失败:', error);
      throw error;
    }
  },

  // 获取歌单所有歌曲
  getPlaylistTracks: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/playlist/track/all?id=${id}`);
      if (response.data.code === 200) {
        return response.data.songs.map(track => ({
          id: track.id,
          name: track.name,
          ar: track.ar,
          al: track.al,
          fee: track.fee,
          // 其他需要的字段...
        }));
      }
      throw new Error('获取歌单歌曲失败');
    } catch (error) {
      console.error('获取歌单歌曲失败:', error);
      throw error;
    }
  },

  // 获取歌手详情
  getArtistDetail: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/artist/detail?id=${id}`);
      return response.data.data;
    } catch (error) {
      console.error('获取歌手详情失败:', error);
      return null;
    }
  },

  // 获取歌曲URL
  getSongUrl: async (id) => {
    try {
      console.log('Fetching song URL for id:', id);
      const response = await axios.get(`${BASE_URL}/song/url/v1`, {
        params: {
          id: id,
          level: 'standard'
        }
      });
      console.log('Song URL response:', response.data);

      if (response.data.code === 200 && response.data.data && response.data.data.length > 0) {
        const songData = response.data.data[0];
        
        // 检查具体的错误原因
        if (songData.code === 404) {
          if (songData.freeTrialPrivilege?.cannotListenReason === 1) {
            throw new Error('VIP_REQUIRED');
          } else {
            throw new Error('SONG_NOT_AVAILABLE');
          }
        }

        // 检查是否可以播放
        if (songData.fee === 1 && songData.payed === 0) {
          throw new Error('VIP_REQUIRED');
        }

        // 检查 URL 是否有效
        if (songData.url) {
          console.log('Valid URL found:', songData.url);
          return songData.url;
        } else {
          throw new Error('URL_NOT_FOUND');
        }
      } else {
        throw new Error('INVALID_RESPONSE');
      }
    } catch (error) {
      console.error('Error fetching song URL:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      // 返回错误信息而不是 null
      return { error: error.message };
    }
  },

  // 获取歌曲详情
  getSongDetail: async (id) => {
    try {
      console.log('Fetching song details for id:', id);
      const response = await axios.get(`${BASE_URL}/song/detail`, {
        params: {
          ids: id
        }
      });
      console.log('Song details response:', response.data);

      if (response.data.code === 200 && response.data.songs && response.data.songs[0]) {
        return response.data.songs[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching song details:', error.message);
      return null;
    }
  },

  // 获取歌词
  getLyric: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/lyric`, {
        params: { id }
      });
      
      if (response.data.code === 200) {
        // 解析歌词
        const lrc = response.data.lrc?.lyric || '';
        return parseLyric(lrc);
      }
      return [];
    } catch (error) {
      console.error('获取歌词失败:', error);
      return [];
    }
  },

  // 搜索音乐
  searchMusic: async (keywords) => {
    try {
      // 先获取搜索结果
      const response = await axios.get(`${BASE_URL}/search`, {
        params: {
          keywords,
          type: 1, // 1: 单曲
          limit: 30
        }
      });

      if (response.data.code === 200 && response.data.result?.songs) {
        // 获取歌曲详情以获得完整信息
        const songIds = response.data.result.songs.map(song => song.id);
        const detailResponse = await axios.get(`${BASE_URL}/song/detail`, {
          params: { ids: songIds.join(',') }
        });

        if (detailResponse.data.code === 200 && detailResponse.data.songs) {
          // 转换数据结构
          return detailResponse.data.songs.map(song => ({
            id: song.id,
            name: song.name,
            ar: song.ar || [], // 歌手信息
            al: {
              id: song.al?.id,
              name: song.al?.name || '',
              picUrl: song.al?.picUrl || '',
            },
          }));
        }
      }
      return [];
    } catch (error) {
      console.error('搜索失败:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      return [];
    }
  },

  // 获取音乐分类
  getMusicCategories: async () => {
    try {
      // 获取热门分
      const hotResponse = await axios.get(`${BASE_URL}/playlist/hot`);
      if (hotResponse.data.code === 200 && hotResponse.data.tags) {
        return hotResponse.data.tags.map(tag => ({
          id: tag.id,
          name: tag.name,
          category: tag.category,
        }));
      }
      return [];
    } catch (error) {
      console.error('获取分类失败:', error);
      return [];
    }
  },

  // 获取分类歌单
  getCategoryPlaylists: async (cat) => {
    try {
      const response = await axios.get(`${BASE_URL}/top/playlist`, {
        params: {
          cat,
          limit: 30,
          offset: 0,
        }
      });
      if (response.data.code === 200 && response.data.playlists) {
        return response.data.playlists.map(formatPlaylist);
      }
      return [];
    } catch (error) {
      console.error('获取分类歌单失败:', error);
      return [];
    }
  },

  // 获取二维码 key
  getQRKey: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/login/qr/key?timestamp=${Date.now()}`);
      if (response.data.code === 200) {
        return response.data.data.unikey;
      }
      return null;
    } catch (error) {
      console.error('获取二维码key失败:', error);
      return null;
    }
  },

  // 获取二维码图片
  getQRImage: async (key) => {
    try {
      const response = await axios.get(`${BASE_URL}/login/qr/create`, {
        params: {
          key,
          qrimg: true,
          timestamp: Date.now(),
        }
      });
      if (response.data.code === 200) {
        return response.data.data.qrimg;
      }
      return null;
    } catch (error) {
      console.error('获取二维码失败:', error);
      return null;
    }
  },

  // 检查二维码状态
  checkQRStatus: async (key) => {
    try {
      const response = await axios.get(`${BASE_URL}/login/qr/check`, {
        params: {
          key,
          timestamp: Date.now(),
        }
      });
      
      // 登录成功时保存 cookie
      if (response.data.code === 803) {
        const cookie = response.data.cookie;
        await saveCookie(cookie);
      }
      
      return response.data;
    } catch (error) {
      console.error('检查二维码状态失败:', error);
      return null;
    }
  },

  // 获取用户信息
  getUserInfo: async () => {
    try {
      // 先获取存储的 cookie
      const cookie = await AsyncStorage.getItem('music_cookie');
      if (!cookie) {
        return null;
      }
      
      // 设置请求头
      axios.defaults.headers.common['Cookie'] = cookie;
      
      // 获取登录状态
      const loginResponse = await axios.get(`${BASE_URL}/login/status`);
      if (loginResponse.data.data.account) {
        // 获取用户详细信息
        const detailResponse = await axios.get(`${BASE_URL}/user/detail`, {
          params: {
            uid: loginResponse.data.data.account.id
          }
        });

        if (detailResponse.data.code === 200) {
          return {
            ...loginResponse.data.data.account,
            ...detailResponse.data.profile,
          };
        }
      }
      return null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  },

  // 获取用户歌单
  getUserPlaylists: async (uid) => {
    try {
      const response = await axios.get(`${BASE_URL}/user/playlist`, {
        params: {
          uid,
          limit: 30,
          offset: 0,
        }
      });
      if (response.data.code === 200) {
        return response.data.playlist.map(formatPlaylist);
      }
      return [];
    } catch (error) {
      console.error('获取用户歌单失败:', error);
      return [];
    }
  },

  // 获取用户喜欢的音乐ID列表
  getUserLikedSongs: async (uid) => {
    try {
      const response = await axios.get(`${BASE_URL}/likelist`, {
        params: {
          uid,
          timestamp: Date.now(),
        }
      });
      if (response.data.code === 200) {
        return response.data.ids || [];
      }
      return [];
    } catch (error) {
      console.error('获取喜欢的音乐失败:', error);
      return [];
    }
  },

  // 添加登出方法
  logout: async () => {
    try {
      await axios.get(`${BASE_URL}/logout`);
      await AsyncStorage.removeItem('music_cookie');
      axios.defaults.headers.common['Cookie'] = '';
      return true;
    } catch (error) {
      console.error('登出失败:', error);
      return false;
    }
  },

  // 获取每日推荐歌曲
  getDailyRecommendSongs: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/recommend/songs`);
      if (response.data.code === 200) {
        return response.data.data.dailySongs;
      }
      return [];
    } catch (error) {
      console.error('获取每日推荐歌曲失败:', error);
      return [];
    }
  },

  // 获取每日推荐歌单
  getDailyRecommendPlaylists: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/recommend/resource`);
      if (response.data.code === 200) {
        return response.data.recommend;
      }
      return [];
    } catch (error) {
      console.error('获取每日推荐歌单失败:', error);
      return [];
    }
  },

  // 检查歌曲是否已收藏
  checkSongLike: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/likelist`, {
        params: { timestamp: Date.now() }
      });
      if (response.data.code === 200) {
        const likedIds = response.data.ids || [];
        return likedIds.includes(id);
      }
      return false;
    } catch (error) {
      console.error('检查歌曲收藏状态失败:', error);
      return false;
    }
  },

  // 收藏歌曲
  likeSong: async (id, like = true) => {
    try {
      const response = await axios.get(`${BASE_URL}/like`, {
        params: {
          id,
          like,
          timestamp: Date.now()
        }
      });
      return response.data.code === 200;
    } catch (error) {
      console.error('收藏操作失败:', error);
      throw error;
    }
  },

  // 收藏/取消收藏歌单
  subscribePlaylist: async (id, subscribe = true) => {
    try {
      const response = await axios.get(`${BASE_URL}/playlist/subscribe`, {
        params: {
          id,
          t: subscribe ? 1 : 2, // 1: 收藏, 2: 取消收藏
          timestamp: Date.now()
        }
      });
      return response.data.code === 200;
    } catch (error) {
      console.error('收藏歌单操作失败:', error);
      throw error;
    }
  },

  // 检查歌单是否已收藏
  checkPlaylistSubscribed: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/playlist/detail/dynamic`, {
        params: { id }
      });
      if (response.data.code === 200) {
        return response.data.subscribed;
      }
      return false;
    } catch (error) {
      console.error('检查歌单收藏状态失败:', error);
      return false;
    }
  },

  // 分享歌单
  shareResource: async (id, type = 'playlist') => {
    try {
      const response = await axios.get(`${BASE_URL}/share/resource`, {
        params: {
          id,
          type, // 'playlist', 'song', 'mv', 'album'
          timestamp: Date.now()
        }
      });
      return response.data.code === 200;
    } catch (error) {
      console.error('分享失败:', error);
      throw error;
    }
  },
};

// 添加歌词解析函数
const parseLyric = (lrc) => {
  const lyrics = [];
  const lines = lrc.split('\n');
  const timeExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  lines.forEach(line => {
    const matches = timeExp.exec(line);
    if (matches) {
      const minutes = parseInt(matches[1]);
      const seconds = parseInt(matches[2]);
      const milliseconds = parseInt(matches[3]);
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(timeExp, '').trim();
      
      if (text) {
        lyrics.push({
          time,
          text,
        });
      }
    }
  });

  return lyrics;
}; 