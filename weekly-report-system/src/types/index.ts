// 用户类型定义
export interface User {
  id: string
  name: string
  email: string
  department?: string
  position?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

// 项目类型定义
export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive' | 'completed'
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

// 工时项类型定义
export interface WorkItem {
  id: string
  reportId: string
  projectId: string
  taskDescription: string
  workHours: number
  workDate: string
  createdAt: string
  updatedAt: string
}

// 周报状态枚举
export enum ReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted'
}

// 周报类型定义
export interface Report {
  id: string
  userId: string
  year: number
  week: number
  summary: string
  status: ReportStatus
  workItems: WorkItem[]
  createdAt: string
  updatedAt: string
}

// Store状态接口
export interface WeeklyReportState {
  users: User[]
  projects: Project[]
  reports: Report[]
  currentUser: User | null
  isLoading: boolean
  lastSyncTime: string | null
}

// 创建周报请求接口
export interface CreateReportRequest {
  userId: string
  year: number
  week: number
  summary: string
  workItems: Omit<WorkItem, 'id' | 'reportId' | 'createdAt' | 'updatedAt'>[]
}

// 更新周报请求接口
export interface UpdateReportRequest {
  id: string
  summary?: string
  status?: ReportStatus
  workItems?: Omit<WorkItem, 'id' | 'reportId' | 'createdAt' | 'updatedAt'>[]
}

// 创建工时项请求接口
export interface CreateWorkItemRequest {
  reportId: string
  projectId: string
  taskDescription: string
  workHours: number
  workDate: string
}

// 更新工时项请求接口
export interface UpdateWorkItemRequest {
  id: string
  taskDescription?: string
  workHours?: number
  workDate?: string
}
