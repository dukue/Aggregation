import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import TrackPlayer, { State, useProgress, Event } from 'react-native-track-player';
import { setupPlayer } from '../services/trackPlayerService';
import { musicApi } from '../services/musicApi';
import { ToastAndroid } from 'react-native';
import { db } from '../services/database';

const MusicPlayerContext = createContext();

// 添加 useMusicPlayer hook
export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};

// 添加格式化函数
const formatTrackForPlayer = async (track) => {
  try {
    // 获取音乐URL
    let result = await musicApi.getSongUrl(track.id);
    
    // 处理错误响应
    if (result && result.error) {
      switch (result.error) {
        case 'VIP_REQUIRED':
          throw new Error('该歌曲需要 VIP 权限');
        case 'SONG_NOT_AVAILABLE':
          throw new Error('该歌曲暂时无法播放');
        case 'URL_NOT_FOUND':
          throw new Error('无法获取播放链接');
        case 'INVALID_RESPONSE':
          throw new Error('服务器响应异常');
        default:
          throw new Error('播放出错，请稍后重试');
      }
    }

    // 验证 URL 格式
    if (!result || typeof result !== 'string' || !result.startsWith('http')) {
      throw new Error('无效的播放链接');
    }

    // 返回格式化后的数据
    return {
      id: track.id.toString(),
      url: result,
      title: track.name,
      artist: track.ar.map(artist => artist.name).join(' / '),
      artwork: track.al.picUrl,
      // 添加更多音频相关配置
      pitchAlgorithm: 'LINEAR', // 音高算法
      headers: {}, // 如果需要的话添加请求头
    };
  } catch (error) {
    console.error('格式化音乐数据失败:', error);
    throw error;
  }
};

