import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from 'react-native-paper';
import ReadShelf from './ReadShelf';
import ReadDiscover from './ReadDiscover';

const Tab = createMaterialTopTabNavigator();

const ReadHome = () => {
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
      <Tab.Screen name="书架" component={ReadShelf} />
      <Tab.Screen name="发现" component={ReadDiscover} />
    </Tab.Navigator>
  );
};

export default ReadHome; 