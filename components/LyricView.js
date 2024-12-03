import React, { useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Animated } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');
const ITEM_HEIGHT = 40;
const SCROLL_OFFSET = screenHeight * 0.1;

const LyricView = ({ lyrics = [], currentTime = 0, onPress }) => {
  const theme = useTheme();
  const scrollViewRef = useRef(null);
  const currentIndex = useRef(0);

  // 找到当前播放的歌词索引
  const getCurrentIndex = () => {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        return i;
      }
    }
    return 0;
  };

  // 滚动到当前歌词
  useEffect(() => {
    const index = getCurrentIndex();
    if (index !== currentIndex.current && scrollViewRef.current) {
      currentIndex.current = index;
      scrollViewRef.current.scrollTo({
        y: index * ITEM_HEIGHT,
        animated: true,
      });
    }
  }, [currentTime, lyrics]);

  if (!lyrics.length) {
    return (
      <TouchableOpacity 
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          暂无歌词，点击返回
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.topPadding} />
        {lyrics.map((lyric, index) => {
          const isCurrent = currentTime >= lyric.time && 
            (index === lyrics.length - 1 || currentTime < lyrics[index + 1].time);

          return (
            <Animated.View
              key={index}
              style={[
                styles.lyricItem,
                isCurrent && styles.currentLyricItem,
              ]}
            >
              <Text
                style={[
                  styles.lyricText,
                  { color: theme.colors.onSurfaceVariant },
                  isCurrent && { 
                    color: theme.colors.primary,
                    fontWeight: 'bold',
                    fontSize: 18,
                  },
                ]}
              >
                {lyric.text}
              </Text>
            </Animated.View>
          );
        })}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  topPadding: {
    height: SCROLL_OFFSET,
  },
  bottomPadding: {
    height: SCROLL_OFFSET,
  },
  lyricItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  currentLyricItem: {
    transform: [{ scale: 1.05 }],
  },
  lyricText: {
    textAlign: 'center',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: SCROLL_OFFSET,
    fontSize: 16,
  },
});

export default LyricView; 