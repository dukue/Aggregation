import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { 
  Text, 
  useTheme, 
  Surface, 
  IconButton, 
  Portal, 
  Dialog, 
  TextInput,
  Button,
  Snackbar,
  Chip,
  Menu,
  Divider,
  FAB,
  SegmentedButtons,
  Switch,
  ActivityIndicator,
  TouchableRipple,
} from 'react-native-paper';
import { sourceManager } from '../../services/sourceManager';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { 
  Library,
  QrCode,
  Download,
  RefreshCw,
  Search,
  ChevronDown,
  CheckCircle,
  Circle,
  Square,
  CheckSquare,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Plus,
  FileInput,
  FileOutput,
  Package,
  PackageOpen,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditSourceDialog from '../../components/EditSourceDialog';
import { database } from '../../services/database';

const SourceManager = ({ navigation }) => {
  const theme = useTheme();
  const [sources, setSources] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [sourceText, setSourceText] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [jsonInput, setJsonInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [importType, setImportType] = useState('text'); // 'text' 或 'url'
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [currentEditSource, setCurrentEditSource] = useState(null);
  const [groupMenuVisible, setGroupMenuVisible] = useState(false);
  const groupButtonRef = useRef(null);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [menuWidth, setMenuWidth] = useState(0);
  const [selectedSources, setSelectedSources] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [currentSource, setCurrentSource] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await database.init();
        await sourceManager.initPromise;
        await loadSources();
      } catch (error) {
        console.error('初始化失败:', error);
        showSnackbar('初始化失败');
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // 提取所有分组
    const allGroups = new Set();
    sources.forEach(source => {
      if (source.source.bookSourceGroup) {
        source.source.bookSourceGroup.split(',').forEach(group => {
          allGroups.add(group.trim());
        });
      }
    });
    setGroups(Array.from(allGroups));
  }, [sources]);

  const loadSources = async () => {
    try {
      await sourceManager.initPromise; // 等待初始化完成
      const allSources = sourceManager.getAllSources();
      setSources(allSources);
    } catch (error) {
      console.error('加载书源失败:', error);
      showSnackbar('加载书源失败');
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleImportFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.json],
      });
      
      const content = await RNFS.readFile(result[0].uri);
      const sourceData = JSON.parse(content);
      
      if (Array.isArray(sourceData)) {
        for (const source of sourceData) {
          await sourceManager.addSource(source);
        }
      } else {
        await sourceManager.addSource(sourceData);
      }
      
      await loadSources();
      showSnackbar('书源导入成功');
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('导入失败:', error);
        showSnackbar('书源导入失败');
      }
    }
  };

  const handleAddSource = async () => {
    try {
      const sourceData = JSON.parse(sourceText);
      await sourceManager.addSource(sourceData);
      await loadSources();
      setDialogVisible(false);
      setSourceText('');
      showSnackbar('书源添加成功');
    } catch (error) {
      console.error('添加失败:', error);
      showSnackbar('书源格式错误');
    }
  };

  const handleDeleteSource = async (source) => {
    try {
      await sourceManager.deleteSource(source.source.bookSourceUrl);
      await loadSources();
      showSnackbar('书源删除成功');
      setDeleteDialogVisible(false);
      setSourceToDelete(null);
    } catch (error) {
      console.error('除失败:', error);
      showSnackbar('书源删除失败');
    }
  };

  const handleToggleSource = async (source) => {
    try {
      const updatedSource = {
        ...source.source,
        enabled: !source.source.enabled
      };
      await sourceManager.updateSource(updatedSource);
      await loadSources();
    } catch (error) {
      console.error('切换状态失败:', error);
      showSnackbar('操作失败');
    }
  };

  const filteredSources = sources.filter(source => {
    if (filterValue !== 'all' && source.source.bookSourceGroup) {
      if (!source.source.bookSourceGroup.includes(filterValue)) {
        return false;
      }
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        source.source.bookSourceName.toLowerCase().includes(query) ||
        source.source.bookSourceUrl.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const handleImport = async () => {
    if (isImporting) return; // 防止重复点击
    
    setIsImporting(true);
    setImportProgress('正在获取书源数据...');
    
    try {
      let sourcesToImport;
      
      if (importType === 'text') {
        sourcesToImport = JSON.parse(jsonInput);
      } else {
        setImportProgress('正在网络获取书源...');
        const response = await fetch(urlInput);
        if (!response.ok) {
          throw new Error('获取书源失败');
        }
        sourcesToImport = await response.json();
      }

      // 验证和处理书源数据
      if (!Array.isArray(sourcesToImport)) {
        sourcesToImport = [sourcesToImport];
      }

      setImportProgress('正在验证书格式...');
      // 格式化书源数据
      const validSources = sourcesToImport
        .filter(source => 
          source.bookSourceUrl && 
          source.bookSourceName &&
          source.ruleSearch
        )
        .map(source => ({
          source: {
            ...source,
            enabled: true,
            bookSourceGroup: source.bookSourceGroup || '',
          }
        }));

      if (validSources.length === 0) {
        throw new Error('未找到有效的书源');
      }

      // 添加到现有书源
      setImportProgress(`正在导入 ${validSources.length} 个书源...`);
      await Promise.all(validSources.map(source => 
        sourceManager.addSource(source.source)
      ));
      
      await loadSources();
      
      setSnackbarMessage(`成功导入 ${validSources.length} 个书源`);
      setSnackbarVisible(true);
      setDialogVisible(false);
      setJsonInput('');
      setUrlInput('');

    } catch (error) {
      console.error('导入失败:', error);
      setSnackbarMessage(error.message || '导入失败,请检查格式是否正确');
      setSnackbarVisible(true);
    } finally {
      setIsImporting(false);
      setImportProgress('');
    }
  };

  const handleEditSource = (source) => {
    console.log('Editing source in SourceManager - Full source object:', JSON.stringify(source, null, 2));
    setCurrentEditSource(source);
    setEditDialogVisible(true);
  };

  const handleSaveSource = async (sourceData) => {
    try {
      if (currentEditSource) {
        // 构造更新的书源对象
        const updatedSource = {
          id: currentEditSource.source.id,
          bookSourceName: sourceData.bookSourceName,
          bookSourceUrl: sourceData.bookSourceUrl,
          bookSourceGroup: sourceData.bookSourceGroup,
          bookSourceType: currentEditSource.source.bookSourceType || 0,
          enabled: sourceData.enabled !== false ? 1 : 0,
          enabledExplore: currentEditSource.source.enabledExplore !== false ? 1 : 0,
          customOrder: currentEditSource.source.customOrder || 0,
          weight: currentEditSource.source.weight || 0,
          header: sourceData.header,
          loginUrl: sourceData.loginUrl,
          searchUrl: sourceData.searchUrl,
          ruleSearch: JSON.stringify({
            url: sourceData.searchUrl,
            list: sourceData.searchList,
            name: sourceData.searchName,
            author: sourceData.searchAuthor,
            kind: sourceData.searchKind,
            lastChapter: sourceData.searchLastChapter,
            introduce: sourceData.searchIntroduce,
            coverUrl: sourceData.searchCoverUrl,
            noteUrl: sourceData.searchNoteUrl,
          }),
          // 构造书籍信息规则对象
          ruleBookInfo: JSON.stringify({
            name: sourceData.ruleBookName,
            author: sourceData.ruleBookAuthor,
            kind: sourceData.ruleBookKind,
            lastChapter: sourceData.ruleBookLastChapter,
            introduce: sourceData.ruleBookIntroduce,
            coverUrl: sourceData.ruleBookCoverUrl,
          }),
          // 构造目录规则对象
          ruleToc: JSON.stringify({
            chapterList: sourceData.ruleChapterList,
            chapterName: sourceData.ruleChapterName,
            chapterUrl: sourceData.ruleChapterUrl,
            contentUrl: sourceData.ruleContentUrl,
          }),
          // 构造正文规则对象
          ruleContent: JSON.stringify({
            content: sourceData.ruleBookContent,
          }),
        };

        await sourceManager.updateSource(updatedSource);
      } else {
        // 添加新书源时使用相同的数据结构
        const newSource = {
          bookSourceName: sourceData.bookSourceName,
          bookSourceUrl: sourceData.bookSourceUrl,
          bookSourceGroup: sourceData.bookSourceGroup,
          enabled: true,
          header: sourceData.header,
          loginUrl: sourceData.loginUrl,
          searchUrl: sourceData.searchUrl,
          ruleSearch: {
            url: sourceData.searchUrl,
            list: sourceData.searchList,
            name: sourceData.searchName,
            author: sourceData.searchAuthor,
            kind: sourceData.searchKind,
            lastChapter: sourceData.searchLastChapter,
            introduce: sourceData.searchIntroduce,
            coverUrl: sourceData.searchCoverUrl,
            noteUrl: sourceData.searchNoteUrl,
          },
          ruleBookInfo: {
            name: sourceData.ruleBookName,
            author: sourceData.ruleBookAuthor,
            kind: sourceData.ruleBookKind,
            lastChapter: sourceData.ruleBookLastChapter,
            introduce: sourceData.ruleBookIntroduce,
            coverUrl: sourceData.ruleBookCoverUrl,
          },
          ruleToc: {
            chapterList: sourceData.ruleChapterList,
            chapterName: sourceData.ruleChapterName,
            chapterUrl: sourceData.ruleChapterUrl,
            contentUrl: sourceData.ruleContentUrl,
          },
          ruleContent: {
            content: sourceData.ruleBookContent,
          },
          lastUpdateTime: new Date().getTime(),
        };

        await sourceManager.addSource(newSource);
      }
      
      await loadSources();
      setEditDialogVisible(false);
      setCurrentEditSource(null);
      showSnackbar('保存成功');
    } catch (error) {
      console.error('保存书源失败:', error);
      showSnackbar('保存失败: ' + error.message);
    }
  };

  const showGroupMenu = () => {
    if (groupButtonRef.current) {
      groupButtonRef.current.measureInWindow((x, y, width, height) => {
        setMenuAnchor({
          x: x,
          y: y + height + 4,
        });
        setMenuWidth(width);
        setGroupMenuVisible(true);
      });
    }
  };

  const toggleSelection = (sourceUrl) => {
    const newSelected = new Set(selectedSources);
    if (newSelected.has(sourceUrl)) {
      newSelected.delete(sourceUrl);
    } else {
      newSelected.add(sourceUrl);
    }
    setSelectedSources(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSources.size === filteredSources.length) {
      setSelectedSources(new Set());
    } else {
      setSelectedSources(new Set(filteredSources.map(s => s.source.bookSourceUrl)));
    }
    setIsSelectionMode(true);
  };

  const handleBatchDelete = async () => {
    try {
      const count = selectedSources.size;  // 先保存数量，因为删除后集合会被清空
      await Promise.all(
        Array.from(selectedSources).map(url => sourceManager.deleteSource(url))
      );
      await loadSources();
      setSelectedSources(new Set());
      setIsSelectionMode(false);
      showSnackbar(`成功删除 ${count} 个书`);  // 用保存的数量
    } catch (error) {
      console.error('批量删除失败:', error);
      showSnackbar('删除失败');
    }
  };

  const handleExportSources = async () => {
    try {
      if (sources.length === 0) {
        showSnackbar('没有可导出的书源');
        return;
      }

      // 准备导出数据
      const sourcesToExport = sources.map(source => source.source);
      const sourcesData = JSON.stringify(sourcesToExport, null, 2);
      
      // 导到文件
      const path = `${RNFS.ExternalDirectoryPath}/book_sources.json`;
      await RNFS.writeFile(path, sourcesData, 'utf8');
      
      showSnackbar(`书源已导出到: ${path}`);
    } catch (error) {
      console.error('导出失败:', error);
      showSnackbar('源导出失败');
    }
  };

  const handleDeleteAll = async () => {
    try {
      if (sources.length === 0) {
        showSnackbar('没有可删除的书源');
        return;
      }

      // 清空所有书源
      await sourceManager.clearSources();
      setSources([]);
      showSnackbar('已清空所有书源');
    } catch (error) {
      console.error('清空失败:', error);
      showSnackbar('清空书源失败');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          placeholder="搜索书源"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          right={<TextInput.Icon icon={({ size, color }) => <Search size={size} color={color} />} />}
        />
        <View style={styles.headerActions}>
          <View 
            ref={groupButtonRef} 
            collapsable={false}
            style={styles.groupButtonContainer}
          >
            <Button
              mode="text"
              onPress={showGroupMenu}
              style={styles.groupButton}
            >
              <Text style={{ color: theme.colors.primary }}>
                {filterValue === 'all' ? '全部' : filterValue}
              </Text>
              <ChevronDown size={16} color={theme.colors.primary} style={{ marginLeft: 4 }} />
            </Button>
          </View>

          <IconButton
            icon={({ size, color }) => 
              selectedSources.size === filteredSources.length ? 
                <CheckCircle size={size} color={color} /> : 
                <Circle size={size} color={color} />
            }
            onPress={handleSelectAll}
          />
        </View>
      </View>

      {isSelectionMode && selectedSources.size > 0 && (
        <Surface style={styles.selectionToolbar} elevation={1}>
          <Text>{`已选择 ${selectedSources.size} 项`}</Text>
          <View style={styles.toolbarActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setSelectedSources(new Set());
                setIsSelectionMode(false);
              }}
            >
              取消选择
            </Button>
            <Button
              mode="contained"
              buttonColor={theme.colors.error}
              textColor={theme.colors.onError}
              onPress={handleBatchDelete}
            >
              删除选中
            </Button>
          </View>
        </Surface>
      )}

      <ScrollView style={styles.sourceList}>
        {filteredSources.map((source, index) => (
          <React.Fragment key={source.source.bookSourceUrl}>
            <Surface style={[styles.sourceItem, { backgroundColor: theme.colors.elevation.level1 }]}>
              <TouchableRipple
                onPress={() => {
                  if (isSelectionMode) {
                    toggleSelection(source.source.bookSourceUrl);
                  } else {
                    handleEditSource(source);
                  }
                }}
                onLongPress={() => {
                  setIsSelectionMode(true);
                  toggleSelection(source.source.bookSourceUrl);
                }}
                style={styles.sourceMain}
              >
                <View style={styles.sourceContent}>
                  {isSelectionMode ? (
                    <IconButton
                      icon={({ size, color }) => 
                        selectedSources.has(source.source.bookSourceUrl) ? 
                          <CheckSquare size={size} color={color} /> : 
                          <Square size={size} color={color} />
                      }
                      onPress={() => toggleSelection(source.source.bookSourceUrl)}
                    />
                  ) : (
                    <IconButton
                      icon={({ size, color }) => 
                        source.source.enabled ? 
                          <ToggleRight size={size} color={theme.colors.primary} /> : 
                          <ToggleLeft size={size} color={color} />
                      }
                      onPress={() => handleToggleSource(source)}
                    />
                  )}
                  <View style={styles.sourceInfo}>
                    <Text variant="titleMedium">{source.source.bookSourceName}</Text>
                    <Text 
                      variant="bodySmall" 
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      {source.source.bookSourceUrl}
                    </Text>
                    {source.source.bookSourceGroup && (
                      <View style={styles.groupContainer}>
                        {source.source.bookSourceGroup.split(',').map((group, i) => (
                          <Chip 
                            key={i}
                            compact
                            mode="flat"
                            style={styles.groupChip}
                          >
                            {group.trim()}
                          </Chip>
                        ))}
                      </View>
                    )}
                  </View>
                  {!isSelectionMode && (
                    <IconButton
                      icon={({ size, color }) => <Trash2 size={size} color={color} />}
                      onPress={() => {
                        setSourceToDelete(source);
                        setDeleteDialogVisible(true);
                      }}
                    />
                  )}
                </View>
              </TouchableRipple>
            </Surface>
            {index < filteredSources.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </ScrollView>

      <FAB.Group
        open={fabOpen}
        visible
        icon={({ size, color }) => 
          fabOpen ? 
            <PackageOpen size={size} color={color} /> : 
            <Package size={size} color={color} />
        }
        actions={[
          {
            icon: ({ size, color }) => <Plus size={size} color={color} />,
            label: '新建书源',
            onPress: () => {
              setSelectedSource(null);
              setSourceText('');
              setDialogVisible(true);
            },
          },
          {
            icon: ({ size, color }) => <FileInput size={size} color={color} />,
            label: '导入书源',
            onPress: handleImportFile,
          },
          {
            icon: ({ size, color }) => <FileOutput size={size} color={color} />,
            label: '导出书源',
            onPress: handleExportSources,
          },
          {
            icon: ({ size, color }) => <RefreshCw size={size} color={color} />,
            label: '刷新列表',
            onPress: loadSources,
          },
          {
            icon: ({ size, color }) => <Trash2 size={size} color={color} />,
            label: '清空书源',
            onPress: handleDeleteAll,
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
        onPress={() => {
          if (fabOpen) {
            setFabOpen(false);
          }
        }}
        style={styles.fab}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => !isImporting && setDialogVisible(false)}>
          <Dialog.Title>添加书源</Dialog.Title>
          <Dialog.Content>
            <SegmentedButtons
              value={importType}
              onValueChange={setImportType}
              buttons={[
                { value: 'text', label: 'JSON文本' },
                { value: 'url', label: 'JSON链接' }
              ]}
              style={styles.segmentedButtons}
              disabled={isImporting}
            />
            
            {importType === 'text' ? (
              <TextInput
                mode="outlined"
                label="JSON文本"
                value={jsonInput}
                onChangeText={setJsonInput}
                multiline
                numberOfLines={4}
                style={styles.textInput}
                disabled={isImporting}
              />
            ) : (
              <TextInput
                mode="outlined"
                label="JSON接"
                value={urlInput}
                onChangeText={setUrlInput}
                placeholder="http://example.com/source.json"
                style={styles.textInput}
                disabled={isImporting}
              />
            )}

            {isImporting && (
              <View style={styles.importingContainer}>
                <ActivityIndicator animating={true} />
                <Text style={styles.importingText}>{importProgress}</Text>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setDialogVisible(false)}
              disabled={isImporting}
            >
              取消
            </Button>
            <Button 
              onPress={handleImport}
              loading={isImporting}
              disabled={isImporting}
            >
              导入
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>删书源</Dialog.Title>
          <Dialog.Content>
            <Text>确定要删除书源 "{sourceToDelete?.source.bookSourceName}" 吗？</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>取消</Button>
            <Button 
              onPress={() => handleDeleteSource(sourceToDelete)}
              textColor={theme.colors.error}
            >
              删除
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <EditSourceDialog
        visible={editDialogVisible}
        source={currentEditSource}
        onDismiss={() => {
          setEditDialogVisible(false);
          setCurrentEditSource(null);
        }}
        onSave={handleSaveSource}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  groupMenu: {
    maxWidth: '80%',
    minWidth: 120,
  },
  sourceList: {
    flex: 1,
  },
  sourceItem: {
    padding: 12,
  },
  sourceMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  groupChip: {
    marginRight: 4,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  textInput: {
    marginTop: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  importingContainer: {
    marginTop: 16,
    alignItems: 'center',
    gap: 8,
  },
  importingText: {
    textAlign: 'center',
    marginTop: 8,
  },
  sourceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  editDialog: {
    maxHeight: '80%',
    marginVertical: 24,
    marginHorizontal: 16,
  },
  scrollArea: {
    paddingHorizontal: 0,
  },
  editHeader: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  editInput: {
    backgroundColor: 'transparent',
    maxHeight: 400,
  },
  editInputContent: {
    paddingTop: 8,
    paddingBottom: 8,
    minHeight: 200,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
    }),
    fontSize: 14,
  },
  groupButtonContainer: {
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  groupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    minWidth: 80,
    height: 40,
    justifyContent: 'center',
  },
  selectionToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default SourceManager; 