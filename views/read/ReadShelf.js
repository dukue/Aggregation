import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Text, 
  useTheme, 
  Surface, 
  IconButton,
  Button 
} from 'react-native-paper';
import { Plus, Search, Settings } from 'lucide-react-native';
import { FadeInView } from '../../components/Animations';

const ReadShelf = ({ navigation }) => {
  const theme = useTheme();
  const [books, setBooks] = useState([]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
          我的书架
        </Text>
        <View style={styles.headerActions}>
          <IconButton 
            icon={({ size, color }) => <Search size={size} color={color} />}
            onPress={() => navigation.navigate('ReadDiscover')} 
          />
          <IconButton 
            icon={({ size, color }) => <Settings size={size} color={color} />}
            onPress={() => navigation.navigate('SourceManager')} 
          />
          <IconButton 
            icon={({ size, color }) => <Plus size={size} color={color} />}
            onPress={() => navigation.navigate('ReadDiscover')} 
          />
        </View>
      </View>
      
      {books.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text 
            variant="bodyLarge" 
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            书架空空如也，去发现页面找找好书吧
          </Text>
          <Button 
            mode="contained"
            style={{ marginTop: 16 }}
            onPress={() => navigation.navigate('SourceManager')}
          >
            添加书源
          </Button>
        </View>
      ) : (
        <View style={styles.booksGrid}>
          {books.map((book, index) => (
            <FadeInView key={book.id} delay={index * 200}>
              <Surface
                style={[
                  styles.bookSurface,
                  { backgroundColor: theme.colors.elevation.level1 },
                ]}
                elevation={1}
              >
                <View style={styles.bookCover}>
                  <Text variant="titleLarge" style={styles.bookTitle}>
                    {book.title}
                  </Text>
                </View>
                <View style={styles.bookInfo}>
                  <Text variant="bodyMedium">{book.author}</Text>
                  <Text 
                    variant="bodySmall" 
                    style={{ color: theme.colors.primary }}
                  >
                    {book.progress}
                  </Text>
                </View>
              </Surface>
            </FadeInView>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  booksGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookSurface: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bookCover: {
    aspectRatio: 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  bookTitle: {
    textAlign: 'center',
    padding: 8,
  },
  bookInfo: {
    padding: 8,
  },
});

export default ReadShelf; 