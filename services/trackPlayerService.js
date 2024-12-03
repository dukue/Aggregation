import TrackPlayer, { Event, Capability } from 'react-native-track-player';

export const setupPlayer = async () => {
  let isSetup = false;
  try {
    // 检查是否已经初始化
    try {
      const state = await TrackPlayer.getState();
      isSetup = state !== null;
    } catch {
      // 如果获取状态失败，说明需要初始化
      isSetup = false;
    }

    if (!isSetup) {
      console.log('Initializing player...');
      await TrackPlayer.setupPlayer({
        maxCacheSize: 1024 * 5, // 5mb
      });

      console.log('Setting up player options...');
      await TrackPlayer.updateOptions({
        // 简化功能，只保留基本控制
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
        ],
        android: {
          appIcon: 'ic_launcher',
          notification: {
            channelId: 'music_player_channel',
            channelName: 'Music Player',
          },
        },
      });

      isSetup = true;
      console.log('Player setup completed');
    }

    return isSetup;
  } catch (error) {
    console.error('Error in setupPlayer:', error);
    return false;
  }
};

// 简化服务函数
export default async function() {
  try {
    // 基本播放控制
    TrackPlayer.addEventListener(Event.RemotePlay, () => {
      console.log('Remote play');
      TrackPlayer.play().catch(console.error);
    });

    TrackPlayer.addEventListener(Event.RemotePause, () => {
      console.log('Remote pause');
      TrackPlayer.pause().catch(console.error);
    });

    TrackPlayer.addEventListener(Event.RemoteStop, () => {
      console.log('Remote stop');
      TrackPlayer.stop().catch(console.error);
    });

    // 返回一个空函数以满足接口要求
    return () => {};
  } catch (error) {
    console.error('Error in service setup:', error);
    // 返回一个空函数以满足接口要求
    return () => {};
  }
} 