import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from 'react-native-paper';
import TabScreenWrapper from '../../components/TabScreenWrapper';
import MusicDiscover from './MusicDiscover';
import MusicCategory from './MusicCategory';
import MusicSearch from './MusicSearch';
import MusicProfile from './MusicProfile';
const Tab = createMaterialTopTabNavigator();

const MusicTabs = () => {
  const theme = useTheme();

  return (
    <TabScreenWrapper>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: theme.colors.elevation.level2,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarIndicatorStyle: {
            backgroundColor: theme.colors.primary,
          },
        }}
      >
        <Tab.Screen 
          name="Discover" 
          component={MusicDiscover}
          options={{ title: '发现' }}
        />
        <Tab.Screen 
          name="Category" 
          component={MusicCategory}
          options={{ title: '分类' }}
        />
        <Tab.Screen 
          name="Search" 
          component={MusicSearch}
          options={{ title: '搜索' }}
        />
        <Tab.Screen 
            name="Profile"
            component={MusicProfile}
            options={{ title: '我的' }}
        />
      </Tab.Navigator>
    </TabScreenWrapper>
  );
};

export default MusicTabs; 