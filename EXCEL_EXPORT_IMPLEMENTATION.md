# Excel导出功能实现

## 功能概述

为周报历史列表页面添加了Excel导出功能，使用xlsx库将Pinia Store中reports数组的数据转换成工作表，并生成包含"周报数据"工作表的Excel文件，浏览器自动下载。

## 核心功能

### 1. 导出按钮
- 在历史列表页面头部添加"导出Excel"按钮
- 绿色按钮，带下载图标
- 支持加载状态显示

### 2. 导出函数

#### exportToExcel函数
```typescript
const exportToExcel = async () => {
  try {
    exporting.value = true
    
    // 获取当前用户的周报数据
    const userReports = store.reports.filter(report => 
      store.currentUser && report.userId === store.currentUser.id
    )
    
    if (userReports.length === 0) {
      ElMessage.warning('暂无周报数据可导出')
      return
    }
    
    // 准备Excel数据
    const excelData = userReports.map((report, index) => {
      // 计算总工时
      const totalHours = report.workItems.reduce((sum: number, item: any) => {
        return sum + (Number(item.workHours) || 0)
      }, 0)
      
      // 获取项目名称
      const getProjectName = (projectId: string) => {
        const project = store.projects.find(p => p.id === projectId)
        return project ? project.name : '未知项目'
      }
      
      // 格式化工时明细
      const workItemsDetail = report.workItems.map((item: any, itemIndex: number) => {
        return `${itemIndex + 1}. ${getProjectName(item.projectId)} - ${item.taskDescription} (${item.workHours}小时)`
      }).join('\n')
      
      return {
        '序号': index + 1,
        '周数': `${report.year}年第${String(report.week).padStart(2, '0')}周`,
        '状态': report.status === 'submitted' ? '已提交' : '草稿',
        '周报总结': report.summary || '暂无总结',
        '总工时': totalHours,
        '工时项数': report.workItems.length,
        '工时明细': workItemsDetail,
        '创建时间': dayjs(report.createdAt).format('YYYY-MM-DD HH:mm'),
        '更新时间': dayjs(report.updatedAt).format('YYYY-MM-DD HH:mm')
      }
    })
    
    // 创建工作簿
    const wb = XLSX.utils.book_new()
    
    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(excelData)
    
    // 设置列宽
    const colWidths = [
      { wch: 8 },   // 序号
      { wch: 15 },  // 周数
      { wch: 10 },  // 状态
      { wch: 30 },  // 周报总结
      { wch: 10 },  // 总工时
      { wch: 10 },  // 工时项数
      { wch: 50 },  // 工时明细
      { wch: 20 },  // 创建时间
      { wch: 20 }   // 更新时间
    ]
    ws['!cols'] = colWidths
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '周报数据')
    
    // 生成文件名
    const currentDate = dayjs().format('YYYY-MM-DD')
    const fileName = `周报导出_${currentDate}.xlsx`
    
    // 导出文件
    XLSX.writeFile(wb, fileName)
    
    ElMessage.success(`Excel文件已导出：${fileName}`)
    
  } catch (error) {
    console.error('导出Excel失败:', error)
    ElMessage.error('导出Excel失败，请重试')
  } finally {
    exporting.value = false
  }
}
```

## 技术实现

### 1. 依赖导入
```typescript
import * as XLSX from 'xlsx'
import { Download } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
```

### 2. 状态管理
```typescript
// 导出相关
const exporting = ref(false)
```

### 3. 按钮模板
```vue
<el-button type="success" @click="exportToExcel" :loading="exporting">
  <el-icon><Download /></el-icon>
  导出Excel
</el-button>
```

## Excel文件结构

### 1. 工作表名称
- 工作表名称：`周报数据`

### 2. 列结构
| 列名 | 宽度 | 内容 | 说明 |
|------|------|------|------|
| 序号 | 8 | 数字 | 自动编号 |
| 周数 | 15 | 文本 | 格式：YYYY年第WW周 |
| 状态 | 10 | 文本 | 已提交/草稿 |
| 周报总结 | 30 | 文本 | 周报总结内容 |
| 总工时 | 10 | 数字 | 该周总工时数 |
| 工时项数 | 10 | 数字 | 工时项数量 |
| 工时明细 | 50 | 文本 | 详细工时记录 |
| 创建时间 | 20 | 文本 | YYYY-MM-DD HH:mm |
| 更新时间 | 20 | 文本 | YYYY-MM-DD HH:mm |

