# 首页ECharts图表实现

## 功能概述

在首页(HomeView)使用ECharts创建了一个折线图，展示最近10周内用户每周的总工时变化趋势。X轴为周数（格式：WW周），Y轴为工时数。

## 核心功能

### 1. 图表展示
- 使用ECharts折线图展示工时趋势
- X轴：周数（格式：01周、02周...）
- Y轴：工时数（单位：小时）
- 图表高度：400px
- 响应式设计，自适应容器大小

### 2. 数据计算属性

#### lastTenWeeksData计算属性
```typescript
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
```

### 3. 图表配置

#### 基础配置
```typescript
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
```

## 技术实现

### 1. ECharts组件注册
```typescript
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

// 注册ECharts组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])
```

### 2. 模板使用
```vue
<div class="chart-container">
  <v-chart
    :option="chartOption"
    :style="{ height: '400px' }"
    @click="handleChartClick"
  />
</div>
```

### 3. 样式设计
```css
.chart-container {
  width: 100%;
  height: 400px;
}
```

## 数据流程

### 1. 数据获取
1. 检查当前用户是否存在
2. 获取当前日期
3. 循环获取最近10周的数据
4. 对每一周：
   - 计算年份和周数
   - 查找该用户的周报数据
   - 计算总工时数
   - 格式化周数显示

### 2. 数据处理
- 周数格式：`01周`、`02周`、`03周`...
- 工时数据：数字数组，对应每周的总工时
- 空数据处理：没有周报的周显示为0工时

### 3. 图表渲染
- 响应式计算属性自动更新图表
- 数据变化时图表自动重新渲染
- 支持图表交互（点击、悬停等）

## 图表特性

### 1. 视觉效果
- **折线图**：平滑曲线展示趋势
- **面积填充**：渐变填充增强视觉效果
- **颜色主题**：使用Element Plus主题色（#409EFF）
- **最大值标记**：绿色标记显示最高工时周

### 2. 交互功能
- **悬停提示**：显示具体周数和工时数
- **点击事件**：支持图表点击交互
- **响应式**：自适应容器大小变化

### 3. 数据展示
- **X轴**：周数标签（01周、02周...）
- **Y轴**：工时数（带单位h）
- **标题**：图表标题居中显示
- **网格**：辅助线帮助读取数据

## 功能特性

### 1. 实时数据
- 基于Store中的实时数据
- 自动计算最近10周
- 支持用户切换时数据更新

### 2. 数据完整性
- 处理缺失数据（显示为0）
- 支持空数据状态
- 数据类型安全处理

### 3. 用户体验
- 图表加载流畅
- 交互反馈及时
- 视觉设计统一

## 使用说明

### 1. 查看趋势
- 访问首页即可看到工时趋势图
- 图表显示最近10周的工时变化
- 悬停查看具体数值

### 2. 数据解读
- 上升趋势：工时增加
- 下降趋势：工时减少
- 平稳趋势：工时稳定
- 最大值标记：工时最高周

### 3. 交互操作
- 点击图表可触发事件
- 悬停查看详细数据
- 图表自适应窗口大小

## 技术依赖

### 1. 核心依赖
- `echarts`: 图表库
- `vue-echarts`: Vue 3 ECharts组件
- `dayjs`: 日期处理

### 2. 组件依赖
- `CanvasRenderer`: 渲染器
- `LineChart`: 折线图
- `TitleComponent`: 标题组件
- `TooltipComponent`: 提示框组件
- `GridComponent`: 网格组件

### 3. 插件依赖
- `weekOfYear`: 周数计算
- `isoWeek`: ISO周数标准

## 文件位置

- `src/views/HomeView.vue` - 首页组件（包含图表）
- `src/stores/weeklyReport.ts` - 数据管理Store
- `package.json` - 依赖配置

## 注意事项

1. 确保Store中有当前用户数据
2. 周报数据需要包含完整的workItems数组
3. 工时数计算需要处理数据类型转换
4. 图表容器需要固定高度
5. ECharts组件需要正确注册
6. 数据变化时图表会自动更新

## 扩展功能

### 1. 可扩展的图表类型
- 柱状图：对比不同周的工时
- 饼图：展示工时分布
- 散点图：分析工时规律

### 2. 可添加的交互
- 缩放功能：查看详细数据
- 数据筛选：按时间范围筛选
- 导出功能：导出图表图片

### 3. 可优化的显示
- 动画效果：数据加载动画
- 主题切换：支持深色模式
- 移动端适配：响应式设计优化
