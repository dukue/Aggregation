import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { Book, Film, Music2, User } from 'lucide-react-native';
import ReadStack from '../views/read/ReadStack';
import VideoStack from '../views/video/VideoStack';
import MusicStack from '../views/music/MusicStack';
import Profile from '../views/profile/Profile';

const Tab = createBottomTabNavigator();

const MobileBottomTabs = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.elevation.level2,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      <Tab.Screen
        name="Read"
        component={ReadStack}
        options={{
          headerShown: false,
          tabBarLabel: '阅读',
          tabBarIcon: ({ color, size }) => <Book size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Video"
        component={VideoStack}
        options={{
          headerShown: false,
          tabBarLabel: '影视',
          tabBarIcon: ({ color, size }) => <Film size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Music"
        component={MusicStack}
        options={{
          headerShown: false,
          tabBarLabel: '音乐',
          tabBarIcon: ({ color, size }) => <Music2 size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: false,
          tabBarLabel: '我的',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MobileBottomTabs; 