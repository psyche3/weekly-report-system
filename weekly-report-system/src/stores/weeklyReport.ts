import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import type {
  User,
  Project,
  Report,
  WorkItem,
  WeeklyReportState,
  CreateReportRequest,
  UpdateReportRequest,
  CreateWorkItemRequest,
  UpdateWorkItemRequest,
  ReportStatus
} from '@/types'

// 生成唯一ID的工具函数
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 获取当前时间戳
const getCurrentTimestamp = (): string => {
  return dayjs().toISOString()
}

export const useWeeklyReportStore = defineStore('weeklyReport', () => {
  // 状态定义
  const users = ref<User[]>([])
  const projects = ref<Project[]>([])
  const reports = ref<Report[]>([])
  const currentUser = ref<User | null>(null)
  const isLoading = ref<boolean>(false)
  const lastSyncTime = ref<string | null>(null)

  // 计算属性
  const getUsersByDepartment = computed(() => {
    return (department: string) => users.value.filter(user => user.department === department)
  })

  const getActiveProjects = computed(() => {
    return projects.value.filter(project => project.status === 'active')
  })

  const getReportsByUser = computed(() => {
    return (userId: string) => reports.value.filter(report => report.userId === userId)
  })

  const getReportsByYear = computed(() => {
    return (year: number) => reports.value.filter(report => report.year === year)
  })

  const getReportsByYearAndWeek = computed(() => {
    return (year: number, week: number) => 
      reports.value.filter(report => report.year === year && report.week === week)
  })

  const getWorkItemsByReport = computed(() => {
    return (reportId: string) => {
      const report = reports.value.find(r => r.id === reportId)
      return report ? report.workItems : []
    }
  })

  const getWorkItemsByProject = computed(() => {
    return (projectId: string) => {
      return reports.value.flatMap(report => 
        report.workItems.filter(item => item.projectId === projectId)
      )
    }
  })

  // 持久化相关方法
  const STORAGE_KEY = 'weekly-report-system-data'

  const loadFromLocal = (): void => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored) as WeeklyReportState
        users.value = data.users || []
        projects.value = data.projects || []
        reports.value = data.reports || []
        currentUser.value = data.currentUser || null
        lastSyncTime.value = data.lastSyncTime || null
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error)
    }
  }

  const saveToLocal = (): void => {
    try {
      const data: WeeklyReportState = {
        users: users.value,
        projects: projects.value,
        reports: reports.value,
        currentUser: currentUser.value,
        isLoading: isLoading.value,
        lastSyncTime: getCurrentTimestamp()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      lastSyncTime.value = getCurrentTimestamp()
    } catch (error) {
      console.error('Failed to save data to localStorage:', error)
    }
  }

  // 用户相关操作
  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    }
    users.value.push(newUser)
    saveToLocal()
    return newUser
  }

  const updateUser = (id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): User | null => {
    const index = users.value.findIndex(user => user.id === id)
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        ...userData,
        updatedAt: getCurrentTimestamp()
      }
      saveToLocal()
      return users.value[index]
    }
    return null
  }

  const deleteUser = (id: string): boolean => {
    const index = users.value.findIndex(user => user.id === id)
    if (index !== -1) {
      users.value.splice(index, 1)
      // 删除用户时，同时删除该用户的所有周报
      reports.value = reports.value.filter(report => report.userId !== id)
      saveToLocal()
      return true
    }
    return false
  }

  // 项目相关操作
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project => {
    const newProject: Project = {
      ...projectData,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    }
    projects.value.push(newProject)
    saveToLocal()
    return newProject
  }

  const updateProject = (id: string, projectData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Project | null => {
    const index = projects.value.findIndex(project => project.id === id)
    if (index !== -1) {
      projects.value[index] = {
        ...projects.value[index],
        ...projectData,
        updatedAt: getCurrentTimestamp()
      }
      saveToLocal()
      return projects.value[index]
    }
    return null
  }

  const deleteProject = (id: string): boolean => {
    const index = projects.value.findIndex(project => project.id === id)
    if (index !== -1) {
      projects.value.splice(index, 1)
      // 删除项目时，同时删除所有相关的工时项
      reports.value.forEach(report => {
        report.workItems = report.workItems.filter(item => item.projectId !== id)
      })
      saveToLocal()
      return true
    }
    return false
  }

  // 周报相关操作
  const addReport = (reportData: CreateReportRequest): Report => {
    const workItems: WorkItem[] = reportData.workItems.map(item => ({
      ...item,
      id: generateId(),
      reportId: '', // 将在下面设置
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    }))

    const newReport: Report = {
      id: generateId(),
      userId: reportData.userId,
      year: reportData.year,
      week: reportData.week,
      summary: reportData.summary,
      status: ReportStatus.DRAFT,
      workItems: workItems.map(item => ({ ...item, reportId: newReport.id })),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    }

    reports.value.push(newReport)
    saveToLocal()
    return newReport
  }

  const updateReport = (id: string, reportData: UpdateReportRequest): Report | null => {
    const index = reports.value.findIndex(report => report.id === id)
    if (index !== -1) {
      const currentReport = reports.value[index]
      
      // 更新工时项
      if (reportData.workItems) {
        const workItems: WorkItem[] = reportData.workItems.map(item => ({
          ...item,
          id: item.id || generateId(),
          reportId: id,
          createdAt: item.createdAt || getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp()
        }))
        currentReport.workItems = workItems
      }

      reports.value[index] = {
        ...currentReport,
        ...reportData,
        updatedAt: getCurrentTimestamp()
      }
      saveToLocal()
      return reports.value[index]
    }
    return null
  }

  const deleteReport = (id: string): boolean => {
    const index = reports.value.findIndex(report => report.id === id)
    if (index !== -1) {
      reports.value.splice(index, 1)
      saveToLocal()
      return true
    }
    return false
  }

  // 工时项相关操作
  const addWorkItem = (workItemData: CreateWorkItemRequest): WorkItem | null => {
    const reportIndex = reports.value.findIndex(report => report.id === workItemData.reportId)
    if (reportIndex !== -1) {
      const newWorkItem: WorkItem = {
        ...workItemData,
        id: generateId(),
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
      }
      reports.value[reportIndex].workItems.push(newWorkItem)
      saveToLocal()
      return newWorkItem
    }
    return null
  }

  const updateWorkItem = (id: string, workItemData: UpdateWorkItemRequest): WorkItem | null => {
    for (const report of reports.value) {
      const itemIndex = report.workItems.findIndex(item => item.id === id)
      if (itemIndex !== -1) {
        report.workItems[itemIndex] = {
          ...report.workItems[itemIndex],
          ...workItemData,
          updatedAt: getCurrentTimestamp()
        }
        saveToLocal()
        return report.workItems[itemIndex]
      }
    }
    return null
  }

  const deleteWorkItem = (id: string): boolean => {
    for (const report of reports.value) {
      const itemIndex = report.workItems.findIndex(item => item.id === id)
      if (itemIndex !== -1) {
        report.workItems.splice(itemIndex, 1)
        saveToLocal()
        return true
      }
    }
    return false
  }

  // 工具方法
  const setCurrentUser = (user: User | null): void => {
    currentUser.value = user
    saveToLocal()
  }

  const getCurrentWeekReport = (userId: string): Report | null => {
    const now = dayjs()
    const year = now.year()
    const week = now.week()
    
    return reports.value.find(report => 
      report.userId === userId && 
      report.year === year && 
      report.week === week
    ) || null
  }

  const getWeekReport = (userId: string, year: number, week: number): Report | null => {
    return reports.value.find(report => 
      report.userId === userId && 
      report.year === year && 
      report.week === week
    ) || null
  }

  const submitReport = (id: string): boolean => {
    const report = reports.value.find(r => r.id === id)
    if (report && report.status === ReportStatus.DRAFT) {
      report.status = ReportStatus.SUBMITTED
      report.updatedAt = getCurrentTimestamp()
      saveToLocal()
      return true
    }
    return false
  }

  const getReportStatistics = (userId: string, year: number) => {
    const userReports = reports.value.filter(report => 
      report.userId === userId && report.year === year
    )
    
    const totalReports = userReports.length
    const submittedReports = userReports.filter(report => report.status === ReportStatus.SUBMITTED).length
    const totalWorkHours = userReports.reduce((total, report) => 
      total + report.workItems.reduce((sum, item) => sum + item.workHours, 0), 0
    )
    
    return {
      totalReports,
      submittedReports,
      draftReports: totalReports - submittedReports,
      totalWorkHours,
      averageWorkHours: totalReports > 0 ? totalWorkHours / totalReports : 0
    }
  }

  // 初始化方法
  const initializeStore = (): void => {
    loadFromLocal()
  }

  return {
    // 状态
    users,
    projects,
    reports,
    currentUser,
    isLoading,
    lastSyncTime,
    
    // 计算属性
    getUsersByDepartment,
    getActiveProjects,
    getReportsByUser,
    getReportsByYear,
    getReportsByYearAndWeek,
    getWorkItemsByReport,
    getWorkItemsByProject,
    
    // 持久化方法
    loadFromLocal,
    saveToLocal,
    
    // 用户操作
    addUser,
    updateUser,
    deleteUser,
    
    // 项目操作
    addProject,
    updateProject,
    deleteProject,
    
    // 周报操作
    addReport,
    updateReport,
    deleteReport,
    
    // 工时项操作
    addWorkItem,
    updateWorkItem,
    deleteWorkItem,
    
    // 工具方法
    setCurrentUser,
    getCurrentWeekReport,
    getWeekReport,
    submitReport,
    getReportStatistics,
    initializeStore
  }
})
