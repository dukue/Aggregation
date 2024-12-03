import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme, Surface, TouchableRipple } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ReadCategory = () => {
  const theme = useTheme();

  const categories = [
    { id: 1, name: '玄幻', icon: 'sword' },
    { id: 2, name: '都市', icon: 'city' },
    { id: 3, name: '修真', icon: 'meditation' },
    { id: 4, name: '科幻', icon: 'rocket' },
    { id: 5, name: '历史', icon: 'book-clock' },
    { id: 6, name: '游戏', icon: 'gamepad-variant' },
    { id: 7, name: '武侠', icon: 'karate' },
    { id: 8, name: '奇幻', icon: 'star' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        {categories.map((category) => (
          <TouchableRipple
            key={category.id}
            onPress={() => {}}
            style={styles.categoryWrapper}
          >
            <Surface
              style={[
                styles.category,
                { backgroundColor: theme.colors.elevation.level1 },
              ]}
              elevation={1}
            >
              <Icon
                name={category.icon}
                size={32}
                color={theme.colors.primary}
              />
              <Text
                variant="titleMedium"
                style={[
                  styles.categoryName,
                  { color: theme.colors.onSurface },
                ]}
              >
                {category.name}
              </Text>
            </Surface>
          </TouchableRipple>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryWrapper: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  category: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    aspectRatio: 1,
  },
  categoryName: {
    marginTop: 8,
  },
});

export default ReadCategory; 