export const MusicPlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [playMode, setPlayMode] = useState('sequential'); // 'sequential', 'shuffle', 'repeat'
  const [progress, setProgress] = useState({ position: 0, duration: 0 });
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const [likedSongs, setLikedSongs] = useState([]);

  // 确保在组件挂载时初始化进度
  useEffect(() => {
    const getInitialProgress = async () => {
      try {
        const position = await TrackPlayer.getPosition();
        const duration = await TrackPlayer.getDuration();
        setProgress({ position, duration });
      } catch (error) {
        console.error('获取播放进度失败:', error);
        setProgress({ position: 0, duration: 0 });
      }
    };
    getInitialProgress();
  }, []);

  // 初始化播放器
  useEffect(() => {
    let mounted = true;

    async function setup() {
      try {
        console.log('Starting player setup...');
        
        if (!mounted) {
          console.log('Component unmounted, canceling setup');
          return;
        }

        const isSetup = await setupPlayer();
        console.log('Setup result:', isSetup);

        if (mounted && isSetup) {
          setIsReady(true);
          console.log('Player is ready');
        } else {
          console.log('Setup failed or component unmounted');
        }
      } catch (error) {
        console.error('Setup error:', error);
        if (mounted) {
          setIsReady(false);
        }
      }
    }

    setup();

    return () => {
      console.log('Cleaning up player context');
      mounted = false;
    };
  }, []);

  // 修改初始化逻辑
  useEffect(() => {
    const setup = async () => {
      try {
        await setupPlayer();
        
        // 恢复播放列表和上次播放的歌曲
        const [savedPlaylist, lastPlayedTrack] = await Promise.all([
          db.getPlaylist(),
          db.getLastPlayedTrack()
        ]);

        if (savedPlaylist.length > 0) {
          setPlaylist(savedPlaylist);
          
          // 确定要播放的歌曲
          const trackToPlay = lastPlayedTrack || savedPlaylist[0];
          setCurrentTrack(trackToPlay);
          
          try {
            // 格式化并添加歌曲
            const formattedTrack = await formatTrackForPlayer(trackToPlay);
            await TrackPlayer.reset();
            await TrackPlayer.add(formattedTrack);
            
            // 恢复播放进度
            const position = await db.getProgress(trackToPlay.id);
            if (position > 0) {
              await TrackPlayer.seekTo(position);
            }
          } catch (error) {
            console.error('恢复播放失败:', error);
          }
        }
      } catch (error) {
        console.error('播放器初始化失败:', error);
      }
    };

    setup();
  }, []);

  // 添加保存最后播放歌曲的逻辑
  useEffect(() => {
    if (currentTrack) {
      db.saveLastPlayedTrack(currentTrack).catch(error => {
        console.error('保存最后播放歌曲失败:', error);
      });
    }
  }, [currentTrack]);

  // 初始化时加载收藏列表
  useEffect(() => {
    const loadLikedSongs = async () => {
      try {
        const saved = await db.getLikedSongs();
        setLikedSongs(saved || []);
      } catch (error) {
        console.error('加载收藏列表失败:', error);
      }
    };
    loadLikedSongs();
  }, []);

  // 修改进度更新逻辑
  useEffect(() => {
    let progressUpdateInterval;

    const startProgressUpdate = () => {
      progressUpdateInterval = setInterval(async () => {
        try {
          const position = await TrackPlayer.getPosition();
          const duration = await TrackPlayer.getDuration();
          
          // 只在进度真正改变时才更新状态
          if (Math.abs(position - progressRef.current.position) > 0.5 ||
              duration !== progressRef.current.duration) {
            setProgress({ position, duration });
          }
        } catch (error) {
          console.error('获取播放进度失败:', error);
        }
      }, 1000);
    };

    const stopProgressUpdate = () => {
      if (progressUpdateInterval) {
        clearInterval(progressUpdateInterval);
      }
    };

    // 监听播放状态变化
    const playbackStateSubscription = TrackPlayer.addEventListener(
      Event.PlaybackState,
      async ({ state }) => {
        const isPlaying = state === State.Playing;
        setIsPlaying(isPlaying);
        
        if (isPlaying) {
          startProgressUpdate();
        } else {
          stopProgressUpdate();
        }
      }
    );

    // 开始时如果正在播放，就启动进更新
    TrackPlayer.getState().then(state => {
      if (state === State.Playing) {
        startProgressUpdate();
      }
    });

    return () => {
      stopProgressUpdate();
      playbackStateSubscription.remove();
    };
  }, []);

  // 修改 seekTo 函数
  const seekTo = useCallback(async (position) => {
    try {
      await TrackPlayer.seekTo(position);
      setProgress(prev => ({ ...prev, position }));
    } catch (error) {
      console.error('Seek failed:', error);
    }
  }, []);

  // 修改播放列表更新函数
  const updatePlaylist = async (newPlaylist) => {
    await db.savePlaylist(newPlaylist); // 保存到数据库
    setPlaylist(newPlaylist); // 更新状态
  };

  // 修改播放整个歌单的功能
  const playPlaylist = async (tracks, startIndex = 0) => {
    try {
      if (!tracks || tracks.length === 0) return;

      // 新播放列表
      await updatePlaylist(tracks);

      // 从指定位置开始播放
      if (startIndex >= 0 && startIndex < tracks.length) {
        // 重置播放器
        await TrackPlayer.reset();
        
        // 格式化并添加所有歌曲
        const formattedTracks = await Promise.all(
          tracks.map(track => formatTrackForPlayer(track))
        );
        
        // 添加所有歌曲到播放队列
        await TrackPlayer.add(formattedTracks);

        // 跳转到指定位置
        await TrackPlayer.skip(startIndex);
        
        // 更新当前播放歌曲
        setCurrentTrack(tracks[startIndex]);
        
        // 开始播放
        await TrackPlayer.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('播放列表失败:', error);
      ToastAndroid.show('播放列表加载失败', ToastAndroid.SHORT);
    }
  };

  // 修改播放单曲的功能
  const playMusic = async (track) => {
    try {
      // 重置播放器
      await TrackPlayer.reset();
      
      // 格式化并添加歌曲
      const formattedTrack = await formatTrackForPlayer(track);
      await TrackPlayer.add(formattedTrack);
      
      // 更新当前播放歌曲
      setCurrentTrack(track);
      
      // 恢复播放进度
      const position = await db.getProgress(track.id);
      if (position > 0) {
        await TrackPlayer.seekTo(position);
      }
      
      // 开始播放
      await TrackPlayer.play();
      setIsPlaying(true);
      
      // 只在歌曲不在播放列表中时更新播放列表
      const trackExists = playlist.some(t => t.id === track.id);
      if (!trackExists) {
        const newPlaylist = [...playlist, track];
        await db.savePlaylist(newPlaylist); // 只保存到数据库
        setPlaylist(newPlaylist); // 直接更新状态
      }
    } catch (error) {
      console.error('播放失败:', error);
      ToastAndroid.show(error.message || '播放失败', ToastAndroid.SHORT);
    }
  };

  // 修改播放/暂停切换函数
  const togglePlay = async () => {
    try {
      // 先获取当前的播放状态
      const playerState = await TrackPlayer.getState();
      const isCurrentlyPlaying = playerState === State.Playing;

      if (isCurrentlyPlaying) {
        await TrackPlayer.pause();
        setIsPlaying(false);
      } else {
        await TrackPlayer.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('切换播放状态失败:', error);
    }
  };

  // 停止播放的函数
  const stopMusic = async () => {
    await TrackPlayer.stop();
    setIsPlaying(false);
  };

  // 添加歌曲到播放列表的函数
  const addToPlaylist = async (track) => {
    // 检查歌曲是否已在播放列表中
    if (!playlist.some(t => t.id === track.id)) {
      const newPlaylist = [...playlist, track];
      await updatePlaylist(newPlaylist);
    }
  };

  // 从播放列表中移除歌曲的函数
  const removeFromPlaylist = async (track) => {
    const newPlaylist = playlist.filter(t => t.id !== track.id);
    await updatePlaylist(newPlaylist);
  };

  // 清空播放列表的函数
  const clearPlaylist = async () => {
    await updatePlaylist([]);
  };

  // 修改播放下一首的逻辑
  const playNext = async () => {
    try {
      if (!playlist.length) return;
      
      // 获取当前播放的曲目索引
      let currentIndex = -1;
      if (currentTrack) {
        currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
      }

      let nextIndex;
      switch (playMode) {
        case 'shuffle':
          // 随机模式：随机选择一首不同的歌
          if (playlist.length === 1) {
            nextIndex = 0;
          } else {
            do {
              nextIndex = Math.floor(Math.random() * playlist.length);
            } while (nextIndex === currentIndex);
          }
          break;
        case 'repeat':
          // 单曲循环模式：重新播放当前歌曲
          nextIndex = currentIndex >= 0 ? currentIndex : 0;
          break;
        default:
          // 顺序播放模式：播放下一首，到末尾则回到开头
          nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
      }

      await playMusic(playlist[nextIndex]);
    } catch (error) {
      console.error('播放下一首失败:', error);
    }
  };

  // 修改播放结束事件监听
  useEffect(() => {
    const subscription = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
      try {
        if (playMode === 'repeat' && currentTrack) {
          // 单曲循环模式：重新播放当前歌曲
          await TrackPlayer.seekTo(0);
          await TrackPlayer.play();
        } else {
          // 其他模式：播放下一曲
          await playNext();
        }
      } catch (error) {
        console.error('处理播放结束事件失败:', error);
      }
    });

    // 添加播放状态变化监听
    const playbackStateSubscription = TrackPlayer.addEventListener(
      Event.PlaybackState,
      async ({ state }) => {
        setIsPlaying(state === State.Playing);
      }
    );

    // 添加当前曲目变化监听
    const trackChangeSubscription = TrackPlayer.addEventListener(
      Event.PlaybackTrackChanged,
      async ({ nextTrack }) => {
        if (nextTrack !== null) {
          try {
            const track = await TrackPlayer.getTrack(nextTrack);
            if (track) {
              // 更新当前播放的曲目信息
              const trackInfo = playlist.find(t => t.id.toString() === track.id);
              if (trackInfo) {
                setCurrentTrack(trackInfo);
              }
            }
          } catch (error) {
            console.error('处理曲目变化事件失败:', error);
          }
        }
      }
    );

    return () => {
      subscription.remove();
      playbackStateSubscription.remove();
      trackChangeSubscription.remove();
    };
  }, [playMode, playlist, currentTrack]);

  // 修改切换播放模式的函数
  const togglePlayMode = () => {
    setPlayMode(currentMode => {
      switch (currentMode) {
        case 'sequential':
          return 'shuffle';
        case 'shuffle':
          return 'repeat';
        case 'repeat':
          return 'sequential';
        default:
          return 'sequential';
      }
    });
  };

  // 修改收藏功能
  const toggleLike = async (track) => {
    try {
      const isCurrentlyLiked = await musicApi.checkSongLike(track.id);
      const success = await musicApi.likeSong(track.id, !isCurrentlyLiked);
      
      if (success) {
        ToastAndroid.show(
          isCurrentlyLiked ? '已取消收藏' : '已添加到收藏', 
          ToastAndroid.SHORT
        );
      } else {
        throw new Error('操作失败');
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      ToastAndroid.show('操作失败，请检查登录状态', ToastAndroid.SHORT);
    }
  };

  // 修改检查收藏状态的函数
  const isLiked = useCallback(async (trackId) => {
    try {
      return await musicApi.checkSongLike(trackId);
    } catch (error) {
      console.error('检查收藏状态失败:', error);
      return false;
    }
  }, []);

  // 使用 useMemo 优化返回值
  const contextValue = useMemo(() => ({
    currentTrack,
    isPlaying,
    playlist,
    playMode,
    playMusic,
    playPlaylist,
    togglePlay,
    stopMusic,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    playNext,
    togglePlayMode,
    progress,
    seekTo,
    likedSongs,
    toggleLike,
    isLiked,
  }), [
    currentTrack,
    isPlaying,
    playlist,
    playMode,
    progress,
    seekTo,
    likedSongs,
    isLiked,
  ]);

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
};