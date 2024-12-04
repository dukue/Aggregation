import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';

const VideoDiscover = () => {
  const theme = useTheme();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          热门推荐
        </Text>
        <Surface style={[styles.placeholder, { backgroundColor: theme.colors.elevation.level1 }]}>
          <Text>即将上线</Text>
        </Surface>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  placeholder: {
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoDiscover; 