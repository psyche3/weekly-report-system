import { useWeeklyReportStore } from '@/stores/weeklyReport'
import dayjs from 'dayjs'

// 初始化示例数据
export const initSampleData = () => {
  const store = useWeeklyReportStore()

  // 如果已有数据，不重复初始化
  if (store.users.length > 0) {
    return
  }

  // 添加示例用户
  const users = [
    {
      name: '张三',
      email: 'zhangsan@example.com',
      department: '技术部',
      position: '前端工程师'
    },
    {
      name: '李四',
      email: 'lisi@example.com',
      department: '技术部',
      position: '后端工程师'
    },
    {
      name: '王五',
      email: 'wangwu@example.com',
      department: '产品部',
      position: '产品经理'
    },
    {
      name: '赵六',
      email: 'zhaoliu@example.com',
      department: '设计部',
      position: 'UI设计师'
    }
  ]

  const createdUsers = users.map(user => store.addUser(user))

  // 添加示例项目
  const projects = [
    {
      name: '周报系统开发',
      description: '开发企业内部周报管理系统',
      status: 'active' as const,
      startDate: dayjs().subtract(2, 'month').format('YYYY-MM-DD')
    },
    {
      name: '移动端App优化',
      description: '优化移动端应用性能和用户体验',
      status: 'active' as const,
      startDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD')
    },
    {
      name: '数据分析平台',
      description: '构建企业数据分析平台',
      status: 'inactive' as const,
      startDate: dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
      endDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD')
    }
  ]

  const createdProjects = projects.map(project => store.addProject(project))

  // 添加示例周报
  const currentYear = dayjs().year()
  const currentWeek = dayjs().week()

  // 为每个用户创建最近几周的周报
  createdUsers.forEach((user, userIndex) => {
    for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
      const week = currentWeek - weekOffset
      const year = week > 0 ? currentYear : currentYear - 1
      const actualWeek = week > 0 ? week : 52 + week

      const report = store.addReport({
        userId: user.id,
        year,
        week: actualWeek,
        summary: `这是${user.name}第${actualWeek}周的工作总结`,
        workItems: [
          {
            projectId: createdProjects[0].id,
            taskDescription: '完成周报系统前端页面开发',
            workHours: 8,
            workDate: dayjs().subtract(weekOffset, 'week').format('YYYY-MM-DD')
          },
          {
            projectId: createdProjects[1].id,
            taskDescription: '优化移动端响应式布局',
            workHours: 6,
            workDate: dayjs().subtract(weekOffset, 'week').add(1, 'day').format('YYYY-MM-DD')
          }
        ]
      })

      // 随机设置一些周报为已提交状态
      if (Math.random() > 0.3) {
        store.submitReport(report.id)
      }
    }
  })

  // 设置当前用户
  if (createdUsers.length > 0) {
    store.setCurrentUser(createdUsers[0])
  }

  console.log('示例数据初始化完成')
}
