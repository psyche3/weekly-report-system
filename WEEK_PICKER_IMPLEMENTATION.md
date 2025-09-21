# 周报填报页面周选择器实现

## 功能概述

为周报填报页面实现了带有周选择器的功能，支持：
- 周选择器格式化为"2024年第13周"的形式
- 自动检查localStorage中是否存在该用户该周的周报数据
- 如果存在则加载到表单中，如果不存在则初始化空周报草稿

## 核心实现

### 1. 周选择器组件

```vue
<el-date-picker
  v-model="selectedWeek"
  type="week"
  placeholder="选择周次"
  format="YYYY年第WW周"
  value-format="YYYY-WW"
  @change="handleWeekChange"
  :clearable="false"
/>
```

### 2. 周次变化处理逻辑

```typescript
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
    
    // 添加一个默认工时项
    if (formData.workItems.length === 0) {
      addWorkItem()
    }
    
    ElMessage.info(`开始创建${year}年第${week}周的新周报`)
  }
}
```

### 3. 年份和周数计算

```typescript
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
```

### 4. 初始化选中的周次

```typescript
// 初始化选中的周次
const initSelectedWeek = () => {
  const now = dayjs()
  const year = now.year()
  const week = now.isoWeek()
  selectedWeek.value = `${year}-${week.toString().padStart(2, '0')}`
}
```

## 主要特性

### 1. 自动数据加载
- 当用户选择或切换周次时，自动检查localStorage中是否存在该用户该周的周报数据
- 如果存在，则加载到表单中供用户编辑
- 如果不存在，则初始化一个空的周报草稿

### 2. 用户友好的提示
- 加载现有数据时显示"已加载XX年第XX周的周报数据"
- 创建新周报时显示"开始创建XX年第XX周的新周报"

### 3. 数据持久化
- 所有数据自动保存到localStorage
- 支持草稿保存和正式提交两种状态

### 4. 表单验证
- 完整的表单验证规则
- 工时项必填验证
- 工时范围验证（0.5-24小时）

## 使用方式

1. 用户进入周报填报页面
2. 页面自动显示当前周的选择器
3. 用户可以点击周选择器选择其他周次
4. 选择后自动加载该周的数据或创建新草稿
5. 用户可以编辑表单内容并保存

## 技术实现

- **Vue 3 Composition API**: 使用ref、reactive、computed等API
- **Element Plus**: 使用el-date-picker组件
- **Day.js**: 处理日期和周数计算
- **Pinia Store**: 管理周报数据状态
- **TypeScript**: 提供类型安全

## 文件结构

```
src/views/ReportFormView.vue  # 周报填报页面
src/stores/weeklyReport.ts    # 周报数据管理
src/types/index.ts           # 类型定义
```

## 注意事项

1. 需要确保dayjs插件正确导入和扩展
2. 周数计算使用ISO周数标准
3. 数据格式为"YYYY-WW"（如"2024-13"）
4. 显示格式为"YYYY年第WW周"（如"2024年第13周"）
