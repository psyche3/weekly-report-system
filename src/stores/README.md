# 周报系统 Pinia Store 文档

## 概述

这是周报系统的核心状态管理Store，使用Pinia实现，包含用户、项目、周报和工时项的完整数据模型。

## 核心状态

### 用户 (User)
```typescript
interface User {
  id: string
  name: string
  email: string
  department?: string
  position?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}
```

### 项目 (Project)
```typescript
interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive' | 'completed'
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
}
```

### 周报 (Report)
```typescript
interface Report {
  id: string
  userId: string
  year: number
  week: number
  summary: string
  status: ReportStatus // 'draft' | 'submitted'
  workItems: WorkItem[]
  createdAt: string
  updatedAt: string
}
```

### 工时项 (WorkItem)
```typescript
interface WorkItem {
  id: string
  reportId: string
  projectId: string
  taskDescription: string
  workHours: number
  workDate: string
  createdAt: string
  updatedAt: string
}
```

## 主要功能

### 持久化
- `loadFromLocal()`: 从localStorage加载数据
- `saveToLocal()`: 保存数据到localStorage
- `initializeStore()`: 初始化Store并加载数据

### 用户管理
- `addUser(userData)`: 添加用户
- `updateUser(id, userData)`: 更新用户
- `deleteUser(id)`: 删除用户
- `setCurrentUser(user)`: 设置当前用户

### 项目管理
- `addProject(projectData)`: 添加项目
- `updateProject(id, projectData)`: 更新项目
- `deleteProject(id)`: 删除项目

### 周报管理
- `addReport(reportData)`: 创建周报
- `updateReport(id, reportData)`: 更新周报
- `deleteReport(id)`: 删除周报
- `submitReport(id)`: 提交周报
- `getCurrentWeekReport(userId)`: 获取当前周报
- `getWeekReport(userId, year, week)`: 获取指定周报

### 工时项管理
- `addWorkItem(workItemData)`: 添加工时项
- `updateWorkItem(id, workItemData)`: 更新工时项
- `deleteWorkItem(id)`: 删除工时项

### 查询方法
- `getUsersByDepartment(department)`: 按部门获取用户
- `getActiveProjects`: 获取活跃项目
- `getReportsByUser(userId)`: 获取用户周报
- `getReportsByYear(year)`: 获取年份周报
- `getReportsByYearAndWeek(year, week)`: 获取指定周报
- `getWorkItemsByReport(reportId)`: 获取周报工时项
- `getWorkItemsByProject(projectId)`: 获取项目工时项

### 统计方法
- `getReportStatistics(userId, year)`: 获取周报统计信息

## 使用示例

```typescript
import { useWeeklyReportStore } from '@/stores/weeklyReport'

// 在组件中使用
const store = useWeeklyReportStore()

// 添加用户
const user = store.addUser({
  name: '张三',
  email: 'zhangsan@example.com',
  department: '技术部',
  position: '前端工程师'
})

// 创建周报
const report = store.addReport({
  userId: user.id,
  year: 2024,
  week: 1,
  summary: '本周工作总结',
  workItems: [
    {
      projectId: 'project-id',
      taskDescription: '开发新功能',
      workHours: 8,
      workDate: '2024-01-01'
    }
  ]
})

// 提交周报
store.submitReport(report.id)

// 获取统计信息
const stats = store.getReportStatistics(user.id, 2024)
```

## 数据持久化

Store会自动将数据保存到localStorage，键名为 `weekly-report-system-data`。数据包含：

```typescript
interface WeeklyReportState {
  users: User[]
  projects: Project[]
  reports: Report[]
  currentUser: User | null
  isLoading: boolean
  lastSyncTime: string | null
}
```

## 注意事项

1. 所有时间戳使用ISO格式字符串
2. ID使用时间戳+随机字符串生成
3. 删除用户时会同时删除相关周报
4. 删除项目时会同时删除相关工时项
5. 数据变更后会自动保存到localStorage
