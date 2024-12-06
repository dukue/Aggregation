import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Portal, 
  Dialog, 
  TextInput, 
  Button, 
  Text,
  HelperText,
  Switch,
  Divider,
  useTheme,
  IconButton
} from 'react-native-paper';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

const EditSourceDialog = ({ visible, source, onDismiss, onSave }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    bookSourceName: '',
    bookSourceUrl: '',
    bookSourceGroup: '',
    enabled: true,
    header: '',
    loginUrl: '',
    // 搜索规则
    searchUrl: '',
    searchList: '',
    searchName: '',
    searchAuthor: '',
    searchKind: '',
    searchLastChapter: '',
    searchIntroduce: '',
    searchCoverUrl: '',
    searchNoteUrl: '',
    // 详情规则
    ruleBookName: '',
    ruleBookAuthor: '',
    ruleBookKind: '',
    ruleBookLastChapter: '',
    ruleBookIntroduce: '',
    ruleBookCoverUrl: '',
    // 目录规则
    ruleChapterList: '',
    ruleChapterName: '',
    ruleChapterUrl: '',
    ruleContentUrl: '',
    // 正文规则
    ruleBookContent: '',
  });
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    search: false,
    detail: false,
    chapter: false,
    content: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('Source received in EditSourceDialog - Full source object:', JSON.stringify(source, null, 2));
    if (source && source.source) {
      // 检查规则对象是否存在
      const ruleSearch = source.source.ruleSearch || {};
      const ruleBookInfo = source.source.ruleBookInfo || {};
      const ruleToc = source.source.ruleToc || {};
      const ruleContent = source.source.ruleContent || {};

      console.log('Parsed rules:', {
        ruleSearch,
        ruleBookInfo,
        ruleToc,
        ruleContent
      });

      const newFormData = {
        bookSourceName: source.source.bookSourceName || '',
        bookSourceUrl: source.source.bookSourceUrl || '',
        bookSourceGroup: source.source.bookSourceGroup || '',
        enabled: source.source.enabled !== false,
        header: source.source.header || '',
        loginUrl: source.source.loginUrl || '',
        // 搜索规则
        searchUrl: source.source.searchUrl || ruleSearch.url || '',
        searchList: ruleSearch.list || '',
        searchName: ruleSearch.name || '',
        searchAuthor: ruleSearch.author || '',
        searchKind: ruleSearch.kind || '',
        searchLastChapter: ruleSearch.lastChapter || '',
        searchIntroduce: ruleSearch.introduce || '',
        searchCoverUrl: ruleSearch.coverUrl || '',
        searchNoteUrl: ruleSearch.noteUrl || '',
        // 详情规则
        ruleBookName: ruleBookInfo.name || '',
        ruleBookAuthor: ruleBookInfo.author || '',
        ruleBookKind: ruleBookInfo.kind || '',
        ruleBookLastChapter: ruleBookInfo.lastChapter || '',
        ruleBookIntroduce: ruleBookInfo.introduce || '',
        ruleBookCoverUrl: ruleBookInfo.coverUrl || '',
        // 目录规则
        ruleChapterList: ruleToc.chapterList || '',
        ruleChapterName: ruleToc.chapterName || '',
        ruleChapterUrl: ruleToc.chapterUrl || '',
        ruleContentUrl: ruleToc.contentUrl || '',
        // 正文规则
        ruleBookContent: ruleContent.content || '',
      };

      console.log('Setting new form data:', newFormData);
      setFormData(newFormData);
    } else {
      console.log('Resetting form data to defaults');
      setFormData({
        bookSourceName: '',
        bookSourceUrl: '',
        bookSourceGroup: '',
        enabled: true,
        header: '',
        loginUrl: '',
        searchUrl: '',
        searchList: '',
        searchName: '',
        searchAuthor: '',
        searchKind: '',
        searchLastChapter: '',
        searchIntroduce: '',
        searchCoverUrl: '',
        searchNoteUrl: '',
        ruleBookName: '',
        ruleBookAuthor: '',
        ruleBookKind: '',
        ruleBookLastChapter: '',
        ruleBookIntroduce: '',
        ruleBookCoverUrl: '',
        ruleChapterList: '',
        ruleChapterName: '',
        ruleChapterUrl: '',
        ruleContentUrl: '',
        ruleBookContent: '',
      });
    }
  }, [source]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bookSourceName) {
      newErrors.bookSourceName = '书源名称不能为空';
    }
    if (!formData.bookSourceUrl) {
      newErrors.bookSourceUrl = '书源URL不能为空';
    }
    if (!formData.searchUrl) {
      newErrors.searchUrl = '搜索URL不能为空';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const renderSection = (title, sectionKey, fields) => {
    const isExpanded = expandedSections[sectionKey];
    console.log(`Rendering section ${sectionKey}:`, { 
      isExpanded, 
      formData: fields.map(f => ({ key: f.key, value: formData[f.key] }))
    });
    
    return (
      <View style={styles.section}>
        <Button
          mode="text"
          onPress={() => setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
          }))}
          contentStyle={styles.sectionHeader}
          icon={({ size, color }) => 
            isExpanded ? 
              <ChevronUp size={size} color={color} /> : 
              <ChevronDown size={size} color={color} />
          }
        >
          {title}
        </Button>
        {isExpanded && (
          <View style={styles.sectionContent}>
            {fields.map(({ key, label, helper }) => {
              console.log(`Rendering field ${key}:`, formData[key]);
              return (
                <View key={key} style={styles.inputContainer}>
                  <TextInput
                    mode="outlined"
                    label={label}
                    value={String(formData[key] || '')}
                    onChangeText={(text) => {
                      console.log(`Updating ${key}:`, text);
                      setFormData(prev => ({ ...prev, [key]: text }));
                    }}
                    error={errors[key]}
                    style={styles.input}
                  />
                  {helper && (
                    <HelperText type="info" style={styles.helperText}>
                      {helper}
                    </HelperText>
                  )}
                  {errors[key] && (
                    <HelperText type="error">
                      {errors[key]}
                    </HelperText>
                  )}
                </View>
              );
            })}
          </View>
        )}
        <Divider />
      </View>
    );
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>编辑书源</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView>
            {renderSection('基本信息', 'basic', [
              { key: 'bookSourceName', label: '书源名称', helper: '书源的显示名称' },
              { key: 'bookSourceUrl', label: '书源URL', helper: '书源网站的根地址' },
              { key: 'bookSourceGroup', label: '书源分组', helper: '使用逗号分隔多个分组' },
              { key: 'header', label: '请求头', helper: 'JSON格式的请求头信息' },
              { key: 'loginUrl', label: '登录地址', helper: '需要登录的书源填写' },
            ])}
            
            {renderSection('搜索规则', 'search', [
              { key: 'searchUrl', label: '搜索URL', helper: '搜索关键词使用{{key}}替换' },
              { key: 'searchList', label: '搜索列表规则' },
              { key: 'searchName', label: '书名规则' },
              { key: 'searchAuthor', label: '作者规则' },
              { key: 'searchKind', label: '分类规则' },
              { key: 'searchLastChapter', label: '最新章节规则' },
              { key: 'searchIntroduce', label: '简介规则' },
              { key: 'searchCoverUrl', label: '封面规则' },
              { key: 'searchNoteUrl', label: '详情页URL规则' },
            ])}

            {renderSection('详情规则', 'detail', [
              { key: 'ruleBookName', label: '书名规则' },
              { key: 'ruleBookAuthor', label: '作者规则' },
              { key: 'ruleBookKind', label: '分类规则' },
              { key: 'ruleBookLastChapter', label: '最新章节规' },
              { key: 'ruleBookIntroduce', label: '简介规则' },
              { key: 'ruleBookCoverUrl', label: '封面规则' },
            ])}

            {renderSection('目录规则', 'chapter', [
              { key: 'ruleChapterList', label: '目录列表规则' },
              { key: 'ruleChapterName', label: '章节名规则' },
              { key: 'ruleChapterUrl', label: '章节URL规则' },
              { key: 'ruleContentUrl', label: '正文URL规则' },
            ])}

            {renderSection('正文规则', 'content', [
              { key: 'ruleBookContent', label: '正文规则' },
            ])}
          </ScrollView>
        </Dialog.ScrollArea>
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
  },
  scrollArea: {
    paddingHorizontal: 0,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    justifyContent: 'flex-start',
  },
  sectionContent: {
    paddingHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 4,
  },
  helperText: {
    marginTop: -4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});

export default EditSourceDialog; 