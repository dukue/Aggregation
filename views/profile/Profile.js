import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Surface, Text, useTheme, Avatar, Divider, Portal, Dialog } from 'react-native-paper';
import { 
  History,
  Heart,
  Download,
  Settings,
  ChevronRight,
  Moon,
  Bell,
  HelpCircle,
  Share2,
  MessageSquare,
  Palette,
} from 'lucide-react-native';
import { useThemeMode } from '../../contexts/ThemeContext';

const Profile = ({ navigation }) => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme, primaryColor, changePrimaryColor } = useThemeMode();
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  // 添加主题色选项
  const themeColors = {
    '默认蓝': '#2196F3',
    '活力红': '#F44336',
    '清新绿': '#4CAF50',
    '温暖橙': '#FF9800',
    '典雅紫': '#9C27B0',
    '沉稳灰': '#607D8B',
  };

  // 渲染颜色选择器
  const renderColorPicker = () => (
    <Portal>
      <Dialog
        visible={colorPickerVisible}
        onDismiss={() => setColorPickerVisible(false)}
      >
        <Dialog.Title>选择主题色</Dialog.Title>
        <Dialog.Content>
          <View style={styles.colorGrid}>
            {Object.entries(themeColors).map(([name, color]) => (
              <TouchableOpacity
                key={name}
                onPress={() => {
                  changePrimaryColor(color);
                  setColorPickerVisible(false);
                }}
                style={[
                  styles.colorItem,
                  { backgroundColor: color },
                  primaryColor === color && styles.selectedColor,
                ]}
              >
                <View />
              </TouchableOpacity>
            ))}
          </View>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );

  const menuItems = [
    [
      { 
        icon: History, 
        title: '浏览历史',
        onPress: () => {},
        color: theme.colors.primary,
      },
      { 
        icon: Heart, 
        title: '我的收藏',
        onPress: () => {},
        color: theme.colors.error,
      },
      { 
        icon: Download, 
        title: '离线缓存',
        onPress: () => {},
        color: theme.colors.secondary,
      },
    ],
    [
      { 
        icon: Bell, 
        title: '消息通知',
        onPress: () => {},
      },
      { 
        icon: Moon, 
        title: '深色模式',
        onPress: toggleTheme,
        extra: <Text style={{ color: theme.colors.onSurfaceVariant }}>
          {isDarkMode ? '开启' : '关闭'}
        </Text>
      },
      { 
        icon: Palette, 
        title: '主题颜色',
        onPress: () => setColorPickerVisible(true),
        extra: <View style={[styles.colorPreview, { backgroundColor: primaryColor }]} />,
      },
      { 
        icon: Settings, 
        title: '设置',
        onPress: () => {},
      },
    ],
    [
      { 
        icon: MessageSquare, 
        title: '意见反馈',
        onPress: () => {},
      },
      { 
        icon: Share2, 
        title: '分享应用',
        onPress: () => {},
      },
      { 
        icon: HelpCircle, 
        title: '关于',
        onPress: () => {},
      },
    ],
  ];

  const renderMenuItem = (item, index, isLast) => (
    <React.Fragment key={item.title}>
      <TouchableOpacity onPress={item.onPress}>
        <View style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <item.icon 
              size={24} 
              color={item.color || theme.colors.onSurfaceVariant} 
            />
            <Text 
              variant="bodyLarge" 
              style={[styles.menuTitle, { color: theme.colors.onSurface }]}
            >
              {item.title}
            </Text>
          </View>
          <View style={styles.menuRight}>
            {item.extra}
            <ChevronRight size={20} color={theme.colors.onSurfaceVariant} />
          </View>
        </View>
      </TouchableOpacity>
      {!isLast && <Divider />}
    </React.Fragment>
  );

  return (
    <>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* 用户信息卡片 */}
        <Surface style={[styles.userCard, { backgroundColor: theme.colors.elevation.level1 }]}>
          <View style={styles.userInfo}>
            <Avatar.Image 
              size={80}
              source={{ uri: 'https://picsum.photos/200' }}
            />
            <View style={styles.userMeta}>
              <Text variant="headlineSmall">未登录</Text>
              <TouchableOpacity>
                <Text 
                  variant="bodyMedium" 
                  style={{ color: theme.colors.primary }}
                >
                  点击登录
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Surface>

        {/* 菜单组 */}
        {menuItems.map((group, groupIndex) => (
          <Surface 
            key={groupIndex}
            style={[
              styles.menuGroup,
              { backgroundColor: theme.colors.elevation.level1 }
            ]}
          >
            {group.map((item, index) => 
              renderMenuItem(item, index, index === group.length - 1)
            )}
          </Surface>
        ))}

        {/* 版本信息 */}
        <Text 
          variant="bodySmall" 
          style={[styles.version, { color: theme.colors.onSurfaceVariant }]}
        >
          版本 1.0.0
        </Text>
      </ScrollView>
      {renderColorPicker()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userMeta: {
    marginLeft: 16,
    flex: 1,
  },
  menuGroup: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    marginLeft: 12,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  version: {
    textAlign: 'center',
    marginVertical: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 8,
  },
  colorItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 8,
    elevation: 2,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
});

export default Profile; 