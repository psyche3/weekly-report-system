# 用户切换功能实现

## 功能概述

在页面顶部导航栏添加了一个El-Select下拉选择框，用于模拟切换当前用户。数据源来自Store中的users数组。当切换用户时，清空当前Pinia State，并从localStorage中加载以`weekly-report-data-${userId}`为key的数据。

## 核心功能

### 1. 用户选择下拉框
- 位置：页面顶部导航栏右侧
- 数据源：Store中的users数组
- 样式：200px宽度，支持清空
- 显示：用户头像、姓名、部门

### 2. 数据隔离机制
- 每个用户的数据独立存储
- localStorage key格式：`weekly-report-data-${userId}`
- 切换用户时自动保存当前用户数据
- 加载新用户数据时清空当前reports

## 技术实现

### 1. Pinia Store修改

#### 新增存储常量
```typescript
const STORAGE_KEY = 'weekly-report-system-data'
const USER_DATA_PREFIX = 'weekly-report-data-'
```

#### 新增用户数据加载方法
```typescript
const loadUserData = (userId: string): void => {
  try {
    const userStorageKey = `${USER_DATA_PREFIX}${userId}`
    const stored = localStorage.getItem(userStorageKey)
    if (stored) {
      const data = JSON.parse(stored) as WeeklyReportState
      reports.value = data.reports || []
      lastSyncTime.value = data.lastSyncTime || null
    } else {
      // 如果没有用户数据，清空reports
      reports.value = []
      lastSyncTime.value = null
    }
  } catch (error) {
    console.error('Failed to load user data from localStorage:', error)
    reports.value = []
    lastSyncTime.value = null
  }
}
```

#### 新增用户数据保存方法
```typescript
const saveUserData = (userId: string): void => {
  try {
    const userStorageKey = `${USER_DATA_PREFIX}${userId}`
    const data: WeeklyReportState = {
      users: users.value,
      projects: projects.value,
      reports: reports.value,
      currentUser: currentUser.value,
      isLoading: isLoading.value,
      lastSyncTime: getCurrentTimestamp()
    }
    localStorage.setItem(userStorageKey, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save user data to localStorage:', error)
  }
}
```

#### 统一保存方法
```typescript
const saveData = (): void => {
  if (currentUser.value) {
    saveUserData(currentUser.value.id)
  }
  saveToLocal()
}
```

#### 更新setCurrentUser方法
```typescript
const setCurrentUser = (user: User | null): void => {
  // 保存当前用户的数据
  if (currentUser.value) {
    saveUserData(currentUser.value.id)
  }
  
  currentUser.value = user
  
  // 加载新用户的数据
  if (user) {
    loadUserData(user.id)
  } else {
    reports.value = []
    lastSyncTime.value = null
  }
  
  saveToLocal()
}
```

### 2. Layout组件更新

#### 用户选择下拉框
```vue
<div class="user-selector">
  <el-select
    v-model="selectedUserId"
    placeholder="选择用户"
    @change="handleUserChange"
    style="width: 200px"
    clearable
  >
    <el-option
      v-for="user in store.users"
      :key="user.id"
      :label="user.name"
      :value="user.id"
    >
      <div class="user-option">
        <el-avatar :size="24" :src="user.avatar">
          {{ user.name?.charAt(0) }}
        </el-avatar>
        <span class="user-option-name">{{ user.name }}</span>
        <span class="user-option-dept">{{ user.department }}</span>
      </div>
    </el-option>
  </el-select>
</div>
```

#### 当前用户信息显示
```vue
<div v-if="currentUser" class="current-user-info">
  <el-avatar :size="32" :src="currentUser.avatar">
    {{ currentUser.name?.charAt(0) }}
  </el-avatar>
  <div class="user-details">
    <div class="user-name">{{ currentUser.name }}</div>
    <div class="user-department">{{ currentUser.department }}</div>
  </div>
</div>
```

#### 用户切换处理
```typescript
const handleUserChange = (userId: string) => {
  if (userId) {
    const user = store.users.find(u => u.id === userId)
    if (user) {
      store.setCurrentUser(user)
      ElMessage.success(`已切换到用户：${user.name}`)
    }
  } else {
    store.setCurrentUser(null)
    ElMessage.info('已清除当前用户')
  }
}
```

