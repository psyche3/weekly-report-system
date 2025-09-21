<template>
  <el-container class="layout-container">
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && mobileMenuVisible" 
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>
    
    <!-- 左侧导航栏 -->
    <el-aside 
      :width="isCollapse ? '64px' : '200px'" 
      :class="[
        'sidebar',
        { 'mobile-menu': isMobile },
        { 'mobile-menu-show': isMobile && mobileMenuVisible }
      ]"
    >
      <div class="sidebar-header">
        <div v-if="!isCollapse" class="logo">
          <el-icon size="24" color="#409EFF">
            <Document />
          </el-icon>
          <span class="logo-text">周报系统</span>
        </div>
        <div v-else class="logo-collapsed">
          <el-icon size="24" color="#409EFF">
            <Document />
          </el-icon>
        </div>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="sidebar-menu"
        @select="closeMobileMenu"
      >
        <el-menu-item index="/" route="/">
          <el-icon><House /></el-icon>
          <template #title>首页仪表盘</template>
        </el-menu-item>
        
        <el-menu-item index="/report-form" route="/report-form">
          <el-icon><Edit /></el-icon>
          <template #title>填报周报</template>
        </el-menu-item>
        
        <el-menu-item index="/report-list" route="/report-list">
          <el-icon><List /></el-icon>
          <template #title>历史周报</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            type="text"
            @click="toggleCollapse"
            class="collapse-btn"
          >
            <el-icon size="20">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </el-button>
          
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta?.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <!-- 用户切换选择器 -->
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
          
          <!-- 数据备份按钮 -->
          <el-button type="warning" @click="showBackupDialog" :icon="Download">
            数据备份
          </el-button>
          
          <!-- 当前用户信息 -->
          <div v-if="currentUser" class="current-user-info">
            <el-avatar :size="32" :src="currentUser.avatar">
              {{ currentUser.name?.charAt(0) }}
            </el-avatar>
            <div class="user-details">
              <div class="user-name">{{ currentUser.name }}</div>
              <div class="user-department">{{ currentUser.department }}</div>
            </div>
          </div>
        </div>
      </el-header>

      <!-- 主要内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>

    <!-- 数据备份对话框 -->
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

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleBackupDialogClose">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useWeeklyReportStore } from '@/stores/weeklyReport'
import {
  Document,
  House,
  Edit,
  List,
  Fold,
  Expand,
  ArrowDown,
  User,
  Setting,
  SwitchButton,
  Download,
  CopyDocument,
  Upload,
  Delete
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const store = useWeeklyReportStore()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 移动端菜单显示状态
const mobileMenuVisible = ref(false)

// 屏幕宽度检测
const isMobile = ref(false)

// 选中的用户ID
const selectedUserId = ref<string>('')

// 备份相关状态
const backupDialogVisible = ref(false)
const activeTab = ref('backup')
const backupData = ref('')
const restoreData = ref('')
const generatingBackup = ref(false)
const importingData = ref(false)

// 当前路由
const currentRoute = computed(() => route)

// 当前用户
const currentUser = computed(() => store.currentUser)

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 检测屏幕宽度
const checkScreenWidth = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    isCollapse.value = true
    mobileMenuVisible.value = false
  }
}

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  if (isMobile.value) {
    mobileMenuVisible.value = !mobileMenuVisible.value
  } else {
    isCollapse.value = !isCollapse.value
  }
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  if (isMobile.value) {
    mobileMenuVisible.value = false
  }
}

// 处理用户切换
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

// 显示备份对话框
const showBackupDialog = () => {
  backupDialogVisible.value = true
  activeTab.value = 'backup'
  backupData.value = ''
  restoreData.value = ''
}

// 关闭备份对话框
const handleBackupDialogClose = () => {
  backupDialogVisible.value = false
  backupData.value = ''
  restoreData.value = ''
}

// 生成备份数据
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

