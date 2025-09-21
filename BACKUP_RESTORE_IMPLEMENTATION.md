# 数据备份与恢复功能实现

## 功能概述

实现了完整的数据备份与恢复功能，将整个Store的状态以JSON字符串的形式导出到文本框中，并允许用户复制。同时提供数据恢复功能，用户可以将JSON字符串粘贴到文本框中，点击按钮即可将数据解析并覆盖当前Store的状态，并保存到localStorage。

## 核心功能

### 1. 数据备份功能
- 导出整个Store的状态为JSON格式
- 使用Element Plus的el-input type="textarea"显示
- 支持一键复制到剪贴板
- 包含导出时间戳和版本信息

### 2. 数据恢复功能
- 提供文本框供用户粘贴JSON数据
- 数据格式验证和错误处理
- 确认对话框防止误操作
- 自动保存到localStorage

### 3. 用户界面
- 标签页设计：数据备份和数据恢复
- 响应式布局，支持大屏幕显示
- 清晰的操作提示和状态反馈
- 专业的代码字体显示

## 技术实现

### 1. 界面设计

#### 备份按钮
```vue
<el-button type="warning" @click="showBackupDialog" :icon="Download">
  数据备份
</el-button>
```

#### 备份对话框
```vue
<el-dialog
  v-model="backupDialogVisible"
  title="数据备份与恢复"
  width="80%"
  :before-close="handleBackupDialogClose"
>
  <el-tabs v-model="activeTab" type="border-card">
    <!-- 数据备份标签页 -->
    <el-tab-pane label="数据备份" name="backup">
      <div class="backup-section">
        <h4>导出数据</h4>
        <p class="backup-description">
          点击"生成备份"按钮将当前所有数据导出为JSON格式，您可以复制此数据用于备份或迁移。
        </p>
        <div class="backup-actions">
          <el-button type="primary" @click="generateBackup" :loading="generatingBackup">
            <el-icon><Download /></el-icon>
            生成备份
          </el-button>
          <el-button @click="copyBackupData" :disabled="!backupData">
            <el-icon><CopyDocument /></el-icon>
            复制数据
          </el-button>
        </div>
        <div class="backup-content">
          <el-input
            v-model="backupData"
            type="textarea"
            :rows="15"
            placeholder="点击'生成备份'按钮生成数据..."
            readonly
            class="backup-textarea"
          />
        </div>
      </div>
    </el-tab-pane>

    <!-- 数据恢复标签页 -->
    <el-tab-pane label="数据恢复" name="restore">
      <div class="restore-section">
        <h4>导入数据</h4>
        <p class="restore-description">
          将备份的JSON数据粘贴到下方文本框中，点击"导入数据"按钮即可恢复数据。
          <strong style="color: #f56c6c;">注意：此操作将覆盖当前所有数据！</strong>
        </p>
        <div class="restore-content">
          <el-input
            v-model="restoreData"
            type="textarea"
            :rows="15"
            placeholder="请粘贴备份的JSON数据..."
            class="restore-textarea"
          />
        </div>
        <div class="restore-actions">
          <el-button type="danger" @click="importData" :loading="importingData" :disabled="!restoreData.trim()">
            <el-icon><Upload /></el-icon>
            导入数据
          </el-button>
          <el-button @click="clearRestoreData">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</el-dialog>
```

### 2. 状态管理

#### 状态变量
```typescript
// 备份相关状态
const backupDialogVisible = ref(false)
const activeTab = ref('backup')
const backupData = ref('')
const restoreData = ref('')
const generatingBackup = ref(false)
const importingData = ref(false)
```

### 3. 核心功能实现

#### 生成备份数据
```typescript
const generateBackup = async () => {
  try {
    generatingBackup.value = true
    
    // 获取当前Store的完整状态
    const storeState = {
      users: store.users,
      projects: store.projects,
      reports: store.reports,
      currentUser: store.currentUser,
      lastSyncTime: store.lastSyncTime,
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    }
    
    // 格式化为JSON字符串
    backupData.value = JSON.stringify(storeState, null, 2)
    
    ElMessage.success('备份数据生成成功！')
  } catch (error) {
    console.error('生成备份失败:', error)
    ElMessage.error('生成备份失败，请重试')
  } finally {
    generatingBackup.value = false
  }
}
```

#### 复制备份数据
```typescript
const copyBackupData = async () => {
  try {
    await navigator.clipboard.writeText(backupData.value)
    ElMessage.success('备份数据已复制到剪贴板！')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}
```

