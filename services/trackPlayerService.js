import TrackPlayer, { Event, Capability } from 'react-native-track-player';

export const setupPlayer = async () => {
  try {
    let isSetup = false;
    try {
      isSetup = await TrackPlayer.isServiceRunning();
    } catch {
      isSetup = false;
    }

    if (!isSetup) {
      await TrackPlayer.setupPlayer({
        maxCacheSize: 1024 * 5,
      });

      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
        ],
        android: {
          appIcon: 'ic_launcher',
          notification: {
            channelId: 'music_player_channel',
            channelName: 'Music Player',
          },
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Error setting up player:', error);
    return false;
  }
};

// 导出默认服务处理函数
export default async function() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('Remote play triggered');
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('Remote pause triggered');
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    console.log('Remote stop triggered');
    TrackPlayer.stop();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    console.log('Remote next triggered');
    TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    console.log('Remote previous triggered');
    TrackPlayer.skipToPrevious();
  });

  // 必须返回一个空函数
  return () => {};
} 