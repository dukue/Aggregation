import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Dialog, Portal, TextInput, Button, Text, useTheme, SegmentedButtons, Switch } from 'react-native-paper';

const EditSourceDialog = ({ visible, onDismiss, source, onSave }) => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState('basic');
  const [formData, setFormData] = useState({
    bookSourceUrl: '',
    bookSourceName: '',
    bookSourceGroup: '',
    searchUrl: '',
    ruleSearch: {},
    ruleExplore: {},
    ruleBookInfo: {},
    ruleToc: {},
    ruleContent: {},
  });

  useEffect(() => {
    if (source) {
      setFormData({
        bookSourceUrl: source.bookSourceUrl || '',
        bookSourceName: source.bookSourceName || '',
        bookSourceGroup: source.bookSourceGroup || '',
        searchUrl: source.searchUrl || '',
        ruleSearch: typeof source.ruleSearch === 'string' ? JSON.parse(source.ruleSearch) : source.ruleSearch || {},
        ruleExplore: typeof source.ruleExplore === 'string' ? JSON.parse(source.ruleExplore) : source.ruleExplore || {},
        ruleBookInfo: typeof source.ruleBookInfo === 'string' ? JSON.parse(source.ruleBookInfo) : source.ruleBookInfo || {},
        ruleToc: typeof source.ruleToc === 'string' ? JSON.parse(source.ruleToc) : source.ruleToc || {},
        ruleContent: typeof source.ruleContent === 'string' ? JSON.parse(source.ruleContent) : source.ruleContent || {},
      });
    }
  }, [source]);

  const updateFormData = (key, value, category = null) => {
    if (category) {
      setFormData(prev => ({
        ...prev,
        [category]: { ...prev[category], [key]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const renderBasicSection = () => (
    <View>
      <TextInput
        label="书源URL"
        value={formData.bookSourceUrl}
        onChangeText={value => updateFormData('bookSourceUrl', value)}
        style={styles.input}
      />
      <TextInput
        label="书源名称"
        value={formData.bookSourceName}
        onChangeText={value => updateFormData('bookSourceName', value)}
        style={styles.input}
      />
      <TextInput
        label="书源分组"
        value={formData.bookSourceGroup}
        onChangeText={value => updateFormData('bookSourceGroup', value)}
        style={styles.input}
      />
    </View>
  );

  const renderSearchSection = () => (
    <View>
      <TextInput
        label="搜索URL"
        value={formData.searchUrl}
        onChangeText={value => updateFormData('searchUrl', value)}
        style={styles.input}
      />
      <Text style={styles.sectionTitle}>搜索规则</Text>
      <TextInput
        label="书籍列表"
        value={formData.ruleSearch.bookList}
        onChangeText={value => updateFormData('bookList', value, 'ruleSearch')}
        style={styles.input}
      />
      <TextInput
        label="书名"
        value={formData.ruleSearch.name}
        onChangeText={value => updateFormData('name', value, 'ruleSearch')}
        style={styles.input}
      />
      <TextInput
        label="作者"
        value={formData.ruleSearch.author}
        onChangeText={value => updateFormData('author', value, 'ruleSearch')}
        style={styles.input}
      />
    </View>
  );

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <View style={styles.dialogContainer}>
          <Dialog.Title>编辑书源</Dialog.Title>
          
          <View style={styles.tabContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
            >
              <SegmentedButtons
                value={currentTab}
                onValueChange={setCurrentTab}
                buttons={[
                  { value: 'basic', label: '基本' },
                  { value: 'search', label: '搜索' },
                  { value: 'explore', label: '发现' },
                  { value: 'detail', label: '详情' },
                  { value: 'toc', label: '目录' },
                  { value: 'content', label: '正文' },
                ]}
                style={styles.segmentedButtons}
              />
            </ScrollView>
          </View>
          
          <View style={styles.contentContainer}>
            <ScrollView>
              {currentTab === 'basic' && renderBasicSection()}
              {currentTab === 'search' && renderSearchSection()}
            </ScrollView>
          </View>

          <Dialog.Actions>
            <Button onPress={onDismiss}>取消</Button>
            <Button onPress={() => onSave(formData)}>保存</Button>
          </Dialog.Actions>
        </View>
      </Dialog>
    </Portal>
  );
};

const styles = {
  dialog: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  dialogContainer: {
    height: 600,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segmentedButtons: {
    minWidth: 500,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    maxHeight: 450,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  }
};

export default EditSourceDialog; 