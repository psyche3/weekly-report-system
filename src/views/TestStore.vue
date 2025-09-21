<template>
  <div class="test-store">
    <h1>周报系统 Store 测试</h1>
    
    <div class="section">
      <h2>用户管理</h2>
      <button @click="addTestUser">添加测试用户</button>
      <button @click="addTestProject">添加测试项目</button>
      <button @click="addTestReport">添加测试周报</button>
    </div>

    <div class="section">
      <h2>数据统计</h2>
      <p>用户数量: {{ store.users.length }}</p>
      <p>项目数量: {{ store.projects.length }}</p>
      <p>周报数量: {{ store.reports.length }}</p>
      <p>当前用户: {{ store.currentUser?.name || '未设置' }}</p>
    </div>

    <div class="section">
      <h2>用户列表</h2>
      <ul>
        <li v-for="user in store.users" :key="user.id">
          {{ user.name }} - {{ user.email }} ({{ user.department }})
        </li>
      </ul>
    </div>

    <div class="section">
      <h2>项目列表</h2>
      <ul>
        <li v-for="project in store.projects" :key="project.id">
          {{ project.name }} - {{ project.status }}
        </li>
      </ul>
    </div>

    <div class="section">
      <h2>周报列表</h2>
      <ul>
        <li v-for="report in store.reports" :key="report.id">
          {{ report.year }}年第{{ report.week }}周 - {{ report.summary }} ({{ report.status }})
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWeeklyReportStore } from '@/stores/weeklyReport'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

const store = useWeeklyReportStore()

const addTestUser = () => {
  const user = store.addUser({
    name: '测试用户',
    email: 'test@example.com',
    department: '技术部',
    position: '开发工程师'
  })
  console.log('添加用户:', user)
}

const addTestProject = () => {
  const project = store.addProject({
    name: '测试项目',
    description: '这是一个测试项目',
    status: 'active',
    startDate: dayjs().format('YYYY-MM-DD')
  })
  console.log('添加项目:', project)
}

const addTestReport = () => {
  if (store.users.length === 0) {
    alert('请先添加用户')
    return
  }
  
  const report = store.addReport({
    userId: store.users[0].id,
    year: dayjs().year(),
    week: dayjs().isoWeek(),
    summary: '测试周报内容',
    workItems: [
      {
        projectId: store.projects[0]?.id || 'test-project',
        taskDescription: '测试任务',
        workHours: 8,
        workDate: dayjs().format('YYYY-MM-DD')
      }
    ]
  })
  console.log('添加周报:', report)
}
</script>

<style scoped>
.test-store {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.section h2 {
  margin-top: 0;
  color: #333;
}

button {
  margin-right: 10px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 8px;
  margin: 4px 0;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style>