// Store使用示例
import { useWeeklyReportStore, ReportStatus } from '@/stores/weeklyReport'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(weekOfYear)

// 使用示例函数
export const storeUsageExamples = () => {
  const store = useWeeklyReportStore()

  // 1. 添加用户
  const newUser = store.addUser({
    name: '新用户',
    email: 'newuser@example.com',
    department: '技术部',
    position: '全栈工程师'
  })
  console.log('新用户已添加:', newUser)

  // 2. 添加项目
  const newProject = store.addProject({
    name: '新项目',
    description: '这是一个新项目',
    status: 'active',
    startDate: dayjs().format('YYYY-MM-DD')
  })
  console.log('新项目已添加:', newProject)

  // 3. 创建周报
  const newReport = store.addReport({
    userId: newUser.id,
    year: dayjs().year(),
    week: dayjs().isoWeek(),
    summary: '本周完成了新功能的开发',
    workItems: [
      {
        projectId: newProject.id,
        taskDescription: '开发新功能模块',
        workHours: 8,
        workDate: dayjs().format('YYYY-MM-DD')
      }
    ]
  })
  console.log('新周报已创建:', newReport)

  // 4. 提交周报
  const submitted = store.submitReport(newReport.id)
  console.log('周报提交状态:', submitted)

  // 5. 获取用户的所有周报
  const userReports = store.getReportsByUser(newUser.id)
  console.log('用户周报列表:', userReports)

  // 6. 获取当前周的周报
  const currentWeekReport = store.getCurrentWeekReport(newUser.id)
  console.log('当前周报:', currentWeekReport)

  // 7. 获取周报统计信息
  const statistics = store.getReportStatistics(newUser.id, dayjs().year())
  console.log('周报统计:', statistics)

  // 8. 更新工时项
  if (newReport.workItems.length > 0) {
    const updatedWorkItem = store.updateWorkItem(newReport.workItems[0].id, {
      workHours: 10,
      taskDescription: '更新后的任务描述'
    })
    console.log('工时项已更新:', updatedWorkItem)
  }

  // 9. 添加新的工时项
  const newWorkItem = store.addWorkItem({
    reportId: newReport.id,
    projectId: newProject.id,
    taskDescription: '代码审查',
    workHours: 2,
    workDate: dayjs().add(1, 'day').format('YYYY-MM-DD')
  })
  console.log('新工时项已添加:', newWorkItem)

  // 10. 获取项目的所有工时项
  const projectWorkItems = store.getWorkItemsByProject(newProject.id)
  console.log('项目工时项:', projectWorkItems)

  // 11. 保存到本地存储
  store.saveToLocal()
  console.log('数据已保存到本地存储')

  // 12. 从本地存储加载
  store.loadFromLocal()
  console.log('数据已从本地存储加载')
}

// 数据查询示例
export const dataQueryExamples = () => {
  const store = useWeeklyReportStore()

  // 按部门获取用户
  const techUsers = store.getUsersByDepartment('技术部')
  console.log('技术部用户:', techUsers)

  // 获取活跃项目
  const activeProjects = store.getActiveProjects
  console.log('活跃项目:', activeProjects)

  // 获取特定年份的周报
  const yearReports = store.getReportsByYear(2024)
  console.log('2024年周报:', yearReports)

  // 获取特定周数的周报
  const weekReports = store.getReportsByYearAndWeek(2024, 1)
  console.log('2024年第1周周报:', weekReports)

  // 获取周报的工时项
  if (store.reports.length > 0) {
    const workItems = store.getWorkItemsByReport(store.reports[0].id)
    console.log('周报工时项:', workItems)
  }
}
