<template>
  <div class="report-list-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>历史周报</span>
          <div class="header-actions">
            <el-button type="primary" @click="$router.push('/report-form')">
              <el-icon><Plus /></el-icon>
              新建周报
            </el-button>
          </div>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select
              v-model="filters.year"
              placeholder="选择年份"
              @change="handleFilterChange"
            >
              <el-option
                v-for="year in availableYears"
                :key="year"
                :label="`${year}年`"
                :value="year"
              />
            </el-select>
          </el-col>
          
          <el-col :span="6">
            <el-select
              v-model="filters.status"
              placeholder="选择状态"
              @change="handleFilterChange"
            >
              <el-option label="全部" value="" />
              <el-option label="已提交" value="submitted" />
              <el-option label="草稿" value="draft" />
            </el-select>
          </el-col>
          
          <el-col :span="6">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索周报内容..."
              @input="handleFilterChange"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          
          <el-col :span="6">
            <el-button @click="resetFilters">重置筛选</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 周报列表 -->
      <div class="report-list">
        <div v-if="filteredReports.length === 0" class="empty-state">
          <el-empty description="暂无周报数据" />
        </div>
        
        <div v-else>
          <div
            v-for="report in paginatedReports"
            :key="report.id"
            class="report-item"
            @click="viewReport(report)"
          >
            <div class="report-header">
              <div class="report-title">
                <h3>{{ report.year }}年第{{ report.week }}周</h3>
                <el-tag
                  :type="report.status === 'submitted' ? 'success' : 'warning'"
                  size="small"
                >
                  {{ report.status === 'submitted' ? '已提交' : '草稿' }}
                </el-tag>
              </div>
              <div class="report-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click.stop="editReport(report)"
                >
                  <el-icon><Edit /></el-icon>
                  {{ report.status === 'draft' ? '继续编辑' : '查看详情' }}
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click.stop="deleteReport(report)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
            
            <div class="report-content">
              <p class="report-summary">{{ report.summary }}</p>
              
              <div class="report-meta">
                <div class="work-items-count">
                  <el-icon><List /></el-icon>
                  {{ report.workItems.length }} 个工时项
                </div>
                <div class="total-hours">
                  <el-icon><Clock /></el-icon>
                  总工时: {{ getTotalWorkHours(report) }} 小时
                </div>
                <div class="report-date">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(report.createdAt) }}
                </div>
              </div>
              
              <div v-if="report.workItems.length > 0" class="work-items-preview">
                <div
                  v-for="item in report.workItems.slice(0, 3)"
                  :key="item.id"
                  class="work-item-preview"
                >
                  <span class="project-name">{{ getProjectName(item.projectId) }}</span>
                  <span class="task-desc">{{ item.taskDescription }}</span>
                  <span class="work-hours">{{ item.workHours }}h</span>
                </div>
                <div v-if="report.workItems.length > 3" class="more-items">
                  还有 {{ report.workItems.length - 3 }} 个工时项...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="filteredReports.length > pageSize" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredReports.length"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useWeeklyReportStore } from '@/stores/weeklyReport'
import { Plus, Search, Edit, Delete, List, Clock, Calendar } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()
const store = useWeeklyReportStore()

// 筛选条件
const filters = reactive({
  year: new Date().getFullYear(),
  status: '',
  keyword: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 可用年份
const availableYears = computed(() => {
  const years = new Set(store.reports.map(report => report.year))
  return Array.from(years).sort((a, b) => b - a)
})

// 过滤后的周报
const filteredReports = computed(() => {
  let reports = store.reports

  // 按年份筛选
  if (filters.year) {
    reports = reports.filter(report => report.year === filters.year)
  }

  // 按状态筛选
  if (filters.status) {
    reports = reports.filter(report => report.status === filters.status)
  }

  // 按关键词筛选
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    reports = reports.filter(report =>
      report.summary.toLowerCase().includes(keyword) ||
      report.workItems.some(item =>
        item.taskDescription.toLowerCase().includes(keyword)
      )
    )
  }

  // 按创建时间倒序排列
  return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// 分页后的周报
const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredReports.value.slice(start, end)
})

// 获取项目名称
const getProjectName = (projectId: string) => {
  const project = store.projects.find(p => p.id === projectId)
  return project ? project.name : '未知项目'
}

// 获取总工时
const getTotalWorkHours = (report: any) => {
  return report.workItems.reduce((total: number, item: any) => total + item.workHours, 0)
}

// 格式化日期
const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

// 查看周报详情
const viewReport = (report: any) => {
  // 可以打开详情弹窗或跳转到详情页
  console.log('查看周报:', report)
}

// 编辑周报
const editReport = (report: any) => {
  router.push({
    path: '/report-form',
    query: { id: report.id }
  })
}

// 删除周报
const deleteReport = async (report: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除${report.year}年第${report.week}周的周报吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const success = store.deleteReport(report.id)
    if (success) {
      ElMessage.success('周报删除成功')
    } else {
      ElMessage.error('周报删除失败')
    }
  } catch {
    // 用户取消删除
  }
}

// 筛选条件变化
const handleFilterChange = () => {
  currentPage.value = 1
}

// 重置筛选
const resetFilters = () => {
  filters.year = new Date().getFullYear()
  filters.status = ''
  filters.keyword = ''
  currentPage.value = 1
}

// 页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
}

onMounted(() => {
  store.initializeStore()
})
</script>

<style scoped>
.report-list-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.empty-state {
  text-align: center;
  padding: 40px;
}

.report-list {
  space-y: 16px;
}

.report-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.report-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.report-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-title h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #303133;
}

.report-actions {
  display: flex;
  gap: 8px;
}

.report-content {
  color: #606266;
}

.report-summary {
  margin: 0 0 12px 0;
  line-height: 1.6;
  color: #303133;
}

.report-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  color: #909399;
}

.report-meta > div {
  display: flex;
  align-items: center;
  gap: 4px;
}

.work-items-preview {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.work-item-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  font-size: 0.9rem;
}

.project-name {
  font-weight: 500;
  color: #409eff;
  min-width: 80px;
}

.task-desc {
  flex: 1;
  color: #606266;
}

.work-hours {
  color: #67c23a;
  font-weight: 500;
  min-width: 40px;
  text-align: right;
}

.more-items {
  color: #909399;
  font-size: 0.8rem;
  text-align: center;
  padding: 8px 0;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
