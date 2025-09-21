# 周报系统 Pinia Store 设计文档

## 项目概述

本项目为纯前端的周报系统，使用Vue 3 + Vite + Pinia + TypeScript构建，包含完整的数据模型和持久化功能。

## 技术栈

- **Vue 3**: 前端框架
- **Vite**: 构建工具
- **Pinia**: 状态管理
- **TypeScript**: 类型支持
- **Element Plus**: UI组件库
- **ECharts**: 图表库
- **xlsx**: Excel导出
- **Day.js**: 日期处理

## 核心数据模型

### 1. 用户 (User)
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

### 2. 项目 (Project)
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

### 3. 周报 (Report)
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

### 4. 工时项 (WorkItem)
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

## Store 功能特性

### 状态管理
- **用户管理**: 增删改查用户信息
- **项目管理**: 增删改查项目信息
- **周报管理**: 创建、更新、提交周报
- **工时项管理**: 管理周报中的工时记录

### 持久化功能
- **localStorage存储**: 自动保存到浏览器本地存储
- **数据恢复**: 页面刷新后自动恢复数据
- **同步时间**: 记录最后同步时间

### 查询功能
- **按部门查询用户**: `getUsersByDepartment(department)`
- **获取活跃项目**: `getActiveProjects`
- **按用户查询周报**: `getReportsByUser(userId)`
- **按年份查询周报**: `getReportsByYear(year)`
- **按周数查询周报**: `getReportsByYearAndWeek(year, week)`
- **获取周报工时项**: `getWorkItemsByReport(reportId)`
- **获取项目工时项**: `getWorkItemsByProject(projectId)`

### 统计功能
- **周报统计**: 获取用户的周报统计信息
- **工时统计**: 计算总工时和平均工时
- **提交率统计**: 计算周报提交率

## 使用方法

### 1. 基本使用
```typescript
import { useWeeklyReportStore } from '@/stores/weeklyReport'

const store = useWeeklyReportStore()

// 添加用户
const user = store.addUser({
  name: '张三',
  email: 'zhangsan@example.com',
  department: '技术部',
  position: '前端工程师'
})

// 添加项目
const project = store.addProject({
  name: '周报系统',
  description: '开发周报管理系统',
  status: 'active',
  startDate: '2024-01-01'
})

// 创建周报
const report = store.addReport({
  userId: user.id,
  year: 2024,
  week: 1,
  summary: '本周工作总结',
  workItems: [
    {
      projectId: project.id,
      taskDescription: '开发新功能',
      workHours: 8,
      workDate: '2024-01-01'
    }
  ]
})
```

### 2. 数据查询
```typescript
// 获取当前用户的周报
const currentUserReports = store.getReportsByUser(store.currentUser?.id)

// 获取当前周报
const currentWeekReport = store.getCurrentWeekReport(userId)

// 获取统计信息
const stats = store.getReportStatistics(userId, 2024)
```

### 3. 数据持久化
```typescript
// 手动保存
store.saveToLocal()

// 手动加载
store.loadFromLocal()

// 初始化Store（在main.ts中调用）
store.initializeStore()
```

## 项目结构

```
src/
├── stores/
│   ├── weeklyReport.ts    # 主Store文件
│   └── README.md         # Store文档
├── types/
│   └── index.ts          # 类型定义
├── utils/
│   ├── initData.ts       # 示例数据初始化
│   └── storeExample.ts   # 使用示例
├── views/
│   └── TestStore.vue     # Store测试页面
└── main.ts               # 应用入口
```

## 安装和运行

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 构建生产版本
```bash
npm run build
```

### 4. 类型检查
```bash
npm run type-check
```

## 测试

访问 `/test-store` 路由可以测试Store的基本功能：
- 添加测试用户
- 添加测试项目
- 添加测试周报
- 查看数据统计

## 注意事项

1. **数据持久化**: 所有数据自动保存到localStorage，键名为 `weekly-report-system-data`
2. **ID生成**: 使用时间戳+随机字符串生成唯一ID
3. **时间格式**: 所有时间使用ISO格式字符串
4. **数据关联**: 删除用户时会同时删除相关周报，删除项目时会删除相关工时项
5. **周数计算**: 使用ISO周数标准（dayjs的isoWeek方法）

## 扩展功能

Store设计支持以下扩展：
- 数据导入导出
- 数据备份恢复
- 多用户权限管理
- 数据同步到服务器
- 高级查询和过滤
- 数据分析和报表

## 总结

本Pinia Store设计提供了完整的周报系统数据管理功能，包括：
- 完整的数据模型定义
- 丰富的CRUD操作方法
- 强大的查询和统计功能
- 可靠的数据持久化
- 良好的TypeScript类型支持

可以在此基础上开发完整的周报系统前端应用。
