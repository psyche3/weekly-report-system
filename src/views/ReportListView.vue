<template>
  <div class="report-list-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>历史周报</span>
          <div class="header-actions">
            <el-button type="success" @click="exportToExcel" :loading="exporting">
              <el-icon><Download /></el-icon>
              导出Excel
            </el-button>
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

      <!-- 周报表格 -->
      <div class="table-section">
        <el-table
          :data="paginatedReports"
          stripe
          border
          style="width: 100%"
          empty-text="暂无周报数据"
          @row-click="viewReport"
        >
          <el-table-column
            prop="weekInfo"
            label="周数"
            width="150"
            align="center"
          >
            <template #default="{ row }">
              <span class="week-info">{{ row.year }}年第{{ String(row.week).padStart(2, '0') }}周</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="status"
            label="状态"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                :type="row.status === 'submitted' ? 'success' : ''"
                :color="row.status === 'draft' ? '#909399' : ''"
                size="small"
              >
                {{ row.status === 'submitted' ? '已提交' : '草稿' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="summary"
            label="周报总结"
            min-width="300"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <div class="summary-content">
                {{ row.summary || '暂无总结' }}
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="totalHours"
            label="总工时数"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <span class="total-hours">{{ getTotalWorkHours(row) }} 小时</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="workItemsCount"
            label="工时项数"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.workItems.length }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="createdAt"
            label="创建时间"
            width="180"
            align="center"
          >
            <template #default="{ row }">
              <span class="create-time">{{ formatDate(row.createdAt) }}</span>
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            width="120"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click.stop="viewReport(row)"
              >
                <el-icon><View /></el-icon>
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div v-if="filteredReports.length > pageSize" class="pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="filteredReports.length"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 周报详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="`${selectedReport?.year}年第${String(selectedReport?.week || 0).padStart(2, '0')}周 - 周报详情`"
      width="80%"
      :before-close="handleDialogClose"
    >
      <div v-if="selectedReport" class="report-detail">
        <!-- 基本信息 -->
        <div class="detail-header">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <label>周数：</label>
                <span class="detail-value">{{ selectedReport.year }}年第{{ String(selectedReport.week).padStart(2, '0') }}周</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <label>状态：</label>
                <el-tag
                  :type="selectedReport.status === 'submitted' ? 'success' : ''"
                  :color="selectedReport.status === 'draft' ? '#909399' : ''"
                  size="small"
                >
                  {{ selectedReport.status === 'submitted' ? '已提交' : '草稿' }}
                </el-tag>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <label>总工时：</label>
                <span class="detail-value total-hours">{{ getTotalWorkHours(selectedReport) }} 小时</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 周报总结 -->
        <div class="detail-section">
          <h4>周报总结</h4>
          <div class="summary-content">
            {{ selectedReport.summary || '暂无总结' }}
          </div>
        </div>

        <!-- 工时明细表格 -->
        <div class="detail-section">
          <h4>工时明细</h4>
          <el-table
            :data="selectedReport.workItems"
            border
            stripe
            style="width: 100%"
            empty-text="暂无工时记录"
          >
            <el-table-column
              label="序号"
              width="80"
              align="center"
            >
              <template #default="{ $index }">
                {{ $index + 1 }}
              </template>
            </el-table-column>

            <el-table-column
              prop="projectName"
              label="项目名称"
              width="200"
              align="center"
            >
              <template #default="{ row }">
                <span class="project-name">{{ getProjectName(row.projectId) }}</span>
              </template>
            </el-table-column>

            <el-table-column
              prop="taskDescription"
              label="任务描述"
              min-width="300"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span class="task-description">{{ row.taskDescription }}</span>
              </template>
            </el-table-column>

            <el-table-column
              prop="workHours"
              label="工时"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <span class="work-hours">{{ row.workHours }} 小时</span>
              </template>
            </el-table-column>

            <el-table-column
              prop="workDate"
              label="工作日期"
              width="150"
              align="center"
            >
              <template #default="{ row }">
                <span class="work-date">{{ row.workDate }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 创建信息 -->
        <div class="detail-footer">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <label>创建时间：</label>
                <span class="detail-value">{{ formatDate(selectedReport.createdAt) }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <label>更新时间：</label>
                <span class="detail-value">{{ formatDate(selectedReport.updatedAt) }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">关闭</el-button>
          <el-button type="primary" @click="editReport">编辑周报</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useWeeklyReportStore } from '@/stores/weeklyReport'
import { Plus, Search, View, Download } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'

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

// 对话框相关
const dialogVisible = ref(false)
const selectedReport = ref<any>(null)

// 导出相关
const exporting = ref(false)

// 可用年份
const availableYears = computed(() => {
  const years = new Set(store.reports.map(report => report.year))
  return Array.from(years).sort((a: number, b: number) => b - a)
})

// 过滤后的周报
const filteredReports = computed(() => {
  // 只显示当前用户的周报
  let reports = store.reports.filter(report => 
    store.currentUser && report.userId === store.currentUser.id
  )

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
  return report.workItems.reduce((total: number, item: any) => {
    const hours = Number(item.workHours) || 0
    return total + hours
  }, 0)
}

// 格式化日期
const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

// 查看周报详情
const viewReport = (report: any) => {
  selectedReport.value = report
  dialogVisible.value = true
}

// 编辑周报
const editReport = () => {
  if (selectedReport.value) {
    dialogVisible.value = false
    router.push({
      path: '/report-form',
      query: { reportId: selectedReport.value.id }
    })
  }
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
  selectedReport.value = null
}

// 导出Excel
const exportToExcel = async () => {
  try {
    exporting.value = true
    
    // 获取当前用户的周报数据
    const userReports = store.reports.filter(report => 
      store.currentUser && report.userId === store.currentUser.id
    )
    
    if (userReports.length === 0) {
      ElMessage.warning('暂无周报数据可导出')
      return
    }
    
    // 准备Excel数据
    const excelData = userReports.map((report, index) => {
      // 计算总工时
      const totalHours = report.workItems.reduce((sum: number, item: any) => {
        return sum + (Number(item.workHours) || 0)
      }, 0)
      
      // 获取项目名称
      const getProjectName = (projectId: string) => {
        const project = store.projects.find(p => p.id === projectId)
        return project ? project.name : '未知项目'
      }
      
      // 格式化工时明细
      const workItemsDetail = report.workItems.map((item: any, itemIndex: number) => {
        return `${itemIndex + 1}. ${getProjectName(item.projectId)} - ${item.taskDescription} (${item.workHours}小时)`
      }).join('\n')
      
      return {
        '序号': index + 1,
        '周数': `${report.year}年第${String(report.week).padStart(2, '0')}周`,
        '状态': report.status === 'submitted' ? '已提交' : '草稿',
        '周报总结': report.summary || '暂无总结',
        '总工时': totalHours,
        '工时项数': report.workItems.length,
        '工时明细': workItemsDetail,
        '创建时间': dayjs(report.createdAt).format('YYYY-MM-DD HH:mm'),
        '更新时间': dayjs(report.updatedAt).format('YYYY-MM-DD HH:mm')
      }
    })
    
    // 创建工作簿
    const wb = XLSX.utils.book_new()
    
    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(excelData)
    
    // 设置列宽
    const colWidths = [
      { wch: 8 },   // 序号
      { wch: 15 },  // 周数
      { wch: 10 },  // 状态
      { wch: 30 },  // 周报总结
      { wch: 10 },  // 总工时
      { wch: 10 },  // 工时项数
      { wch: 50 },  // 工时明细
      { wch: 20 },  // 创建时间
      { wch: 20 }   // 更新时间
    ]
    ws['!cols'] = colWidths
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '周报数据')
    
    // 生成文件名
    const currentDate = dayjs().format('YYYY-MM-DD')
    const fileName = `周报导出_${currentDate}.xlsx`
    
    // 导出文件
    XLSX.writeFile(wb, fileName)
    
    ElMessage.success(`Excel文件已导出：${fileName}`)
    
  } catch (error) {
    console.error('导出Excel失败:', error)
    ElMessage.error('导出Excel失败，请重试')
  } finally {
    exporting.value = false
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

.table-section {
  margin-bottom: 20px;
}

.week-info {
  font-weight: 500;
  color: #303133;
}

.summary-content {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.total-hours {
  color: #67c23a;
  font-weight: 500;
}

.create-time {
  color: #909399;
  font-size: 0.9rem;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

/* 表格行点击效果 */
:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

/* 对话框样式 */
.report-detail {
  padding: 0;
}

.detail-header {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.detail-item label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
  min-width: 80px;
}

.detail-value {
  color: #303133;
  font-weight: 500;
}

.detail-value.total-hours {
  color: #67c23a;
  font-size: 16px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e4e7ed;
  font-size: 16px;
}

.summary-content {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  line-height: 1.6;
  color: #606266;
  min-height: 60px;
}

.detail-footer {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
}

.project-name {
  color: #409eff;
  font-weight: 500;
}

.task-description {
  color: #606266;
}

.work-hours {
  color: #67c23a;
  font-weight: 500;
}

.work-date {
  color: #909399;
}

.dialog-footer {
  text-align: right;
}

/* 对话框标题样式 */
:deep(.el-dialog__header) {
  background-color: #f8f9fa;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  background-color: #fafafa;
}
</style>