#### 导入数据
```typescript
const importData = async () => {
  try {
    if (!restoreData.value.trim()) {
      ElMessage.warning('请先输入要导入的数据')
      return
    }

    // 确认导入操作
    await ElMessageBox.confirm(
      '此操作将覆盖当前所有数据，是否继续？',
      '确认导入',
      {
        confirmButtonText: '确定导入',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    importingData.value = true

    // 解析JSON数据
    const importedData = JSON.parse(restoreData.value)
    
    // 验证数据格式
    if (!importedData.users || !importedData.projects || !importedData.reports) {
      throw new Error('数据格式不正确')
    }

    // 更新Store状态
    store.users = importedData.users || []
    store.projects = importedData.projects || []
    store.reports = importedData.reports || []
    store.currentUser = importedData.currentUser || null
    store.lastSyncTime = importedData.lastSyncTime || null

    // 保存到localStorage
    store.saveToLocal()
    
    // 如果有当前用户，也保存用户数据
    if (store.currentUser) {
      store.saveUserData(store.currentUser.id)
    }

    ElMessage.success('数据导入成功！')
    handleBackupDialogClose()
    
  } catch (error) {
    console.error('导入数据失败:', error)
    if (error instanceof SyntaxError) {
      ElMessage.error('JSON格式错误，请检查数据格式')
    } else {
      ElMessage.error('导入数据失败：' + error.message)
    }
  } finally {
    importingData.value = false
  }
}
```

## 数据格式

### 1. 备份数据格式
```json
{
  "users": [...],
  "projects": [...],
  "reports": [...],
  "currentUser": {...},
  "lastSyncTime": "2024-01-15T10:30:00.000Z",
  "exportTime": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. 数据验证
- 检查必需字段：users、projects、reports
- JSON格式验证
- 数据类型验证
- 错误处理和用户提示

## 样式设计

### 1. 对话框样式
```css
.backup-section, .restore-section {
  padding: 20px 0;
}

.backup-section h4, .restore-section h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.backup-description, .restore-description {
  margin: 0 0 20px 0;
  color: #606266;
  line-height: 1.6;
}
```

### 2. 文本框样式
```css
.backup-textarea, .restore-textarea {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.backup-textarea :deep(.el-textarea__inner) {
  background-color: #f8f9fa;
  border: 1px solid #e4e7ed;
  resize: vertical;
}

.restore-textarea :deep(.el-textarea__inner) {
  border: 1px solid #e4e7ed;
  resize: vertical;
}
```

### 3. 按钮样式
```css
.backup-actions, .restore-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
```

## 功能特性

### 1. 数据备份
- **完整导出**：包含所有Store状态
- **格式化显示**：JSON格式，易于阅读
- **一键复制**：支持剪贴板操作
- **版本信息**：包含导出时间和版本号

### 2. 数据恢复
- **格式验证**：检查JSON格式和必需字段
- **安全确认**：防止误操作覆盖数据
- **错误处理**：详细的错误提示
- **自动保存**：恢复后自动保存到localStorage

### 3. 用户体验
- **标签页设计**：清晰的功能分离
- **加载状态**：操作过程中的状态反馈
- **响应式布局**：适配不同屏幕尺寸
- **专业显示**：代码字体显示JSON数据

## 使用流程

### 1. 数据备份流程
1. 点击导航栏的"数据备份"按钮
2. 在"数据备份"标签页点击"生成备份"
3. 等待备份数据生成完成
4. 点击"复制数据"按钮复制到剪贴板
5. 将数据保存到安全位置

### 2. 数据恢复流程
1. 点击导航栏的"数据备份"按钮
2. 切换到"数据恢复"标签页
3. 将备份的JSON数据粘贴到文本框中
4. 点击"导入数据"按钮
5. 确认覆盖当前数据
6. 等待数据恢复完成

## 安全特性

### 1. 数据验证
- JSON格式验证
- 必需字段检查
- 数据类型验证
- 错误信息提示

### 2. 操作确认
- 导入前确认对话框
- 警告提示覆盖风险
- 取消操作支持
- 详细错误信息

### 3. 错误处理
- 网络剪贴板API错误处理
- JSON解析错误处理
- 数据格式错误处理
- 用户友好的错误提示

## 技术依赖

### 1. 核心依赖
- Vue 3: 响应式框架
- Element Plus: UI组件库
- Pinia Store: 状态管理
- localStorage: 数据持久化

### 2. 浏览器API
- Clipboard API: 剪贴板操作
- JSON API: 数据序列化
- Promise API: 异步操作

## 文件位置

- `src/components/Layout.vue` - 布局组件（包含备份功能）
- `src/stores/weeklyReport.ts` - 数据管理Store
- 其他页面组件（受数据恢复影响）

## 注意事项

1. 备份数据包含敏感信息，请妥善保管
2. 导入数据会覆盖当前所有数据，请谨慎操作
3. 建议定期备份重要数据
4. 恢复数据前请确认数据来源的可靠性
5. 大文件复制可能需要时间，请耐心等待

## 扩展功能

### 1. 可添加的功能
- 数据压缩和加密
- 自动备份定时器
- 备份历史记录
- 数据差异比较

### 2. 可优化的体验
- 拖拽文件导入
- 备份进度显示
- 数据预览功能
- 批量操作支持

### 3. 可增强的安全性
- 数据加密存储
- 访问权限控制
- 操作日志记录
- 数据完整性校验