// 复制备份数据
const copyBackupData = async () => {
  try {
    await navigator.clipboard.writeText(backupData.value)
    ElMessage.success('备份数据已复制到剪贴板！')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

// 导入数据
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

// 清空恢复数据
const clearRestoreData = () => {
  restoreData.value = ''
}

onMounted(() => {
  // 初始化Store
  store.initializeStore()
  
  // 检测屏幕宽度
  checkScreenWidth()
  
  // 监听窗口大小变化
  window.addEventListener('resize', checkScreenWidth)
  
  // 设置当前选中的用户ID
  if (store.currentUser) {
    selectedUserId.value = store.currentUser.id
  }
  
  // 如果没有当前用户且有用户数据，自动选择第一个用户
  if (!store.currentUser && store.users.length > 0) {
    selectedUserId.value = store.users[0].id
    store.setCurrentUser(store.users[0])
  }
})

onUnmounted(() => {
  // 移除窗口大小变化监听
  window.removeEventListener('resize', checkScreenWidth)
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #434a50;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.logo-text {
  white-space: nowrap;
}

.logo-collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-menu {
  border: none;
  background-color: #304156;
}

.sidebar-menu .el-menu-item {
  color: #bfcbd9;
  border-bottom: 1px solid #434a50;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #263445;
  color: #409eff;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #409eff;
  color: white;
}

.sidebar-menu .el-menu-item .el-icon {
  margin-right: 8px;
}

.main-container {
  background-color: #f0f2f5;
}

.header {
  background-color: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  padding: 8px;
  color: #606266;
}

.collapse-btn:hover {
  color: #409eff;
  background-color: #f5f7fa;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

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

/* 备份对话框样式 */
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

.backup-actions, .restore-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.backup-content, .restore-content {
  margin-bottom: 20px;
}

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

.dialog-footer {
  text-align: right;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}


.main-content {
  padding: 0;
  background-color: #f0f2f5;
  overflow-y: auto;
}

/* 移动端遮罩层 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    width: 200px !important;
  }
  
  .sidebar.mobile-menu-show {
    transform: translateX(0);
  }
  
  .main-container {
    margin-left: 0;
    width: 100%;
  }
  
  .header {
    padding: 0 16px;
  }
  
  .header-left {
    gap: 12px;
  }
  
  .header-right {
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .user-selector {
    margin-right: 8px;
  }
  
  .user-selector .el-select {
    width: 150px !important;
  }
  
  .user-details .user-department {
    display: none;
  }
  
  .current-user-info {
    padding: 4px 8px;
  }
  
  .breadcrumb {
    font-size: 12px;
  }
  
  .breadcrumb .el-breadcrumb__item {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* 移动端按钮样式调整 */
  .collapse-btn {
    padding: 6px;
  }
  
  /* 移动端菜单项样式 */
  .sidebar-menu .el-menu-item {
    padding: 0 20px;
    height: 50px;
    line-height: 50px;
  }
  
  .sidebar-menu .el-menu-item .el-icon {
    margin-right: 12px;
    font-size: 18px;
  }
  
  /* 移动端logo样式 */
  .logo {
    font-size: 16px;
  }
  
  .logo-text {
    font-size: 16px;
  }
}

/* 小屏幕优化 */
@media (max-width: 480px) {
  .header {
    padding: 0 12px;
    flex-wrap: wrap;
    min-height: 60px;
  }
  
  .header-left {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .user-selector .el-select {
    width: 120px !important;
  }
  
  .current-user-info {
    padding: 2px 6px;
  }
  
  .current-user-info .el-avatar {
    width: 24px !important;
    height: 24px !important;
  }
  
  .user-details .user-name {
    font-size: 12px;
  }
  
  .breadcrumb {
    font-size: 11px;
  }
  
  .breadcrumb .el-breadcrumb__item {
    max-width: 80px;
  }
}

/* 滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: #304156;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #434a50;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #5a6169;
}

.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: #f0f2f5;
}

.main-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>