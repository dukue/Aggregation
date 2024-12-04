import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReadHome from './ReadHome';
import SourceManager from './SourceManager';
import BookDetail from './BookDetail';
import Reader from './Reader';

const Stack = createNativeStackNavigator();

const ReadStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ReadHome" component={ReadHome} />
      <Stack.Screen 
        name="SourceManager" 
        component={SourceManager}
        options={{
          headerShown: true,
          title: '书源管理',
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="BookDetail" component={BookDetail} />
      <Stack.Screen name="Reader" component={Reader} />
    </Stack.Navigator>
  );
};

export default ReadStack; 