## 数据流程

### 1. 用户切换流程
1. 用户在下拉框中选择新用户
2. 触发`handleUserChange`函数
3. 调用`store.setCurrentUser(user)`
4. 保存当前用户数据到localStorage
5. 清空当前reports数组
6. 加载新用户的数据
7. 更新当前用户状态
8. 显示切换成功提示

### 2. 数据保存流程
1. 任何数据变更操作
2. 调用`saveData()`方法
3. 如果有当前用户，调用`saveUserData(userId)`
4. 保存到`weekly-report-data-${userId}`键
5. 同时保存全局数据到`weekly-report-system-data`

### 3. 数据加载流程
1. 应用启动时调用`loadFromLocal()`
2. 加载全局数据（users、projects等）
3. 如果有当前用户，调用`loadUserData(userId)`
4. 从`weekly-report-data-${userId}`加载用户数据
5. 更新reports数组

## 样式设计

### 1. 用户选择器样式
```css
.user-selector {
  margin-right: 16px;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.user-option-name {
  font-weight: 500;
  color: #303133;
}

.user-option-dept {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}
```

### 2. 当前用户信息样式
```css
.current-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-details .user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.2;
}

.user-details .user-department {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
}
```

### 3. 响应式设计
```css
@media (max-width: 768px) {
  .user-details .user-department {
    display: none;
  }
  
  .current-user-info {
    padding: 4px 8px;
  }
}
```

## 功能特性

### 1. 数据隔离
- 每个用户的数据独立存储
- 切换用户时自动保存当前数据
- 加载用户数据时清空当前状态
- 支持多用户同时使用

### 2. 用户体验
- 直观的用户选择界面
- 显示用户头像和基本信息
- 切换时显示成功提示
- 支持清空当前用户

### 3. 数据持久化
- 自动保存用户数据
- 支持离线数据存储
- 数据恢复机制
- 错误处理

## 使用说明

### 1. 切换用户
1. 点击顶部导航栏的用户选择下拉框
2. 从列表中选择要切换的用户
3. 系统自动保存当前用户数据
4. 加载新用户的数据
5. 显示切换成功提示

### 2. 清除用户
1. 点击用户选择下拉框的清空按钮
2. 系统清除当前用户
3. 清空所有周报数据
4. 显示清除提示

### 3. 数据管理
- 每个用户的数据独立存储
- 切换用户时数据自动保存
- 重新选择用户时数据自动恢复
- 支持多用户数据隔离

## 技术依赖

### 1. 核心依赖
- Pinia Store: 状态管理
- Vue 3: 响应式框架
- Element Plus: UI组件库
- localStorage: 数据持久化

### 2. 新增方法
- `loadUserData(userId)`: 加载用户数据
- `saveUserData(userId)`: 保存用户数据
- `saveData()`: 统一保存方法
- `handleUserChange(userId)`: 用户切换处理

## 文件位置

- `src/stores/weeklyReport.ts` - Pinia Store（包含用户数据隔离逻辑）
- `src/components/Layout.vue` - 布局组件（包含用户选择器）
- `src/views/HomeView.vue` - 首页（受用户切换影响）
- `src/views/ReportFormView.vue` - 周报填报页（受用户切换影响）
- `src/views/ReportListView.vue` - 周报历史页（受用户切换影响）

## 注意事项

1. 确保Store中有用户数据才能切换
2. 切换用户时会清空当前reports数组
3. 用户数据按ID隔离存储
4. 切换用户时自动保存当前数据
5. 支持清空当前用户功能
6. 数据加载失败时有错误处理

## 扩展功能

### 1. 可添加的功能
- 用户权限管理
- 用户数据导入导出
- 用户数据同步
- 用户数据备份

### 2. 可优化的体验
- 用户切换动画
- 数据加载进度显示
- 用户数据统计
- 用户数据清理

### 3. 可增强的功能
- 用户数据版本控制
- 用户数据冲突处理
- 用户数据迁移
- 用户数据恢复
