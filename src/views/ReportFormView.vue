<template>
  <div class="report-form-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>填报周报</span>
          <div class="week-selector">
            <el-date-picker
              v-model="selectedWeek"
              type="week"
              placeholder="选择周次"
              format="YYYY年第WW周"
              value-format="YYYY-WW"
              @change="handleWeekChange"
              :clearable="false"
            />
          </div>
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
          <WorkItemsTable
            v-model:work-items="formData.workItems"
            :projects="activeProjects"
            @change="handleWorkItemsChange"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="success" @click="handleSubmit" :loading="submitting">
            <el-icon><Check /></el-icon>
            提交
          </el-button>
          <el-button type="primary" @click="handleSaveDraft" :loading="submitting">
            <el-icon><Document /></el-icon>
            保存草稿
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useWeeklyReportStore } from '@/stores/weeklyReport'
import WorkItemsTable from '@/components/WorkItemsTable.vue'
import { Check, Document, Refresh } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

const router = useRouter()
const route = useRoute()
const store = useWeeklyReportStore()

const formRef = ref()
const submitting = ref(false)
const isEdit = ref(false)
const editReportId = ref('')

// 选中的周次 (格式: "2024-13")
const selectedWeek = ref('')

// 当前年份和周数
const currentYear = computed(() => {
  if (selectedWeek.value) {
    return parseInt(selectedWeek.value.split('-')[0])
  }
  return dayjs().year()
})

const currentWeek = computed(() => {
  if (selectedWeek.value) {
    return parseInt(selectedWeek.value.split('-')[1])
  }
  return dayjs().isoWeek()
})

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

// 初始化选中的周次
const initSelectedWeek = () => {
  const now = dayjs()
  const year = now.year()
  const week = now.isoWeek()
  selectedWeek.value = `${year}-${week.toString().padStart(2, '0')}`
}

// 周次变化处理
const handleWeekChange = (weekValue: string) => {
  if (!weekValue) return
  
  selectedWeek.value = weekValue
  loadWeekReport()
}

// 加载指定周的周报数据
const loadWeekReport = () => {
  if (!store.currentUser) {
    ElMessage.warning('请先登录')
    return
  }

  const year = currentYear.value
  const week = currentWeek.value
  
  // 查找该周的周报
  const existingReport = store.getWeekReport(store.currentUser.id, year, week)
  
  if (existingReport) {
    // 加载现有周报数据
    isEdit.value = true
    editReportId.value = existingReport.id
    formData.summary = existingReport.summary
    formData.workItems = existingReport.workItems.map(item => ({
      projectId: item.projectId,
      taskDescription: item.taskDescription,
      workHours: item.workHours,
      workDate: item.workDate
    }))
    
    ElMessage.info(`已加载${year}年第${week}周的周报数据`)
  } else {
    // 初始化空周报草稿
    isEdit.value = false
    editReportId.value = ''
    formData.summary = ''
    formData.workItems = []
    
    ElMessage.info(`开始创建${year}年第${week}周的新周报`)
  }
}

// 处理工时项变化
const handleWorkItemsChange = (workItems: any[]) => {
  formData.workItems = workItems
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
        // 保存到localStorage
        store.saveToLocal()
        ElMessage.success('周报提交成功！状态已更新为已提交')
        router.push('/report-list')
      } else {
        ElMessage.error('周报提交失败')
      }
    } else {
      // 创建新周报
      const result = store.addReport({
        userId: store.currentUser?.id || '',
        year: currentYear.value,
        week: currentWeek.value,
        summary: formData.summary,
        workItems: formData.workItems
      })
      
      if (result) {
        // 提交周报
        store.submitReport(result.id)
        // 保存到localStorage
        store.saveToLocal()
        ElMessage.success('周报提交成功！状态已更新为已提交')
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
        // 保存到localStorage
        store.saveToLocal()
        ElMessage.success('草稿保存成功！数据已保存到本地')
      } else {
        ElMessage.error('草稿保存失败')
      }
    } else {
      // 创建草稿
      const result = store.addReport({
        userId: store.currentUser?.id || '',
        year: currentYear.value,
        week: currentWeek.value,
        summary: formData.summary,
        workItems: formData.workItems
      })
      
      if (result) {
        // 保存到localStorage
        store.saveToLocal()
        ElMessage.success('草稿保存成功！数据已保存到本地')
        // 不跳转，让用户继续编辑
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
  
  // 重新加载当前周的数据
  loadWeekReport()
}

// 监听当前用户变化
watch(() => store.currentUser, (newUser) => {
  if (newUser) {
    loadWeekReport()
  }
}, { immediate: true })

onMounted(() => {
  // 初始化Store
  store.initializeStore()
  
  // 初始化选中的周次
  initSelectedWeek()
  
  // 加载周报数据
  loadWeekReport()
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

.week-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 工时记录表格样式已移至WorkItemsTable组件 */
</style>