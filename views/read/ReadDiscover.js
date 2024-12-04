import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { 
  Text, 
  useTheme, 
  Surface, 
  Searchbar,
  IconButton,
  TouchableRipple,
  ActivityIndicator,
  Chip,
  Divider 
} from 'react-native-paper';
import { FadeInView } from '../../components/Animations';
import { sourceManager } from '../../services/sourceManager';
import { useFocusEffect } from '@react-navigation/native';

const ReadDiscover = ({ navigation }) => {
  const theme = useTheme();
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 添加 useFocusEffect 来监听页面焦点
  useFocusEffect(
    React.useCallback(() => {
      loadSources();
    }, [])
  );

  // 修改 loadSources 函数
  const loadSources = async () => {
    try {
      await sourceManager.initPromise;
      const allSources = sourceManager.getAllSources()
        .filter(source => 
          source.source.enabled && 
          source.source.enabledExplore && 
          source.source.exploreUrl
        );
      setSources(allSources);
      
      // 如果当前选中的书源被禁用，则重新选择第一个可用的书源
      if (selectedSource && !allSources.find(s => 
        s.source.bookSourceUrl === selectedSource.source.bookSourceUrl
      )) {
        if (allSources.length > 0) {
          setSelectedSource(allSources[0]);
          loadCategories(allSources[0]);
        } else {
          setSelectedSource(null);
          setCategories([]);
        }
      } else if (allSources.length > 0 && !selectedSource) {
        setSelectedSource(allSources[0]);
        loadCategories(allSources[0]);
      }
    } catch (error) {
      console.error('加载书源失败:', error);
    }
  };

  // 加载分类信息
  const loadCategories = async (source) => {
    setLoading(true);
    try {
      const exploreUrl = source.source.exploreUrl;
      let categories = [];

      // 解析发现规则
      if (typeof exploreUrl === 'string') {
        // 尝试解析 JSON 格式
        try {
          const jsonData = JSON.parse(exploreUrl);
          if (Array.isArray(jsonData)) {
            categories = jsonData.map(item => ({
              name: item.title,
              url: item.url,
              style: item.style
            }));
          }
        } catch {
          // 如果不是 JSON 格式，则按&&或\n分隔的格式处理
          categories = exploreUrl.split(/&&|\n/).map(item => {
            const [nameUrl] = item.split('::');
            if (!nameUrl) return null;
            
            const [name, url] = nameUrl.split(':').map(s => s.trim());
            return { 
              name, 
              url,
              style: {
                layout_flexGrow: 1,
                layout_flexBasisPercent: 25 // 默认4列布局
              }
            };
          }).filter(Boolean); // 过滤掉无效的项
        }
      }

      setCategories(categories);
    } catch (error) {
      console.error('加载分类失败:', error);
      setCategories([]); // 出错时清空分类
    } finally {
      setLoading(false);
    }
  };

  const handleSourceSelect = (source) => {
    setSelectedSource(source);
    loadCategories(source);
  };

  const filteredSources = sources.filter(source =>
    source.source.bookSourceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.sourceList}>
        <Searchbar
          placeholder="搜索书源"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <ScrollView>
          {filteredSources.map((source) => (
            <TouchableRipple
              key={source.source.bookSourceUrl}
              onPress={() => handleSourceSelect(source)}
            >
              <Surface 
                style={[
                  styles.sourceItem,
                  { 
                    backgroundColor: theme.colors.elevation.level1,
                    borderLeftColor: selectedSource?.source.bookSourceUrl === source.source.bookSourceUrl 
                      ? theme.colors.primary 
                      : 'transparent',
                  }
                ]}
              >
                <Text variant="titleMedium">{source.source.bookSourceName}</Text>
                {source.source.bookSourceGroup && (
                  <Chip compact mode="flat" style={styles.groupChip}>
                    {source.source.bookSourceGroup}
                  </Chip>
                )}
              </Surface>
            </TouchableRipple>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.categoryList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <TouchableRipple
                key={index}
                onPress={() => {
                  navigation.navigate('CategoryBooks', {
                    source: selectedSource,
                    category: category
                  });
                }}
                style={[
                  styles.categoryWrapper,
                  category.style && {
                    flexGrow: category.style.layout_flexGrow,
                    flexShrink: category.style.layout_flexShrink,
                    alignSelf: category.style.layout_alignSelf,
                    flexBasis: category.style.layout_flexBasisPercent >= 0 
                      ? `${category.style.layout_flexBasisPercent}%` 
                      : 'auto',
                    width: category.style ? undefined : '48%',
                  }
                ]}
              >
                <Surface
                  style={[
                    styles.categoryItem,
                    { backgroundColor: theme.colors.elevation.level1 }
                  ]}
                >
                  <Text variant="titleMedium">{category.name}</Text>
                </Surface>
              </TouchableRipple>
            ))}
          </ScrollView>
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
  sourceList: {
    width: Dimensions.get('window').width * 0.35,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
  },
  searchbar: {
    elevation: 0,
    margin: 8,
  },
  sourceItem: {
    padding: 16,
    borderLeftWidth: 3,
  },
  groupChip: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  categoryList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  categoryWrapper: {
    marginBottom: 16,
    marginRight: 16,
    minWidth: 100,
  },
  categoryItem: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    width: '100%',
  },
});

export default ReadDiscover; 