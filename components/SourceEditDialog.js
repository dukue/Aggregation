import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Portal, 
  Dialog, 
  TextInput, 
  Button, 
  Text,
  SegmentedButtons,
  useTheme,
  IconButton,
  Surface
} from 'react-native-paper';
import { Info, Search, Compass, Book, List, FileText } from 'lucide-react-native';

const SourceEditDialog = ({ visible, source, onDismiss, onSave }) => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState('basic');
  const [editedSource, setEditedSource] = useState(source?.source || {});

  useEffect(() => {
    if (source?.source) {
      setEditedSource(source.source);
    }
  }, [source]);

  // 定义不同分类的字段
  const tabs = [
    { value: 'basic', label: '基本', icon: Info, fields: [
      { key: 'bookSourceName', label: '书源名称' },
      { key: 'bookSourceUrl', label: '书源网址' },
      { key: 'bookSourceGroup', label: '书源分组' },
      { key: 'bookSourceComment', label: '书源注释' },
    ]},
    { value: 'discover', label: '发现', icon: Compass, fields: [
      { key: 'exploreUrl', label: '发现规则' },
      { key: 'ruleExplore.bookList', label: '书籍列表规则' },
      { key: 'ruleExplore.name', label: '书名则' },
      { key: 'ruleExplore.author', label: '作者规则' },
      { key: 'ruleExplore.kind', label: '分类规则' },
      { key: 'ruleExplore.intro', label: '简介规则' },
      { key: 'ruleExplore.coverUrl', label: '封面规则' },
      { key: 'ruleExplore.bookUrl', label: '详情页规则' },
    ]},
    { value: 'search', label: '搜索', icon: Search, fields: [
      { key: 'searchUrl', label: '搜索网址' },
      { key: 'ruleSearch.bookList', label: '书籍列表规则' },
      { key: 'ruleSearch.name', label: '书名规则' },
      { key: 'ruleSearch.author', label: '作者规则' },
      { key: 'ruleSearch.kind', label: '分类规则' },
      { key: 'ruleSearch.intro', label: '简介规则' },
      { key: 'ruleSearch.coverUrl', label: '封面规则' },
      { key: 'ruleSearch.bookUrl', label: '详情页规则' },
    ]},
    { value: 'detail', label: '详情', icon: Book, fields: [
      { key: 'ruleBookInfo.name', label: '书名规则' },
      { key: 'ruleBookInfo.author', label: '作者规则' },
      { key: 'ruleBookInfo.kind', label: '分类规则' },
      { key: 'ruleBookInfo.intro', label: '简介规则' },
      { key: 'ruleBookInfo.coverUrl', label: '封面规则' },
      { key: 'ruleBookInfo.tocUrl', label: '目录URL规则' },
      { key: 'ruleBookInfo.lastChapter', label: '最新章节规则' },
      { key: 'ruleBookInfo.wordCount', label: '字数规则' },
    ]},
    { value: 'toc', label: '目录', icon: List, fields: [
      { key: 'ruleToc.chapterList', label: '章节列表规则' },
      { key: 'ruleToc.chapterName', label: '章节名规则' },
      { key: 'ruleToc.chapterUrl', label: '章节URL规则' },
      { key: 'ruleToc.nextTocUrl', label: '下一页规则' },
    ]},
    { value: 'content', label: '正文', icon: FileText, fields: [
      { key: 'ruleContent.content', label: '正文规则' },
      { key: 'ruleContent.nextContentUrl', label: '下一页规则' },
      { key: 'ruleContent.replaceRegex', label: '替换规则' },
    ]},
  ];

  // 处理字段值的更新
  const handleFieldChange = (key, value) => {
    setEditedSource(prev => {
      const newSource = { ...prev };
      // 处理嵌套字段，如 ruleSearch.bookList
      const keys = key.split('.');
      let current = newSource;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSource;
    });
  };

  // 获取嵌套字段的值
  const getFieldValue = (key) => {
    const keys = key.split('.');
    let value = editedSource;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || '';
  };

  // 保存时包装回原始结构
  const handleSave = () => {
    onSave({
      ...source,
      source: editedSource
    });
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>编辑书源</Dialog.Title>
        <Dialog.Content>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tabScroll}
          >
            <SegmentedButtons
              value={currentTab}
              onValueChange={setCurrentTab}
              buttons={tabs.map(tab => ({
                value: tab.value,
                label: tab.label,
                icon: ({ size, color }) => <tab.icon size={size} color={color} />
              }))}
              style={styles.tabButtons}
            />
          </ScrollView>
          
          <ScrollView style={styles.fieldsContainer}>
            {tabs.find(tab => tab.value === currentTab)?.fields.map((field) => (
              <Surface 
                key={field.key} 
                style={[styles.fieldCard, { backgroundColor: theme.colors.elevation.level1 }]}
              >
                <Text variant="labelLarge" style={styles.fieldLabel}>
                  {field.label}
                </Text>
                <TextInput
                  value={getFieldValue(field.key)}
                  onChangeText={(value) => handleFieldChange(field.key, value)}
                  mode="outlined"
                  multiline={field.key.includes('rule')}
                  numberOfLines={field.key.includes('rule') ? 3 : 1}
                  style={styles.input}
                />
              </Surface>
            ))}
          </ScrollView>
        </Dialog.Content>
        
        <Dialog.Actions>
          <Button onPress={onDismiss}>取消</Button>
          <Button onPress={handleSave}>保存</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
    width: '90%',
    alignSelf: 'center',
  },
  tabScroll: {
    marginBottom: 16,
  },
  tabButtons: {
    flexGrow: 0,
  },
  fieldsContainer: {
    maxHeight: 400,
  },
  fieldCard: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  fieldLabel: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
});

export default SourceEditDialog; 