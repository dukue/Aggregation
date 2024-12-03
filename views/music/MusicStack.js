import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MusicHome from './MusicHome';
import PlaylistDetail from './PlaylistDetail';
import FullscreenPlayer from './FullscreenPlayer';
import MusicLogin from './MusicLogin';
import DailyRecommend from './DailyRecommend';
import MusicSearch from './MusicSearch';

const Stack = createNativeStackNavigator();

const MusicStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MusicHome" component={MusicHome} />
      <Stack.Screen name="PlaylistDetail" component={PlaylistDetail} />
      <Stack.Screen 
        name="FullscreenPlayer" 
        component={FullscreenPlayer}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="MusicLogin" 
        component={MusicLogin}
        options={{
          headerShown: true,
          title: '登录',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="DailyRecommend" 
        component={DailyRecommend}
        options={{
          headerShown: true,
          title: '每日推荐',
        }}
      />
      <Stack.Screen 
        name="MusicSearch" 
        component={MusicSearch}
        options={{
          headerShown: true,
          title: '搜索',
        }}
      />
    </Stack.Navigator>
  );
};

export default MusicStack; 