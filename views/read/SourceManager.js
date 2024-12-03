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
  RefreshCcw,
  Search,
  ChevronDown,
  CheckCircle,
  Circle,
  MoreVertical,
  Square,
  CheckSquare,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Plus,
  PenLine,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [editingSource, setEditingSource] = useState(null);
  const [groupMenuVisible, setGroupMenuVisible] = useState(false);
  const groupButtonRef = useRef(null);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [menuWidth, setMenuWidth] = useState(0);
  const [selectedSources, setSelectedSources] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    loadSources();
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
      console.error('删除失败:', error);
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
        setImportProgress('正在从网络获取书源...');
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

      setImportProgress('正在验证书源格式...');
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

  const handleEditSource = async () => {
    try {
      const sourceData = JSON.parse(sourceText);
      if (!sourceData.bookSourceUrl || !sourceData.bookSourceName) {
        throw new Error('书源格式不正确');
      }
      
      await sourceManager.updateSource(sourceData);
      await loadSources();
      setEditDialogVisible(false);
      setEditingSource(null);
      setSourceText('');
      showSnackbar('书源更新成功');
    } catch (error) {
      console.error('更新失败:', error);
      showSnackbar('书源格式错误');
    }
  };

  const openEditDialog = (source) => {
    setEditingSource(source);
    setSourceText(JSON.stringify(source.source, null, 2));
    setEditDialogVisible(true);
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
      showSnackbar(`成功删除 ${count} 个书源`);  // 使用保存的数量
    } catch (error) {
      console.error('批量删除失败:', error);
      showSnackbar('删除失败');
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

          <IconButton
            icon={({ size, color }) => <MoreVertical size={size} color={color} />}
            onPress={() => setMenuVisible(true)}
          />
        </View>

        <Menu
          visible={groupMenuVisible}
          onDismiss={() => setGroupMenuVisible(false)}
          anchor={menuAnchor}
          contentStyle={[
            styles.groupMenu,
            { minWidth: menuWidth },
          ]}
        >
          <Menu.Item
            title="全部"
            onPress={() => {
              setFilterValue('all');
              setGroupMenuVisible(false);
            }}
            leadingIcon={filterValue === 'all' ? "check" : undefined}
          />
          <Divider />
          {groups.map((group) => (
            <Menu.Item
              key={group}
              title={group}
              onPress={() => {
                setFilterValue(group);
                setGroupMenuVisible(false);
              }}
              leadingIcon={filterValue === group ? "check" : undefined}
            />
          ))}
        </Menu>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={<View />}
        >
          <Menu.Item 
            leadingIcon={({ size, color }) => <Library size={size} color={color} />}
            onPress={handleImportFile} 
            title="导入文件"
          />
          <Menu.Item 
            leadingIcon={({ size, color }) => <QrCode size={size} color={color} />}
            onPress={() => {}} 
            title="扫描二维码"
          />
          <Menu.Item 
            leadingIcon={({ size, color }) => <Download size={size} color={color} />}
            onPress={() => {}} 
            title="导出书源"
          />
          <Menu.Item 
            leadingIcon={({ size, color }) => <RefreshCcw size={size} color={color} />}
            onPress={() => loadSources()} 
            title="刷新"
          />
        </Menu>
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
                    openEditDialog(source);
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

      <FAB
        icon={({ size, color }) => <Plus size={size} color={color} />}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          setSelectedSource(null);
          setSourceText('');
          setDialogVisible(true);
        }}
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
                label="JSON链接"
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
          <Dialog.Title>删��书源</Dialog.Title>
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

      <Portal>
        <Dialog 
          visible={editDialogVisible} 
          onDismiss={() => setEditDialogVisible(false)}
          style={styles.editDialog}
        >
          <Dialog.Title>编辑书源</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <View style={styles.editHeader}>
              <Text variant="bodyMedium">书源名称：{editingSource?.source.bookSourceName}</Text>
              <Text 
                variant="bodySmall" 
                style={{ color: theme.colors.onSurfaceVariant }}
                numberOfLines={1}
              >
                {editingSource?.source.bookSourceUrl}
              </Text>
            </View>
            <TextInput
              mode="outlined"
              multiline
              value={sourceText}
              onChangeText={setSourceText}
              style={styles.editInput}
              contentStyle={styles.editInputContent}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>取消</Button>
            <Button onPress={handleEditSource}>保存</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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