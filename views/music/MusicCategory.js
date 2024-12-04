import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Chip, Text, useTheme, Surface, ActivityIndicator } from 'react-native-paper';
import { musicApi } from '../../services/musicApi';
import { 
  Play, 
  Music, 
  Users, 
  Calendar, 
  Music2, 
  Radio, 
  Heart, 
  Coffee, 
  Gamepad2, 
  Mic2, 
  Globe, 
  Sparkles, 
  Clock, 
  Tag 
} from 'lucide-react-native';
import PlaylistCard from '../../components/PlaylistCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const MusicCategory = ({ navigation }) => {
  const theme = useTheme();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadPlaylists(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await musicApi.getMusicCategories();
      if (data && data.length > 0) {
        setCategories(data);
        setSelectedCategory(data[0].name);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylists = async (category) => {
    setLoading(true);
    try {
      const data = await musicApi.getCategoryPlaylists(category);
      setPlaylists(data || []);
    } catch (error) {
      console.error('获取歌单失败:', error);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPlayCount = (count) => {
    if (count >= 100000000) {
      return (count / 100000000).toFixed(1) + '亿';
    } else if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
  };

  const getCategoryIcon = useCallback((category) => {
    const iconProps = {
      size: 16,
      color: selectedCategory === category.name ? 
        theme.colors.primary : 
        theme.colors.onSurfaceVariant
    };

    switch (category.name) {
      case '流行': return <Music2 {...iconProps} />;
      case '电台': return <Radio {...iconProps} />;
      case '情感': return <Heart {...iconProps} />;
      case '生活': return <Coffee {...iconProps} />;
      case '游戏': return <Gamepad2 {...iconProps} />;
      case '歌手': return <Mic2 {...iconProps} />;
      case '语种': return <Globe {...iconProps} />;
      case '风格': return <Sparkles {...iconProps} />;
      case '年代': return <Clock {...iconProps} />;
      default: return <Tag {...iconProps} />;
    }
  }, [selectedCategory, theme]);

  const scrollToSelectedCategory = useCallback(() => {
    if (scrollViewRef.current && selectedCategory) {
      const selectedIndex = categories.findIndex(c => c.name === selectedCategory);
      if (selectedIndex !== -1) {
        const scrollX = selectedIndex * (styles.categoryChip.width + styles.categoryChip.marginRight);
        scrollViewRef.current.measure((x, y, width) => {
          const centerOffset = (width - styles.categoryChip.width) / 2;
          scrollViewRef.current.scrollTo({
            x: Math.max(0, scrollX - centerOffset),
            animated: true,
          });
        });
      }
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    scrollToSelectedCategory();
  }, [selectedCategory]);

  useEffect(() => {
    if (categories.length > 0 && selectedCategory) {
      scrollToSelectedCategory();
    }
  }, [categories]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryContainer: {
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.1)',
      backgroundColor: theme.colors.elevation.level1,
    },
    categoryList: {
      maxHeight: 48,
    },
    categoryContent: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    categoryChip: {
      marginRight: 8,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'transparent',
      paddingLeft: 4,
      width: 80,
    },
    selectedChip: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    categoryText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    selectedText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 8,
      justifyContent: 'space-between',
    },
    playlistCard: {
      width: CARD_WIDTH,
      margin: 8,
    },
  });

  if (loading && categories.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.categoryContainer}>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryList}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map(category => (
            <Chip
              key={category.name}
              selected={selectedCategory === category.name}
              selectedColor={theme.colors.primary}
              style={[
                styles.categoryChip,
                selectedCategory === category.name && styles.selectedChip
              ]}
              textStyle={[
                styles.categoryText,
                selectedCategory === category.name && styles.selectedText
              ]}
              mode="outlined"
              compact
              onPress={() => setSelectedCategory(category.name)}
              icon={() => getCategoryIcon(category)}
            >
              {category.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.grid}>
          {playlists.map(playlist => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onPress={() => navigation.navigate('PlaylistDetail', { playlistId: playlist.id })}
              style={styles.playlistCard}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default MusicCategory; 