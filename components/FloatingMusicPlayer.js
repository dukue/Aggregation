import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Animated, PanResponder, Image, View, Dimensions, Easing } from 'react-native';
import { useTheme, Surface, IconButton } from 'react-native-paper';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { PlayCircle, PauseCircle } from 'lucide-react-native';

const CIRCLE_SIZE = 50;
const TAB_BAR_HEIGHT = 60;
const SCREEN_PADDING = 20;

const FloatingMusicPlayer = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { currentTrack, isPlaying, togglePlay } = useMusicPlayer();
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const [isVisible, setIsVisible] = useState(true);
  const hideTimer = useRef(null);
  const opacity = useRef(new Animated.Value(1)).current;

  // 添加双击相关状态
  const lastTap = useRef(0);
  const tapTimeout = useRef(null);

  // 修改处理点击事件
  const handlePress = async () => {
    if (!isVisible) {
      showPlayer();
      return;
    }

    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
      // 双击
      clearTimeout(tapTimeout.current);
      lastTap.current = 0;
      try {
        await togglePlay();
      } catch (error) {
        console.error('播放控制失败:', error);
      }
    } else {
      // 单击
      lastTap.current = now;
      tapTimeout.current = setTimeout(() => {
        navigation.navigate('Music', {
          screen: 'FullscreenPlayer'
        });
        lastTap.current = 0;
      }, DOUBLE_PRESS_DELAY);
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
    };
  }, []);

  // 使用 useRef 来存储初始位置
  const initialPosition = useRef({
    x: screenDimensions.width - CIRCLE_SIZE - SCREEN_PADDING,
    y: screenDimensions.height - CIRCLE_SIZE - TAB_BAR_HEIGHT - SCREEN_PADDING,
  }).current;

  // 监听屏幕尺寸变化
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // 分离动画值
  const position = useRef(new Animated.ValueXY(initialPosition)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // 添加旋转动画值
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotationAnimation = useRef(null);

  // 计算旋转角度
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // 处理旋转动画
  useEffect(() => {
    if (isPlaying) {
      rotationAnimation.current = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotationAnimation.current.start();
    } else {
      rotationAnimation.current?.stop();
    }

    return () => {
      rotationAnimation.current?.stop();
    };
  }, [isPlaying]);

  // 添加自动隐藏功能
  const startHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setIsVisible(false);
    }, 3000);
  }, [opacity]);

  // 添加淡入淡出动画值
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 显示播放器
  const showPlayer = useCallback(() => {
    setIsVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    startHideTimer();
  }, [fadeAnim, startHideTimer]);

  // 隐藏播放器
  const hidePlayer = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  }, [fadeAnim]);

  // 修改拖拽处理器
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
    },
    onPanResponderGrant: () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
      showPlayer();
      position.setOffset({
        x: position.x._value,
        y: position.y._value,
      });
      position.setValue({ x: 0, y: 0 });

      Animated.spring(scale, {
        toValue: 0.8,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderMove: (_, gestureState) => {
      const { dx, dy } = gestureState;
      const newX = Math.max(SCREEN_PADDING, Math.min(screenDimensions.width - CIRCLE_SIZE - SCREEN_PADDING, position.x._offset + dx));
      const newY = Math.max(SCREEN_PADDING, Math.min(screenDimensions.height - CIRCLE_SIZE - TAB_BAR_HEIGHT - SCREEN_PADDING, position.y._offset + dy));
      
      position.x.setValue(newX - position.x._offset);
      position.y.setValue(newY - position.y._offset);
    },
    onPanResponderRelease: (_, gestureState) => {
      position.flattenOffset();

      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      // 判断是否为点击
      if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
        handlePress();
        return;
      }

      // 吸附到边缘
      const currentX = position.x._value;
      const targetX = currentX < screenDimensions.width / 2 ? SCREEN_PADDING : screenDimensions.width - CIRCLE_SIZE - SCREEN_PADDING;

      Animated.spring(position, {
        toValue: {
          x: targetX,
          y: position.y._value,
        },
        useNativeDriver: false,
        friction: 7,
        tension: 50,
      }).start(() => {
        startHideTimer(); // 吸附完成后开始计时
      });
    },
  })).current;

  // 初始化时开始计时
  useEffect(() => {
    startHideTimer();
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [startHideTimer]);

  if (!currentTrack) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { scale },
          ],
          opacity: fadeAnim,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Surface 
        style={[
          styles.circle, 
          { 
            backgroundColor: theme.colors.elevation.level2,
            borderWidth: 1,
            borderColor: theme.colors.elevation.level3,
          }
        ]} 
        elevation={8}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image
            source={{ uri: currentTrack.al.picUrl }}
            style={styles.cover}
          />
        </Animated.View>
        <View 
          style={[
            styles.playingIndicator, 
            { 
              borderColor: theme.colors.primary,
              backgroundColor: theme.dark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
            }
          ]}
        >
          <IconButton
            icon={({ size, color }) => isPlaying ? <PauseCircle size={size} color={color} /> : <PlayCircle size={size} color={color} />}
            size={16}
            iconColor={theme.colors.primary}
          />
        </View>
      </Surface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cover: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
  },
  playingIndicator: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});

export default FloatingMusicPlayer; 