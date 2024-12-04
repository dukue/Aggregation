import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MusicTabs from './MusicTabs';
import PlaylistDetail from './PlaylistDetail';
import FullscreenPlayer from './FullscreenPlayer';
import MusicLogin from './MusicLogin';
import DailyRecommend from './DailyRecommend';

const Stack = createNativeStackNavigator();

const MusicHome = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MusicTabs" 
        component={MusicTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PlaylistDetail" 
        component={PlaylistDetail}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="FullscreenPlayer" 
        component={FullscreenPlayer}
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
          animationDuration: 300,
        }}
      />
      <Stack.Screen 
        name="MusicLogin" 
        component={MusicLogin}
        options={{
          title: '登录',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="DailyRecommend" 
        component={DailyRecommend}
        options={{
          title: '每日推荐',
        }}
      />
    </Stack.Navigator>
  );
};

export default MusicHome; 