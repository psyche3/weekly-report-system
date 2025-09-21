<template>
  <div class="report-form-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>填报周报</span>
          <el-tag type="info">{{ currentYear }}年第{{ currentWeek }}周</el-tag>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="周报总结" prop="summary">
          <el-input
            v-model="formData.summary"
            type="textarea"
            :rows="4"
            placeholder="请填写本周工作总结..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="工时记录">
          <div class="work-items-section">
            <div class="work-items-header">
              <span>工作项目</span>
              <el-button type="primary" size="small" @click="addWorkItem">
                <el-icon><Plus /></el-icon>
                添加工时项
              </el-button>
            </div>

            <div v-if="formData.workItems.length === 0" class="empty-work-items">
              <el-empty description="暂无工时记录" />
            </div>

            <div v-else class="work-items-list">
              <div
                v-for="(item, index) in formData.workItems"
                :key="index"
                class="work-item"
              >
                <el-row :gutter="10">
                  <el-col :span="8">
                    <el-form-item
                      :prop="`workItems.${index}.projectId`"
                      :rules="[{ required: true, message: '请选择项目', trigger: 'change' }]"
                    >
                      <el-select
                        v-model="item.projectId"
                        placeholder="选择项目"
                        style="width: 100%"
                      >
                        <el-option
                          v-for="project in activeProjects"
                          :key="project.id"
                          :label="project.name"
                          :value="project.id"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="8">
                    <el-form-item
                      :prop="`workItems.${index}.workHours`"
                      :rules="[
                        { required: true, message: '请输入工时', trigger: 'blur' },
                        { type: 'number', min: 0.5, max: 24, message: '工时范围0.5-24小时', trigger: 'blur' }
                      ]"
                    >
                      <el-input-number
                        v-model="item.workHours"
                        :min="0.5"
                        :max="24"
                        :step="0.5"
                        placeholder="工时"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="6">
                    <el-form-item
                      :prop="`workItems.${index}.workDate`"
                      :rules="[{ required: true, message: '请选择日期', trigger: 'change' }]"
                    >
                      <el-date-picker
                        v-model="item.workDate"
                        type="date"
                        placeholder="工作日期"
                        style="width: 100%"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                      />
                    </el-form-item>
                  </el-col>
                  
                  <el-col :span="2">
                    <el-button
                      type="danger"
                      size="small"
                      @click="removeWorkItem(index)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </el-col>
                </el-row>
                
                <el-form-item
                  :prop="`workItems.${index}.taskDescription`"
                  :rules="[{ required: true, message: '请输入任务描述', trigger: 'blur' }]"
                >
                  <el-input
                    v-model="item.taskDescription"
                    placeholder="请输入任务描述..."
                    maxlength="200"
                    show-word-limit
                  />
                </el-form-item>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '更新周报' : '保存周报' }}
          </el-button>
          <el-button @click="handleSaveDraft" :loading="submitting">
            保存草稿
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useWeeklyReportStore } from '@/stores/weeklyReport'
import { Plus, Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(weekOfYear)

const router = useRouter()
const route = useRoute()
const store = useWeeklyReportStore()

const formRef = ref()
const submitting = ref(false)
const isEdit = ref(false)
const editReportId = ref('')

// 当前年份和周数
const currentYear = dayjs().year()
const currentWeek = dayjs().isoWeek()

// 表单数据
const formData = reactive({
  summary: '',
  workItems: [] as Array<{
    projectId: string
    taskDescription: string
    workHours: number
    workDate: string
  }>
})

// 表单验证规则
const formRules = {
  summary: [
    { required: true, message: '请输入周报总结', trigger: 'blur' },
    { min: 10, message: '总结至少10个字符', trigger: 'blur' }
  ]
}

// 活跃项目
const activeProjects = computed(() => store.getActiveProjects)

// 添加工时项
const addWorkItem = () => {
  formData.workItems.push({
    projectId: '',
    taskDescription: '',
    workHours: 8,
    workDate: dayjs().format('YYYY-MM-DD')
  })
}

// 删除工时项
const removeWorkItem = (index: number) => {
  formData.workItems.splice(index, 1)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (formData.workItems.length === 0) {
      ElMessage.warning('请至少添加一个工时项')
      return
    }
    
    submitting.value = true
    
    if (isEdit.value) {
      // 更新周报
      const result = store.updateReport(editReportId.value, {
        summary: formData.summary,
        status: 'submitted' as any,
        workItems: formData.workItems
      })
      
      if (result) {
        ElMessage.success('周报更新成功')
        router.push('/report-list')
      } else {
        ElMessage.error('周报更新失败')
      }
    } else {
      // 创建新周报
      const result = store.addReport({
        userId: store.currentUser?.id || '',
        year: currentYear,
        week: currentWeek,
        summary: formData.summary,
        workItems: formData.workItems
      })
      
      if (result) {
        // 提交周报
        store.submitReport(result.id)
        ElMessage.success('周报提交成功')
        router.push('/report-list')
      } else {
        ElMessage.error('周报创建失败')
      }
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 保存草稿
const handleSaveDraft = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    if (isEdit.value) {
      // 更新草稿
      const result = store.updateReport(editReportId.value, {
        summary: formData.summary,
        status: 'draft' as any,
        workItems: formData.workItems
      })
      
      if (result) {
        ElMessage.success('草稿保存成功')
      } else {
        ElMessage.error('草稿保存失败')
      }
    } else {
      // 创建草稿
      const result = store.addReport({
        userId: store.currentUser?.id || '',
        year: currentYear,
        week: currentWeek,
        summary: formData.summary,
        workItems: formData.workItems
      })
      
      if (result) {
        ElMessage.success('草稿保存成功')
        router.push('/report-list')
      } else {
        ElMessage.error('草稿保存失败')
      }
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  formData.summary = ''
  formData.workItems = []
  formRef.value?.resetFields()
}

// 加载现有周报数据
const loadExistingReport = () => {
  const reportId = route.query.id as string
  if (reportId) {
    const report = store.reports.find(r => r.id === reportId)
    if (report) {
      isEdit.value = true
      editReportId.value = reportId
      formData.summary = report.summary
      formData.workItems = report.workItems.map(item => ({
        projectId: item.projectId,
        taskDescription: item.taskDescription,
        workHours: item.workHours,
        workDate: item.workDate
      }))
    }
  } else {
    // 检查是否有当前周的草稿
    const currentUser = store.currentUser
    if (currentUser) {
      const existingReport = store.getCurrentWeekReport(currentUser.id)
      if (existingReport && existingReport.status === 'draft') {
        ElMessageBox.confirm(
          `发现${currentYear}年第${currentWeek}周的草稿，是否继续编辑？`,
          '发现草稿',
          {
            confirmButtonText: '继续编辑',
            cancelButtonText: '新建周报',
            type: 'info'
          }
        ).then(() => {
          isEdit.value = true
          editReportId.value = existingReport.id
          formData.summary = existingReport.summary
          formData.workItems = existingReport.workItems.map(item => ({
            projectId: item.projectId,
            taskDescription: item.taskDescription,
            workHours: item.workHours,
            workDate: item.workDate
          }))
        }).catch(() => {
          // 用户选择新建，保持默认状态
        })
      }
    }
  }
}

onMounted(() => {
  store.initializeStore()
  loadExistingReport()
  
  // 如果没有工时项，添加一个默认项
  if (formData.workItems.length === 0) {
    addWorkItem()
  }
})
</script>

<style scoped>
.report-form-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.work-items-section {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  background-color: #fafafa;
}

.work-items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 500;
  color: #303133;
}

.empty-work-items {
  text-align: center;
  padding: 20px;
}

.work-items-list {
  space-y: 16px;
}

.work-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}

.work-item:last-child {
  margin-bottom: 0;
}
</style>
