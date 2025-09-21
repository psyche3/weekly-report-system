# 周报详情对话框实现

## 功能概述

为周报历史列表页面添加了El-Dialog对话框功能，点击"查看"按钮时弹出只读的周报详情对话框，展示完整的周报信息。

## 核心功能

### 1. 对话框触发
- 点击表格中的"查看"按钮
- 点击表格行（整行可点击）
- 弹出模态对话框

### 2. 对话框内容

#### 基本信息区域
```vue
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
```

#### 周报总结区域
```vue
<div class="detail-section">
  <h4>周报总结</h4>
  <div class="summary-content">
    {{ selectedReport.summary || '暂无总结' }}
  </div>
</div>
```

#### 工时明细表格
```vue
<div class="detail-section">
  <h4>工时明细</h4>
  <el-table
    :data="selectedReport.workItems"
    border
    stripe
    style="width: 100%"
    empty-text="暂无工时记录"
  >
    <el-table-column label="序号" width="80" align="center">
      <template #default="{ $index }">{{ $index + 1 }}</template>
    </el-table-column>
    
    <el-table-column prop="projectName" label="项目名称" width="200" align="center">
      <template #default="{ row }">
        <span class="project-name">{{ getProjectName(row.projectId) }}</span>
      </template>
    </el-table-column>
    
    <el-table-column prop="taskDescription" label="任务描述" min-width="300" show-overflow-tooltip>
      <template #default="{ row }">
        <span class="task-description">{{ row.taskDescription }}</span>
      </template>
    </el-table-column>
    
    <el-table-column prop="workHours" label="工时" width="100" align="center">
      <template #default="{ row }">
        <span class="work-hours">{{ row.workHours }} 小时</span>
      </template>
    </el-table-column>
    
    <el-table-column prop="workDate" label="工作日期" width="150" align="center">
      <template #default="{ row }">
        <span class="work-date">{{ row.workDate }}</span>
      </template>
    </el-table-column>
  </el-table>
</div>
```

#### 创建信息区域
```vue
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
```

### 3. 对话框配置

```vue
<el-dialog
  v-model="dialogVisible"
  :title="`${selectedReport?.year}年第${String(selectedReport?.week || 0).padStart(2, '0')}周 - 周报详情`"
  width="80%"
  :before-close="handleDialogClose"
>
```

### 4. 操作按钮

```vue
<template #footer>
  <div class="dialog-footer">
    <el-button @click="handleDialogClose">关闭</el-button>
    <el-button type="primary" @click="editReport">编辑周报</el-button>
  </div>
</template>
```

## 核心逻辑

### 1. 数据管理
```typescript
// 对话框相关
const dialogVisible = ref(false)
const selectedReport = ref<any>(null)
```

### 2. 查看周报
```typescript
const viewReport = (report: any) => {
  selectedReport.value = report
  dialogVisible.value = true
}
```

### 3. 编辑周报
```typescript
const editReport = () => {
  if (selectedReport.value) {
    dialogVisible.value = false
    router.push({
      path: '/report-form',
      query: { reportId: selectedReport.value.id }
    })
  }
}
```

### 4. 关闭对话框
```typescript
const handleDialogClose = () => {
  dialogVisible.value = false
  selectedReport.value = null
}
```

### 5. 获取项目名称
```typescript
const getProjectName = (projectId: string) => {
  const project = store.projects.find(p => p.id === projectId)
  return project ? project.name : '未知项目'
}
```

## 样式设计

### 1. 对话框整体样式
```css
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
```

### 2. 内容区域样式
```css
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
```

### 3. 区域标题样式
```css
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
```

### 4. 总结内容样式
```css
.summary-content {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  line-height: 1.6;
  color: #606266;
  min-height: 60px;
}
```

### 5. 表格内容样式
```css
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
```

## 功能特性

### 1. 只读展示
- 所有内容以只读方式展示
- 不允许编辑任何字段
- 提供"编辑周报"按钮跳转到编辑页面

### 2. 完整信息展示
- 周数：格式化显示（YYYY年第WW周）
- 状态：标签显示（草稿灰色，已提交绿色）
- 总工时：自动计算并高亮显示
- 周报总结：完整显示总结内容
- 工时明细：表格形式展示所有工时项
- 创建信息：显示创建和更新时间

### 3. 工时明细表格
- 序号：自动编号
- 项目名称：从Store中获取项目名称
- 任务描述：完整显示，支持文本溢出提示
- 工时：显示工时数
- 工作日期：显示工作日期

### 4. 交互体验
- 点击查看按钮弹出对话框
- 点击表格行也可以弹出对话框
- 对话框支持ESC键关闭
- 提供关闭和编辑按钮

## 数据流程

1. **触发查看**：用户点击查看按钮或表格行
2. **设置数据**：将选中的周报数据设置到selectedReport
3. **显示对话框**：设置dialogVisible为true
4. **渲染内容**：对话框根据selectedReport数据渲染内容
5. **用户操作**：用户可以选择关闭或编辑
6. **关闭对话框**：清理selectedReport数据

## 技术实现

### 1. 组件结构
- 使用Element Plus的el-dialog组件
- 对话框内容分为多个区域
- 使用el-table展示工时明细

### 2. 数据绑定
- 使用v-model绑定对话框显示状态
- 使用selectedReport存储选中的周报数据
- 响应式更新对话框内容

### 3. 事件处理
- viewReport：打开对话框
- editReport：跳转到编辑页面
- handleDialogClose：关闭对话框

### 4. 样式设计
- 使用CSS深度选择器修改Element Plus组件样式
- 分区域设计，层次清晰
- 颜色搭配合理，突出重点信息

## 使用说明

1. **查看周报**：在周报列表中点击"查看"按钮或表格行
2. **浏览详情**：在对话框中查看完整的周报信息
3. **编辑周报**：点击"编辑周报"按钮跳转到编辑页面
4. **关闭对话框**：点击"关闭"按钮或ESC键关闭对话框

## 文件位置

- `src/views/ReportListView.vue` - 周报历史列表页面（包含对话框）
- `src/stores/weeklyReport.ts` - 数据管理Store
- `src/components/Layout.vue` - 页面布局组件

## 注意事项

1. 确保Store中有项目数据用于显示项目名称
2. 工时明细表格需要处理空数据情况
3. 对话框宽度设置为80%，适合展示详细信息
4. 所有内容都是只读的，编辑需要跳转到其他页面
5. 关闭对话框时要清理selectedReport数据