### 3. 数据格式

#### 周数格式
```typescript
'周数': `${report.year}年第${String(report.week).padStart(2, '0')}周`
// 示例：2024年第13周
```

#### 状态格式
```typescript
'状态': report.status === 'submitted' ? '已提交' : '草稿'
```

#### 工时明细格式
```typescript
const workItemsDetail = report.workItems.map((item: any, itemIndex: number) => {
  return `${itemIndex + 1}. ${getProjectName(item.projectId)} - ${item.taskDescription} (${item.workHours}小时)`
}).join('\n')
// 示例：
// 1. 项目A - 开发新功能 (8小时)
// 2. 项目B - 编写测试 (4小时)
```

## 功能特性

### 1. 数据过滤
- 只导出当前用户的周报数据
- 自动过滤其他用户的周报

### 2. 数据完整性
- 包含所有周报字段
- 自动计算总工时
- 格式化时间显示
- 处理空数据情况

### 3. 文件命名
- 格式：`周报导出_YYYY-MM-DD.xlsx`
- 示例：`周报导出_2024-01-15.xlsx`
- 使用当前日期

### 4. 用户体验
- 加载状态显示
- 成功/失败提示
- 空数据提示
- 错误处理

## 数据流程

### 1. 数据准备
1. 检查当前用户是否存在
2. 过滤当前用户的周报数据
3. 检查是否有数据可导出
4. 处理每个周报的数据

### 2. 数据转换
1. 计算总工时
2. 获取项目名称
3. 格式化工时明细
4. 格式化时间显示
5. 转换状态显示

### 3. Excel生成
1. 创建工作簿
2. 创建工作表
3. 设置列宽
4. 添加数据
5. 生成文件

### 4. 文件下载
1. 生成文件名
2. 触发浏览器下载
3. 显示成功提示

## 错误处理

### 1. 数据检查
```typescript
if (userReports.length === 0) {
  ElMessage.warning('暂无周报数据可导出')
  return
}
```

### 2. 异常捕获
```typescript
try {
  // 导出逻辑
} catch (error) {
  console.error('导出Excel失败:', error)
  ElMessage.error('导出Excel失败，请重试')
} finally {
  exporting.value = false
}
```

### 3. 加载状态
```typescript
const exporting = ref(false)

// 开始导出
exporting.value = true

// 完成导出
exporting.value = false
```

## 使用说明

### 1. 导出操作
1. 访问周报历史列表页面
2. 点击"导出Excel"按钮
3. 等待导出完成
4. 浏览器自动下载文件

### 2. 文件使用
1. 打开下载的Excel文件
2. 查看"周报数据"工作表
3. 数据按时间顺序排列
4. 包含完整的周报信息

### 3. 数据解读
- 序号：周报编号
- 周数：对应的年份和周数
- 状态：草稿或已提交
- 总工时：该周所有工时项的总和
- 工时明细：详细的工时记录

## 技术依赖

### 1. 核心依赖
- `xlsx`: Excel文件处理库
- `dayjs`: 日期格式化
- `element-plus`: UI组件库

### 2. 功能依赖
- Pinia Store: 数据源
- Vue 3: 响应式框架
- 浏览器: 文件下载支持

## 文件位置

- `src/views/ReportListView.vue` - 周报历史列表页面（包含导出功能）
- `src/stores/weeklyReport.ts` - 数据管理Store
- `package.json` - 依赖配置

## 注意事项

1. 确保xlsx库已正确安装
2. 需要当前用户登录才能导出
3. 导出的是当前用户的数据
4. 文件下载依赖浏览器支持
5. 大量数据导出可能需要时间
6. 工时明细使用换行符分隔

## 扩展功能

### 1. 可添加的导出选项
- 按时间范围筛选导出
- 按状态筛选导出
- 选择导出字段
- 自定义文件名

### 2. 可优化的功能
- 导出进度显示
- 批量导出多个用户
- 导出为其他格式（CSV、PDF）
- 定时自动导出

### 3. 可增强的体验
- 导出预览
- 导出历史记录
- 导出模板定制
- 导出数据验证
