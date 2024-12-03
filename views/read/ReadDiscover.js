import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Text, 
  useTheme, 
  Surface, 
  Searchbar,
  IconButton,
  TouchableRipple 
} from 'react-native-paper';
import { FadeInView } from '../../components/Animations';
import { sourceManager } from '../../services/sourceManager';

const ReadDiscover = ({ navigation }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const sources = sourceManager.getAllSources();
      let allResults = [];
      
      for (const source of sources) {
        const results = await source.search(searchQuery);
        allResults = [...allResults, ...results];
      }
      
      setSearchResults(allResults);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="搜索书籍"
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          loading={loading}
          style={styles.searchbar}
        />
      </View>

      <ScrollView style={styles.results}>
        {searchResults.map((book, index) => (
          <FadeInView key={`${book.bookUrl}-${index}`} delay={index * 100}>
            <TouchableRipple
              onPress={() => navigation.navigate('BookDetail', { book })}
            >
              <Surface style={[styles.bookItem, { backgroundColor: theme.colors.elevation.level1 }]}>
                <View style={styles.bookInfo}>
                  <Text variant="titleMedium">{book.name}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {book.author}
                  </Text>
                  <Text 
                    variant="bodySmall" 
                    style={{ color: theme.colors.onSurfaceVariant }}
                    numberOfLines={2}
                  >
                    {book.intro}
                  </Text>
                </View>
              </Surface>
            </TouchableRipple>
          </FadeInView>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchbar: {
    elevation: 0,
  },
  results: {
    flex: 1,
    padding: 16,
  },
  bookItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  bookInfo: {
    gap: 4,
  },
});

export default ReadDiscover; 