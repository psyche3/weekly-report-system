# 动态工时记录表格实现

## 功能概述

为周报填报页面实现了动态增删的工时记录表单，使用Element Plus的el-table组件，支持：
- 动态添加和删除工时记录行
- 项目下拉选择（数据来自Store中的projects）
- 任务描述文本输入
- 工时数数字输入（步进0.5）
- 工作日期选择器
- 完整的表单验证

## 核心组件

### WorkItemsTable.vue

```vue
<template>
  <div class="work-items-table">
    <el-table :data="workItems" border stripe>
      <!-- 序号列 -->
      <el-table-column label="序号" width="80" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>

      <!-- 项目选择列 -->
      <el-table-column label="项目" width="200" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`workItems.${$index}.projectId`" :rules="projectRules">
            <el-select v-model="row.projectId" placeholder="选择项目">
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

      <!-- 任务描述列 -->
      <el-table-column label="任务描述" min-width="300">
        <template #default="{ row, $index }">
          <el-form-item :prop="`workItems.${$index}.taskDescription`" :rules="taskDescriptionRules">
            <el-input
              v-model="row.taskDescription"
              placeholder="请输入任务描述..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </template>
      </el-table-column>

      <!-- 工时数列 -->
      <el-table-column label="工时数" width="120" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`workItems.${$index}.workHours`" :rules="workHoursRules">
            <el-input-number
              v-model="row.workHours"
              :min="0.5"
              :max="24"
              :step="0.5"
              :precision="1"
              placeholder="工时"
            />
          </el-form-item>
        </template>
      </el-table-column>

      <!-- 工作日期列 -->
      <el-table-column label="工作日期" width="150" align="center">
        <template #default="{ row, $index }">
          <el-form-item :prop="`workItems.${$index}.workDate`" :rules="workDateRules">
            <el-date-picker
              v-model="row.workDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </template>
      </el-table-column>

      <!-- 操作列 -->
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
      <el-button type="primary" :icon="Plus" @click="addWorkItem">
        新增一行
      </el-button>
      
      <div class="summary-info">
        <span class="total-items">共 {{ workItems.length }} 条记录</span>
        <span class="total-hours">总工时: {{ totalWorkHours }} 小时</span>
      </div>
    </div>
  </div>
</template>
```

## 主要功能

### 1. 动态增删功能

```typescript
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
}
```

### 2. 表单验证规则

```typescript
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
```

### 3. 数据绑定

```typescript
// 使用v-model双向绑定
<WorkItemsTable
  v-model:work-items="formData.workItems"
  :projects="activeProjects"
  @change="handleWorkItemsChange"
/>

// 处理数据变化
const handleWorkItemsChange = (workItems: any[]) => {
  formData.workItems = workItems
}
```

### 4. 实时统计

```typescript
// 计算总工时
const totalWorkHours = computed(() => {
  return props.workItems.reduce((total, item) => total + (item.workHours || 0), 0)
})
```

## 使用方式

### 在ReportFormView中使用

```vue
<template>
  <el-form ref="formRef" :model="formData" :rules="formRules">
    <el-form-item label="周报总结" prop="summary">
      <el-input v-model="formData.summary" type="textarea" />
    </el-form-item>

    <el-form-item label="工时记录">
      <WorkItemsTable
        v-model:work-items="formData.workItems"
        :projects="activeProjects"
        @change="handleWorkItemsChange"
      />
    </el-form-item>
  </el-form>
</template>

<script setup>
import WorkItemsTable from '@/components/WorkItemsTable.vue'

const formData = reactive({
  summary: '',
  workItems: [] as WorkItem[]
})

const handleWorkItemsChange = (workItems: WorkItem[]) => {
  formData.workItems = workItems
}
</script>
```

## 特性亮点

### 1. 用户体验优化
- 表格形式展示，信息清晰
- 实时显示记录数量和总工时
- 至少保留一条记录的限制
- 友好的错误提示

### 2. 表单验证
- 每个字段都有相应的验证规则
- 实时验证反馈
- 防止无效数据提交

### 3. 响应式设计
- 支持移动端适配
- 表格在小屏幕上自动调整

### 4. 数据同步
- 使用v-model实现双向绑定
- 支持父组件监听数据变化
- 自动同步到Store

## 技术实现

- **Vue 3 Composition API**: 使用ref、computed、watch等API
- **Element Plus**: 使用el-table、el-form-item等组件
- **TypeScript**: 完整的类型定义和类型安全
- **双向绑定**: 使用v-model实现数据同步
- **事件通信**: 使用emit向父组件传递数据变化

## 文件结构

```
src/components/WorkItemsTable.vue  # 工时记录表格组件
src/views/ReportFormView.vue       # 周报填报页面
src/stores/weeklyReport.ts         # 数据管理Store
```

## 注意事项

1. 确保projects数据正确传递
2. 表单验证规则可以根据业务需求调整
3. 工时数步进值可以根据实际需求修改
4. 日期格式需要与后端保持一致
