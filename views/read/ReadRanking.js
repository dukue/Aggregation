import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme, Surface, Divider } from 'react-native-paper';

const ReadRanking = () => {
  const theme = useTheme();

  const rankings = [
    { id: 1, title: '诡秘之主', author: '爱潜水的乌贼', views: '1000万' },
    { id: 2, title: '斗破苍穹', author: '天蚕土豆', views: '900万' },
    { id: 3, title: '庆余年', author: '猫腻', views: '800万' },
    { id: 4, title: '凡人修仙传', author: '忘语', views: '700万' },
    { id: 5, title: '遮天', author: '辰东', views: '600万' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        热门排行
      </Text>
      
      {rankings.map((book, index) => (
        <React.Fragment key={book.id}>
          <Surface
            style={[
              styles.rankItem,
              { backgroundColor: theme.colors.elevation.level1 },
            ]}
            elevation={1}
          >
            <View style={styles.rankNumber}>
              <Text
                style={[
                  styles.number,
                  { color: index < 3 ? theme.colors.primary : theme.colors.onSurfaceVariant },
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <View style={styles.bookInfo}>
              <Text variant="titleMedium">{book.title}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {book.author}
              </Text>
            </View>
            <View style={styles.views}>
              <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                {book.views}
              </Text>
            </View>
          </Surface>
          {index < rankings.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  rankItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankNumber: {
    width: 40,
    alignItems: 'center',
  },
  number: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 8,
  },
  views: {
    marginLeft: 16,
  },
});

export default ReadRanking; 