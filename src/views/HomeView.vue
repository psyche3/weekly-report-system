<template>
  <div class="home-view">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <div class="welcome-content">
            <h1>欢迎使用周报系统</h1>
            <p>管理您的周报，跟踪工作进度</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="40" color="#409EFF">
                <User />
              </el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ userStats.totalUsers }}</h3>
              <p>总用户数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="40" color="#67C23A">
                <Document />
              </el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ reportStats.totalReports }}</h3>
              <p>总周报数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="40" color="#E6A23C">
                <Briefcase />
              </el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ projectStats.totalProjects }}</h3>
              <p>总项目数</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近10周工时趋势</span>
              <el-button type="primary" size="small" @click="$router.push('/report-list')">
                查看详情
              </el-button>
            </div>
          </template>
          <div class="chart-container">
            <v-chart
              :option="chartOption"
              :style="{ height: '400px' }"
              @click="handleChartClick"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近周报</span>
              <el-button type="primary" size="small" @click="$router.push('/report-list')">
                查看全部
              </el-button>
            </div>
          </template>
          <div v-if="recentReports.length === 0" class="empty-state">
            <el-empty description="暂无周报数据" />
          </div>
          <div v-else>
            <div v-for="report in recentReports" :key="report.id" class="report-item">
              <div class="report-info">
                <h4>{{ report.year }}年第{{ report.week }}周</h4>
                <p>{{ report.summary }}</p>
                <el-tag :type="report.status === 'submitted' ? 'success' : 'warning'">
                  {{ report.status === 'submitted' ? '已提交' : '草稿' }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>活跃项目</span>
              <el-button type="primary" size="small">
                管理项目
              </el-button>
            </div>
          </template>
          <div v-if="activeProjects.length === 0" class="empty-state">
            <el-empty description="暂无活跃项目" />
          </div>
          <div v-else>
            <div v-for="project in activeProjects" :key="project.id" class="project-item">
              <div class="project-info">
                <h4>{{ project.name }}</h4>
                <p>{{ project.description || '暂无描述' }}</p>
                <el-tag type="success">进行中</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快速操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" size="large" @click="$router.push('/report-form')">
              <el-icon><Edit /></el-icon>
              填报周报
            </el-button>
            <el-button type="success" size="large" @click="$router.push('/report-list')">
              <el-icon><List /></el-icon>
              查看历史
            </el-button>
            <el-button type="info" size="large">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useWeeklyReportStore } from '@/stores/weeklyReport'
import { User, Document, Briefcase, Edit, List, Setting } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

// 注册ECharts组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const store = useWeeklyReportStore()

// 统计数据
const userStats = computed(() => ({
  totalUsers: store.users.length
}))

const reportStats = computed(() => ({
  totalReports: store.reports.length
}))

const projectStats = computed(() => ({
  totalProjects: store.projects.length
}))

// 最近周报（最多显示5条）
const recentReports = computed(() => {
  return store.reports
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

// 活跃项目
const activeProjects = computed(() => {
  return store.getActiveProjects.slice(0, 5)
})

// 最近10周工时数据
const lastTenWeeksData = computed(() => {
  if (!store.currentUser) {
    return {
      weeks: [],
      hours: []
    }
  }

  const currentDate = dayjs()
  const weeks = []
  const hours = []

  // 获取最近10周的数据
  for (let i = 9; i >= 0; i--) {
    const targetDate = currentDate.subtract(i, 'week')
    const year = targetDate.year()
    const week = targetDate.isoWeek()
    
    // 查找该周是否有周报
    const report = store.reports.find(r => 
      r.userId === store.currentUser?.id && 
      r.year === year && 
      r.week === week
    )
    
    // 计算该周的总工时
    const totalHours = report ? report.workItems.reduce((sum: number, item: any) => {
      return sum + (Number(item.workHours) || 0)
    }, 0) : 0
    
    weeks.push(`${String(week).padStart(2, '0')}周`)
    hours.push(totalHours)
  }

  return {
    weeks,
    hours
  }
})

// 图表配置
const chartOption = computed(() => {
  const data = lastTenWeeksData.value
  
  return {
    title: {
      text: '最近10周工时趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        return `${data.axisValue}<br/>总工时: ${data.value} 小时`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.weeks,
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '工时(小时)',
      nameTextStyle: {
        fontSize: 12
      },
      axisLabel: {
        formatter: '{value}h',
        fontSize: 12
      }
    },
    series: [
      {
        name: '总工时',
        type: 'line',
        data: data.hours,
        smooth: true,
        lineStyle: {
          color: '#409EFF',
          width: 3
        },
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(64, 158, 255, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(64, 158, 255, 0.1)'
              }
            ]
          }
        },
        markPoint: {
          data: [
            {
              type: 'max',
              name: '最大值',
              symbol: 'pin',
              symbolSize: 50,
              itemStyle: {
                color: '#67C23A'
              }
            }
          ]
        }
      }
    ]
  }
})

// 图表点击事件
const handleChartClick = (params: any) => {
  console.log('图表点击:', params)
  // 可以在这里添加点击图表的逻辑，比如跳转到对应周的周报
}

onMounted(() => {
  // 初始化Store数据
  store.initializeStore()
})
</script>

<style scoped>
.home-view {
  padding: 20px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.welcome-content {
  text-align: center;
  padding: 20px;
}

.welcome-content h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: 300;
}

.welcome-content p {
  margin: 0;
  font-size: 1.2rem;
  opacity: 0.9;
}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  margin-right: 20px;
}

.stat-info h3 {
  margin: 0 0 5px 0;
  font-size: 2rem;
  font-weight: bold;
  color: #303133;
}

.stat-info p {
  margin: 0;
  color: #909399;
  font-size: 0.9rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 20px;
}

.report-item, .project-item {
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.report-item:last-child, .project-item:last-child {
  border-bottom: none;
}

.report-info h4, .project-info h4 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #303133;
}

.report-info p, .project-info p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 0.9rem;
  line-height: 1.4;
}

.quick-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.quick-actions .el-button {
  min-width: 150px;
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>