import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from 'react-native-paper';
import VideoDiscover from './VideoDiscover';
import VideoCategory from './VideoCategory';
import VideoRanking from './VideoRanking';

const Tab = createMaterialTopTabNavigator();

const VideoHome = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.elevation.level2,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarIndicatorStyle: {
          backgroundColor: theme.colors.primary,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      <Tab.Screen name="发现" component={VideoDiscover} />
      <Tab.Screen name="分类" component={VideoCategory} />
      <Tab.Screen name="排行" component={VideoRanking} />
    </Tab.Navigator>
  );
};

export default VideoHome; 