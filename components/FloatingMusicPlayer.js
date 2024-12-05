import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Animated, PanResponder, Image, View, Dimensions, Easing } from 'react-native';
import { useTheme, Surface, IconButton } from 'react-native-paper';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { PlayCircle, PauseCircle, Music } from 'lucide-react-native';

const CIRCLE_SIZE = 50;
const TAB_BAR_HEIGHT = 60;
const SCREEN_PADDING = 20;

const DefaultCover = () => {
  const theme = useTheme();
  
  return (
    <View style={[styles.defaultCover, { backgroundColor: theme.colors.elevation.level3 }]}>
      <Music size={24} color={theme.colors.onSurfaceVariant} />
    </View>
  );
};

const FloatingMusicPlayer = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { currentTrack, isPlaying, togglePlay, showFloatingPlayer } = useMusicPlayer();
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
  const startAutoHide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      // 检查是否贴边
      const isAtEdge = position.x._value === 0 || 
                      position.x._value === (screenDimensions.width - CIRCLE_SIZE);
      
      if (isAtEdge) {
        // 如果在边缘，执行半透明动画
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }, 3000);
  }, [fadeAnim, position, screenDimensions.width]);

  // 添加淡入淡出动画值
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 显示播放器
  const showPlayer = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    startAutoHide();
  }, [fadeAnim, startAutoHide]);

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

  // 修改 panResponder
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // 开始拖动时取消隐藏计时器
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
      showPlayer(); // 确保显示

      position.setOffset({
        x: position.x._value,
        y: position.y._value,
      });
      position.setValue({ x: 0, y: 0 });
      
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderMove: (_, gestureState) => {
      const { dx, dy } = gestureState;
      // 允许在整个屏幕范围内移动
      const newX = Math.max(0, Math.min(screenDimensions.width - CIRCLE_SIZE, position.x._offset + dx));
      const newY = Math.max(0, Math.min(screenDimensions.height - CIRCLE_SIZE, position.y._offset + dy));
      
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

      // 计算吸附位置
      const currentX = position.x._value;
      const currentY = position.y._value;
      
      // 水平吸附
      const targetX = currentX < screenDimensions.width / 2 ? 0 : screenDimensions.width - CIRCLE_SIZE;
      
      // 垂直位置保持不变，但确保在屏幕范围内
      const targetY = Math.max(
        SCREEN_PADDING,
        Math.min(
          screenDimensions.height - CIRCLE_SIZE - TAB_BAR_HEIGHT - SCREEN_PADDING,
          currentY
        )
      );

      // 执行吸附动画
      Animated.spring(position, {
        toValue: {
          x: targetX,
          y: targetY,
        },
        useNativeDriver: false,
        friction: 7,
        tension: 50,
      }).start(() => {
        // 吸附完成后开始计时
        startAutoHide();
      });
    },
  })).current;

  // 初始化时开始计时
  useEffect(() => {
    startAutoHide();
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [startAutoHide]);

  // 修改渲染条件检查
  const shouldRender = useCallback(() => {
    return currentTrack && 
           typeof currentTrack === 'object' && 
           currentTrack.id && 
           currentTrack.al && 
           currentTrack.al.picUrl;
  }, [currentTrack]);

  // 移除调试日志
  useEffect(() => {
    if (!currentTrack) return;
    
    if (shouldRender()) {
      showPlayer();
    }
  }, [currentTrack, shouldRender, showPlayer]);

  // 修改渲染条件，移除日志
  if (!shouldRender() || !showFloatingPlayer) {
    return null;
  }

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
          zIndex: 1000,
          elevation: 5,
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
          {currentTrack.al?.picUrl ? (
            <Image
              source={{ uri: currentTrack.al.picUrl }}
              style={styles.cover}
            />
          ) : (
            <DefaultCover />
          )}
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
            onPress={togglePlay}
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
    elevation: 5, // 添加 Android 阴影
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
  defaultCover: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(FloatingMusicPlayer); // 使用 React.memo 优化性能 