import React, { createContext, useContext, useState, useEffect } from 'react';
import { musicApi } from '../services/musicApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MusicUserContext = createContext();

export const MusicUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVip, setIsVip] = useState(false);

  // 检查登录状态
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 当用户信息更新时，获取用户歌单和喜欢的音乐
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const checkLoginStatus = async () => {
    try {
      setLoading(true);
      const userInfo = await musicApi.getUserInfo();
      console.log('User info:', userInfo);
      
      if (userInfo && userInfo.id) {
        setUser(userInfo);
        setIsVip(userInfo.vipType > 0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('检查登录状态失败:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      if (!user || !user.id) {
        console.error('No user ID available');
        return;
      }

      console.log('Loading user data for:', user.id);
      const [playlists, liked] = await Promise.all([
        musicApi.getUserPlaylists(user.id),
        musicApi.getUserLikedSongs(user.id),
      ]);

      console.log('User playlists:', playlists.length);
      console.log('Liked songs:', liked.length);

      setUserPlaylists(playlists);
      setLikedSongs(liked);
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const success = await musicApi.logout();
      if (success) {
        setUser(null);
        setUserPlaylists([]);
        setLikedSongs([]);
      }
    } catch (error) {
      console.error('退出登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userPlaylists,
    likedSongs,
    loading,
    isVip,
    checkLoginStatus,
    logout,
  };

  return (
    <MusicUserContext.Provider value={value}>
      {children}
    </MusicUserContext.Provider>
  );
};

export const useMusicUser = () => {
  const context = useContext(MusicUserContext);
  if (!context) {
    throw new Error('useMusicUser must be used within a MusicUserProvider');
  }
  return context;
}; 