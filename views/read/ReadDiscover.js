import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, useTheme, Surface, TouchableRipple, ActivityIndicator } from 'react-native-paper';
import { useBookSource } from '../../contexts/BookSourceContext';
import { sourceParser } from '../../services/sourceParser';

const ReadDiscover = () => {
  const theme = useTheme();
  const { sources, selectedSource, setSelectedSource, loading } = useBookSource();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // 当选中的书源改变时,加载分类
  useEffect(() => {
    if (selectedSource) {
      loadCategories();
    }
  }, [selectedSource]);

  const loadCategories = async () => {
    if (!selectedSource) return;
    
    setLoadingCategories(true);
    try {
      const cats = await sourceParser.getCategories(selectedSource);
      setCategories(cats);
    } catch (error) {
      console.error('加载分类失败:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const renderSourceItem = ({ item }) => (
    <TouchableRipple
      onPress={() => setSelectedSource(item)}
      style={[
        styles.sourceItem,
        selectedSource?.id === item.id && {
          backgroundColor: theme.colors.primaryContainer
        }
      ]}
    >
      <View>
        <Text 
          variant="titleMedium"
          style={[
            styles.sourceName,
            selectedSource?.id === item.id && {
              color: theme.colors.primary
            }
          ]}
        >
          {item.name}
        </Text>
        <Text 
          variant="bodySmall" 
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {item.baseUrl}
        </Text>
      </View>
    </TouchableRipple>
  );

  const renderCategoryItem = ({ item }) => (
    <Surface 
      style={[
        styles.categoryItem,
        { backgroundColor: theme.colors.elevation.level1 }
      ]}
      elevation={1}
    >
      <Text variant="titleMedium">{item.name}</Text>
      <Text 
        variant="bodySmall" 
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        {item.bookCount || '未知'} 本书
      </Text>
    </Surface>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 左侧书源列表 */}
      <View style={[styles.sourceList, { borderColor: theme.colors.outline }]}>
        <Text 
          variant="titleMedium" 
          style={[styles.sectionTitle, { color: theme.colors.primary }]}
        >
          书源列表
        </Text>
        <FlatList
          data={sources}
          renderItem={renderSourceItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* 右侧分类列表 */}
      <View style={styles.categoryList}>
        <Text 
          variant="titleMedium" 
          style={[styles.sectionTitle, { color: theme.colors.primary }]}
        >
          分类浏览
        </Text>
        {loadingCategories ? (
          <ActivityIndicator style={styles.categoryLoading} />
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoryGrid}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceList: {
    width: '35%',
    borderRightWidth: 1,
    padding: 16,
  },
  categoryList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sourceItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  sourceName: {
    marginBottom: 4,
  },
  categoryGrid: {
    padding: 8,
  },
  categoryItem: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 8,
    minHeight: 100,
  },
  categoryLoading: {
    marginTop: 32,
  }
});

export default ReadDiscover; 