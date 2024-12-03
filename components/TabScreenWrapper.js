import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from 'react-native-paper';

const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;

const TabScreenWrapper = ({ children }) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.statusBar, { backgroundColor: theme.colors.elevation.level2 }]} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
});

export default TabScreenWrapper; 