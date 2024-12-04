import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { Play, Users, Music } from 'lucide-react-native';

const PlaylistCard = ({ 
  playlist, 
  onPress, 
  style, 
  horizontal = false, // 是否水平布局
  showCreator = true // 是否显示创建者
}) => {
  const theme = useTheme();
  const [imageError, setImageError] = useState(false);

  const formatPlayCount = (count) => {
    if (!count) return '0';
    if (count >= 100000000) {
      return (count / 100000000).toFixed(1) + '亿';
    } else if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
  };

  const hasCreator = playlist.creator && playlist.creator.nickname;

  const renderCoverPlaceholder = () => (
    <View style={[styles.coverPlaceholder, { backgroundColor: theme.colors.elevation.level3 }]}>
      <Music size={32} color={theme.colors.onSurfaceDisabled} />
    </View>
  );

  return (
    <TouchableOpacity onPress={onPress}>
      <Surface
        style={[
          horizontal ? styles.horizontalCard : styles.verticalCard,
          { backgroundColor: theme.colors.elevation.level2 },
          style
        ]}
        elevation={2}
      >
        <View style={styles.coverContainer}>
          {playlist.coverImgUrl && !imageError ? (
            <Image
              source={{ uri: playlist.coverImgUrl }}
              style={styles.coverImage}
              onError={() => setImageError(true)}
            />
          ) : renderCoverPlaceholder()}
          <View style={styles.playCount}>
            <Play size={12} color="#fff" />
            <Text style={styles.playCountText}>
              {formatPlayCount(playlist.playCount)}
            </Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.titleContainer}>
            <Text 
              numberOfLines={2} 
              style={[
                styles.title,
                { color: theme.colors.onSurface }
              ]}
            >
              {playlist.name || '未知歌单'}
            </Text>
          </View>
          {showCreator && hasCreator && (
            <View style={styles.creatorContainer}>
              <Users size={12} color={theme.colors.onSurfaceVariant} />
              <Text 
                numberOfLines={1}
                style={[
                  styles.creatorName,
                  { color: theme.colors.onSurfaceVariant }
                ]}
              >
                {playlist.creator.nickname}
              </Text>
            </View>
          )}
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  verticalCard: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  horizontalCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  coverContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  playCount: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  playCountText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  infoContainer: {
    padding: 8,
    height: 72, // 固定信息区域高度
  },
  titleContainer: {
    flex: 1, // 让标题容器占据剩余空间
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20, // 固定创建者区域高度
  },
  creatorName: {
    fontSize: 12,
    marginLeft: 4,
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(PlaylistCard); 