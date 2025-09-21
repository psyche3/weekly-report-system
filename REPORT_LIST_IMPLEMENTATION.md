# 周报历史列表页面实现

## 功能概述

使用Element Plus的el-table组件创建了周报历史列表页面，展示当前用户的所有周报数据，包含筛选、分页和查看功能。

## 核心功能

### 1. 表格展示
- 使用`el-table`组件展示周报数据
- 支持条纹样式和边框
- 空数据时显示友好提示
- 表格行可点击查看详情

### 2. 表格列设计

#### 周数列
```vue
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
```

#### 状态列
```vue
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
```

#### 周报总结列
```vue
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
```

#### 总工时数列
```vue
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
```

#### 工时项数列
```vue
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
```

#### 创建时间列
```vue
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
```

#### 操作列
```vue
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
```

### 3. 筛选功能

#### 筛选条件
```typescript
const filters = reactive({
  year: new Date().getFullYear(),
  status: '',
  keyword: ''
})
```

#### 筛选逻辑
```typescript
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
```

### 4. 分页功能

```vue
<el-pagination
  :current-page="currentPage"
  :page-size="pageSize"
  :total="filteredReports.length"
  layout="total, prev, pager, next, jumper"
  @current-change="handlePageChange"
/>
```

```typescript
const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredReports.value.slice(start, end)
})
```

### 5. 核心计算函数

#### 总工时计算
```typescript
const getTotalWorkHours = (report: any) => {
  return report.workItems.reduce((total: number, item: any) => {
    const hours = Number(item.workHours) || 0
    return total + hours
  }, 0)
}
```

#### 日期格式化
```typescript
const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}
```

#### 查看周报
```typescript
const viewReport = (report: any) => {
  // 跳转到周报填报页面进行查看/编辑
  router.push({
    path: '/report-form',
    query: { reportId: report.id }
  })
}
```

## 样式设计

### 1. 表格样式
```css
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
```

### 2. 交互效果
```css
/* 表格行点击效果 */
:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}
```

## 状态标签设计

### 1. 已提交状态
- 类型：`success`
- 颜色：绿色
- 文本：`已提交`

### 2. 草稿状态
- 类型：`default`
- 颜色：`#909399`（灰色）
- 文本：`草稿`

## 数据流程

1. **页面加载**：调用`store.initializeStore()`初始化数据
2. **数据过滤**：根据当前用户ID过滤周报数据
3. **条件筛选**：支持按年份、状态、关键词筛选
4. **分页处理**：将过滤后的数据分页显示
5. **交互操作**：点击查看按钮跳转到周报填报页面

## 功能特性

### 1. 用户隔离
- 只显示当前登录用户的周报
- 通过`store.currentUser.id`进行过滤

### 2. 实时筛选
- 年份筛选：下拉选择
- 状态筛选：全部/已提交/草稿
- 关键词搜索：支持总结和任务描述搜索

### 3. 数据展示
- 周数格式：`YYYY年第WW周`
- 状态标签：颜色区分草稿和已提交
- 总工时：自动计算所有工时项的总和
- 工时项数：显示工时项数量标签

### 4. 交互体验
- 表格行可点击
- 悬停效果
- 分页导航
- 空数据友好提示

## 技术实现

### 1. 组件导入
```typescript
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useWeeklyReportStore } from '@/stores/weeklyReport'
import { Plus, Search, View } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
```

### 2. 响应式数据
- `filters`：筛选条件
- `currentPage`：当前页码
- `pageSize`：每页大小
- `filteredReports`：过滤后的周报
- `paginatedReports`：分页后的周报

### 3. 计算属性
- `availableYears`：可用年份列表
- `filteredReports`：过滤后的周报数据
- `paginatedReports`：分页后的周报数据

## 使用说明

1. **访问页面**：导航到`/report-list`
2. **筛选数据**：使用顶部筛选条件
3. **查看周报**：点击表格行或查看按钮
4. **分页浏览**：使用底部分页组件
5. **新建周报**：点击右上角"新建周报"按钮

## 文件位置

- `src/views/ReportListView.vue` - 周报历史列表页面
- `src/stores/weeklyReport.ts` - 数据管理Store
- `src/components/Layout.vue` - 页面布局组件

## 注意事项

1. 确保Store中有当前用户数据
2. 周报数据需要包含完整的workItems数组
3. 工时数计算需要处理数据类型转换
4. 分页组件需要正确处理页码变化
5. 表格行点击和按钮点击需要区分处理
