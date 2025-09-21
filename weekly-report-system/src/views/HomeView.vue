<template>
  <div class="home-view">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <div class="welcome-content">
            <h1>欢迎使用周报系统</h1>
            <p>管理您的周报，跟踪工作进度</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="40" color="#409EFF">
                <User />
              </el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ userStats.totalUsers }}</h3>
              <p>总用户数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="40" color="#67C23A">
                <Document />
              </el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ reportStats.totalReports }}</h3>
              <p>总周报数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="40" color="#E6A23C">
                <Briefcase />
              </el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ projectStats.totalProjects }}</h3>
              <p>总项目数</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近周报</span>
              <el-button type="primary" size="small" @click="$router.push('/report-list')">
                查看全部
              </el-button>
            </div>
          </template>
          <div v-if="recentReports.length === 0" class="empty-state">
            <el-empty description="暂无周报数据" />
          </div>
          <div v-else>
            <div v-for="report in recentReports" :key="report.id" class="report-item">
              <div class="report-info">
                <h4>{{ report.year }}年第{{ report.week }}周</h4>
                <p>{{ report.summary }}</p>
                <el-tag :type="report.status === 'submitted' ? 'success' : 'warning'">
                  {{ report.status === 'submitted' ? '已提交' : '草稿' }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>活跃项目</span>
              <el-button type="primary" size="small">
                管理项目
              </el-button>
            </div>
          </template>
          <div v-if="activeProjects.length === 0" class="empty-state">
            <el-empty description="暂无活跃项目" />
          </div>
          <div v-else>
            <div v-for="project in activeProjects" :key="project.id" class="project-item">
              <div class="project-info">
                <h4>{{ project.name }}</h4>
                <p>{{ project.description || '暂无描述' }}</p>
                <el-tag type="success">进行中</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快速操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" size="large" @click="$router.push('/report-form')">
              <el-icon><Edit /></el-icon>
              填报周报
            </el-button>
            <el-button type="success" size="large" @click="$router.push('/report-list')">
              <el-icon><List /></el-icon>
              查看历史
            </el-button>
            <el-button type="info" size="large">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useWeeklyReportStore } from '@/stores/weeklyReport'
import { User, Document, Briefcase, Edit, List, Setting } from '@element-plus/icons-vue'

const store = useWeeklyReportStore()

// 统计数据
const userStats = computed(() => ({
  totalUsers: store.users.length
}))

const reportStats = computed(() => ({
  totalReports: store.reports.length
}))

const projectStats = computed(() => ({
  totalProjects: store.projects.length
}))

// 最近周报（最多显示5条）
const recentReports = computed(() => {
  return store.reports
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

// 活跃项目
const activeProjects = computed(() => {
  return store.getActiveProjects.slice(0, 5)
})

onMounted(() => {
  // 初始化Store数据
  store.initializeStore()
})
</script>

<style scoped>
.home-view {
  padding: 20px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.welcome-content {
  text-align: center;
  padding: 20px;
}

.welcome-content h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: 300;
}

.welcome-content p {
  margin: 0;
  font-size: 1.2rem;
  opacity: 0.9;
}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  margin-right: 20px;
}

.stat-info h3 {
  margin: 0 0 5px 0;
  font-size: 2rem;
  font-weight: bold;
  color: #303133;
}

.stat-info p {
  margin: 0;
  color: #909399;
  font-size: 0.9rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 20px;
}

.report-item, .project-item {
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.report-item:last-child, .project-item:last-child {
  border-bottom: none;
}

.report-info h4, .project-info h4 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #303133;
}

.report-info p, .project-info p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 0.9rem;
  line-height: 1.4;
}

.quick-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.quick-actions .el-button {
  min-width: 150px;
}
</style>
