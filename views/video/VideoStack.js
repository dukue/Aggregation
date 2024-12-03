import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VideoHome from './VideoHome';
import VideoDetail from './VideoDetail';
import VideoPlayer from './VideoPlayer';

const Stack = createNativeStackNavigator();

const VideoStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="VideoHome" component={VideoHome} />
      <Stack.Screen name="VideoDetail" component={VideoDetail} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayer} />
    </Stack.Navigator>
  );
};

export default VideoStack; 