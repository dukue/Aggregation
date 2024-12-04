import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { musicApi } from '../../services/musicApi';
import { useMusicUser } from '../../contexts/MusicUserContext';

const QR_CHECK_INTERVAL = 3000; // 3秒检查一次

const MusicLogin = ({ navigation }) => {
  const theme = useTheme();
  const { checkLoginStatus } = useMusicUser();
  const [qrKey, setQrKey] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [status, setStatus] = useState('waiting'); // waiting, scanning, expired

  const getQRCode = async () => {
    const key = await musicApi.getQRKey();
    if (key) {
      setQrKey(key);
      const img = await musicApi.getQRImage(key);
      if (img) {
        setQrImage(img);
        setStatus('waiting');
      }
    }
  };

  const checkQRStatus = useCallback(async () => {
    if (!qrKey) return;

    const result = await musicApi.checkQRStatus(qrKey);
    if (result) {
      switch (result.code) {
        case 800:
          setStatus('expired');
          break;
        case 801:
          setStatus('waiting');
          break;
        case 802:
          setStatus('scanning');
          break;
        case 803:
          // 登录成功，等待状态更新
          setStatus('success');
          const success = await checkLoginStatus();
          if (success) {
            navigation.goBack();
          } else {
            setStatus('error');
          }
          break;
      }
    }
  }, [qrKey, navigation, checkLoginStatus]);

  useEffect(() => {
    getQRCode();
  }, []);

  useEffect(() => {
    if (status === 'expired') {
      getQRCode();
      return;
    }

    const timer = setInterval(checkQRStatus, QR_CHECK_INTERVAL);
    return () => clearInterval(timer);
  }, [status, checkQRStatus]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>
        扫码登录网易云音乐
      </Text>
      <View style={styles.qrContainer}>
        {qrImage ? (
          <Image source={{ uri: qrImage }} style={styles.qrImage} />
        ) : (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        )}
      </View>
      <Text variant="bodyLarge" style={[styles.status, { color: theme.colors.primary }]}>
        {status === 'waiting' && '请使用网易云音乐APP扫码登录'}
        {status === 'scanning' && '扫描成功，请在手机上确认'}
        {status === 'expired' && '二维码已过期，正在刷新...'}
        {status === 'success' && '登录成功，正在跳转...'}
        {status === 'error' && '登录失败，请重试'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 40,
  },
  qrContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  status: {
    marginTop: 20,
    textAlign: 'center',
  },
});

export default MusicLogin; 