import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, useTheme, Surface, Button, Avatar, IconButton } from 'react-native-paper';
import { useMusicUser } from '../../contexts/MusicUserContext';
import { 
  Music as MusicIcon, 
  LogOut, 
  ChevronRight,
  User,
  Crown
} from 'lucide-react-native';

const MusicProfile = ({ navigation }) => {
  const theme = useTheme();
  const { user, userPlaylists, likedSongs, loading, logout, isVip } = useMusicUser();

  const renderLoginView = () => (
    <View style={styles.loginContainer}>
      <User size={80} color={theme.colors.primary} />
      <Text variant="titleLarge" style={styles.loginText}>
        登录网易云音乐
      </Text>
      <Text variant="bodyMedium" style={[styles.loginSubtext, { color: theme.colors.onSurfaceVariant }]}>
        享受完整音乐服务
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('MusicLogin')}
        style={styles.loginButton}
      >
        立即登录
      </Button>
    </View>
  );

  const renderUserInfo = () => (
    <Surface style={[styles.userCard, { backgroundColor: theme.colors.elevation.level2 }]} elevation={2}>
      <View style={styles.userHeader}>
        <Avatar.Image 
          source={{ uri: user.avatarUrl || user.profile?.avatarUrl }} 
          size={80} 
        />
        <View style={styles.userInfo}>
          <View style={styles.userNameContainer}>
            <Text variant="titleLarge">{user.nickname || user.profile?.nickname}</Text>
            {isVip && (
              <View style={[styles.vipBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                <Crown size={12} color={theme.colors.primary} />
                <Text style={[styles.vipText, { color: theme.colors.primary }]}>VIP</Text>
              </View>
            )}
          </View>
          <Text 
            variant="bodyMedium" 
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {user.signature || user.profile?.signature || '这个人很懒，什么都没写~'}
          </Text>
        </View>
        <IconButton
          icon={({ size, color }) => <LogOut size={size} color={color} />}
          size={24}
          onPress={logout}
        />
      </View>
      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <Text variant="titleMedium">{userPlaylists.length}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>歌单</Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="titleMedium">{likedSongs.length}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>喜欢</Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="titleMedium">{user.followeds || user.profile?.followeds || 0}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>粉丝</Text>
        </View>
      </View>
    </Surface>
  );

  const renderPlaylists = () => (
    <View style={styles.playlistsContainer}>
      <Text variant="titleMedium" style={styles.sectionTitle}>我的歌单</Text>
      {userPlaylists.map(playlist => (
        <TouchableOpacity
          key={playlist.id}
          onPress={() => navigation.navigate('PlaylistDetail', { playlistId: playlist.id })}
        >
          <Surface 
            style={[styles.playlistItem, { backgroundColor: theme.colors.elevation.level1 }]}
            elevation={1}
          >
            <Image source={{ uri: playlist.coverImgUrl }} style={styles.playlistCover} />
            <View style={styles.playlistInfo}>
              <Text variant="titleMedium" numberOfLines={1}>{playlist.name}</Text>
              <Text 
                variant="bodySmall" 
                style={{ color: theme.colors.onSurfaceVariant }}
                numberOfLines={1}
              >
                {playlist.trackCount}首歌曲
              </Text>
            </View>
            <IconButton
              icon={({ size, color }) => <ChevronRight size={size} color={color} />}
              size={24}
            />
          </Surface>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {user ? (
        <>
          {renderUserInfo()}
          {renderPlaylists()}
        </>
      ) : (
        renderLoginView()
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loginText: {
    marginTop: 20,
  },
  loginSubtext: {
    marginTop: 8,
  },
  loginButton: {
    marginTop: 32,
    paddingHorizontal: 32,
  },
  userCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userStats: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  playlistsContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  playlistCover: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  vipText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});

export default MusicProfile; 