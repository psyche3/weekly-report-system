<template>
  <div class="work-items-table">
    <el-table
      :data="workItems"
      border
      stripe
      style="width: 100%"
      :show-header="true"
      empty-text="暂无工时记录"
    >
      <el-table-column label="序号" width="80" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>

      <el-table-column label="项目" width="200" align="center">
        <template #default="{ row, $index }">
          <el-form-item
            :prop="`workItems.${$index}.projectId`"
            :rules="projectRules"
            style="margin: 0"
          >
            <el-select
              v-model="row.projectId"
              placeholder="选择项目"
              style="width: 100%"
              @change="handleProjectChange(row, $index)"
            >
              <el-option
                v-for="project in projects"
                :key="project.id"
                :label="project.name"
                :value="project.id"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>

      <el-table-column label="任务描述" min-width="300">
        <template #default="{ row, $index }">
          <el-form-item
            :prop="`workItems.${$index}.taskDescription`"
            :rules="taskDescriptionRules"
            style="margin: 0"
          >
            <el-input
              v-model="row.taskDescription"
              placeholder="请输入任务描述..."
              maxlength="200"
              show-word-limit
              @input="handleTaskDescriptionChange(row, $index)"
            />
          </el-form-item>
        </template>
      </el-table-column>

      <el-table-column label="工时数" width="120" align="center">
        <template #default="{ row, $index }">
          <el-form-item
            :prop="`workItems.${$index}.workHours`"
            :rules="workHoursRules"
            style="margin: 0"
          >
            <el-input-number
              v-model="row.workHours"
              :min="0.5"
              :max="24"
              :step="0.5"
              :precision="1"
              placeholder="工时"
              style="width: 100%"
              @change="handleWorkHoursChange(row, $index)"
            />
          </el-form-item>
        </template>
      </el-table-column>

      <el-table-column label="工作日期" width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item
            :prop="`workItems.${$index}.workDate`"
            :rules="workDateRules"
            style="margin: 0"
          >
            <el-date-picker
              v-model="row.workDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleWorkDateChange(row, $index)"
            />
          </el-form-item>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100" align="center">
        <template #default="{ $index }">
          <el-button
            type="danger"
            size="small"
            :icon="Delete"
            @click="removeWorkItem($index)"
            :disabled="workItems.length <= 1"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表格底部操作栏 -->
    <div class="table-footer">
      <el-button
        type="primary"
        :icon="Plus"
        @click="addWorkItem"
        class="add-button"
      >
        新增一行
      </el-button>
      
      <div class="summary-info">
        <span class="total-items">共 {{ workItems.length }} 条记录</span>
        <span class="total-hours">总工时: {{ totalWorkHours }} 小时</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

// 定义接口
interface WorkItem {
  projectId: string
  taskDescription: string
  workHours: number
  workDate: string
}

interface Project {
  id: string
  name: string
  status: string
}

// Props
interface Props {
  workItems: WorkItem[]
  projects: Project[]
}

// Emits
interface Emits {
  (e: 'update:workItems', value: WorkItem[]): void
  (e: 'change', value: WorkItem[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单验证规则
const projectRules = [
  { required: true, message: '请选择项目', trigger: 'change' }
]

const taskDescriptionRules = [
  { required: true, message: '请输入任务描述', trigger: 'blur' },
  { min: 5, message: '任务描述至少5个字符', trigger: 'blur' }
]

const workHoursRules = [
  { required: true, message: '请输入工时', trigger: 'blur' },
  { type: 'number', min: 0.5, max: 24, message: '工时范围0.5-24小时', trigger: 'blur' }
]

const workDateRules = [
  { required: true, message: '请选择工作日期', trigger: 'change' }
]

// 计算总工时
const totalWorkHours = computed(() => {
  return props.workItems.reduce((total, item) => total + (item.workHours || 0), 0)
})

// 添加工时项
const addWorkItem = () => {
  const newWorkItem: WorkItem = {
    projectId: '',
    taskDescription: '',
    workHours: 8,
    workDate: dayjs().format('YYYY-MM-DD')
  }
  
  const updatedWorkItems = [...props.workItems, newWorkItem]
  emit('update:workItems', updatedWorkItems)
  emit('change', updatedWorkItems)
  
  ElMessage.success('已添加新的工时记录')
}

// 删除工时项
const removeWorkItem = (index: number) => {
  if (props.workItems.length <= 1) {
    ElMessage.warning('至少需要保留一条工时记录')
    return
  }
  
  const updatedWorkItems = props.workItems.filter((_, i) => i !== index)
  emit('update:workItems', updatedWorkItems)
  emit('change', updatedWorkItems)
  
  ElMessage.success('已删除工时记录')
}

// 处理项目变化
const handleProjectChange = (row: WorkItem, index: number) => {
  const updatedWorkItems = [...props.workItems]
  updatedWorkItems[index] = { ...row }
  emit('update:workItems', updatedWorkItems)
  emit('change', updatedWorkItems)
}

// 处理任务描述变化
const handleTaskDescriptionChange = (row: WorkItem, index: number) => {
  const updatedWorkItems = [...props.workItems]
  updatedWorkItems[index] = { ...row }
  emit('update:workItems', updatedWorkItems)
  emit('change', updatedWorkItems)
}

// 处理工时数变化
const handleWorkHoursChange = (row: WorkItem, index: number) => {
  const updatedWorkItems = [...props.workItems]
  updatedWorkItems[index] = { ...row }
  emit('update:workItems', updatedWorkItems)
  emit('change', updatedWorkItems)
}

// 处理工作日期变化
const handleWorkDateChange = (row: WorkItem, index: number) => {
  const updatedWorkItems = [...props.workItems]
  updatedWorkItems[index] = { ...row }
  emit('update:workItems', updatedWorkItems)
  emit('change', updatedWorkItems)
}

// 监听workItems变化，确保至少有一条记录
watch(() => props.workItems, (newItems) => {
  if (newItems.length === 0) {
    addWorkItem()
  }
}, { immediate: true })
</script>

<style scoped>
.work-items-table {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #fafafa;
  border-top: 1px solid #e4e7ed;
}

.add-button {
  font-weight: 500;
}

.summary-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #606266;
}

.total-items {
  font-weight: 500;
}

.total-hours {
  color: #67c23a;
  font-weight: 500;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 0;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #303133;
  font-weight: 500;
}

:deep(.el-table td) {
  padding: 8px 0;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-form-item__error) {
  position: static;
  margin-top: 4px;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .summary-info {
    justify-content: space-between;
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
  
  :deep(.el-table .el-input) {
    font-size: 12px;
  }
}
</style>
