# 周报表单按钮功能实现

## 功能概述

为周报表单底部实现了两个核心按钮功能：
1. **保存草稿**：点击后调用Store的saveToLocal方法，保存数据到localStorage
2. **提交**：点击后除了保存，还将本周报的状态(status)改为'已提交'

## 按钮设计

### 1. 按钮样式和图标

```vue
<el-form-item>
  <el-button type="success" @click="handleSubmit" :loading="submitting">
    <el-icon><Check /></el-icon>
    提交
  </el-button>
  <el-button type="primary" @click="handleSaveDraft" :loading="submitting">
    <el-icon><Document /></el-icon>
    保存草稿
  </el-button>
  <el-button @click="handleReset">
    <el-icon><Refresh /></el-icon>
    重置
  </el-button>
</el-form-item>
```

### 2. 图标导入

```typescript
import { Check, Document, Refresh } from '@element-plus/icons-vue'
```

## 核心功能实现

### 1. 提交按钮功能

```typescript
// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (formData.workItems.length === 0) {
      ElMessage.warning('请至少添加一个工时项')
      return
    }
    
    submitting.value = true
    
    if (isEdit.value) {
      // 更新周报
      const result = store.updateReport(editReportId.value, {
        summary: formData.summary,
        status: 'submitted' as any,
        workItems: formData.workItems
      })
      
      if (result) {
        // 保存到localStorage
        store.saveToLocal()
        ElMessage.success('周报提交成功！状态已更新为已提交')
        router.push('/report-list')
      } else {
        ElMessage.error('周报提交失败')
      }
    } else {
      // 创建新周报
      const result = store.addReport({
        userId: store.currentUser?.id || '',
        year: currentYear.value,
        week: currentWeek.value,
        summary: formData.summary,
        workItems: formData.workItems
      })
      
      if (result) {
        // 提交周报
        store.submitReport(result.id)
        // 保存到localStorage
        store.saveToLocal()
        ElMessage.success('周报提交成功！状态已更新为已提交')
        router.push('/report-list')
      } else {
        ElMessage.error('周报创建失败')
      }
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}
```

### 2. 保存草稿按钮功能

```typescript
// 保存草稿
const handleSaveDraft = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    if (isEdit.value) {
      // 更新草稿
      const result = store.updateReport(editReportId.value, {
        summary: formData.summary,
        status: 'draft' as any,
        workItems: formData.workItems
      })
      
      if (result) {
        // 保存到localStorage
        store.saveToLocal()
        ElMessage.success('草稿保存成功！数据已保存到本地')
      } else {
        ElMessage.error('草稿保存失败')
      }
    } else {
      // 创建草稿
      const result = store.addReport({
        userId: store.currentUser?.id || '',
        year: currentYear.value,
        week: currentWeek.value,
        summary: formData.summary,
        workItems: formData.workItems
      })
      
      if (result) {
        // 保存到localStorage
        store.saveToLocal()
        ElMessage.success('草稿保存成功！数据已保存到本地')
        // 不跳转，让用户继续编辑
      } else {
        ElMessage.error('草稿保存失败')
      }
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}
```

## 功能特性

### 1. 表单验证
- 提交前进行完整的表单验证
- 检查工时项数量（至少一个）
- 验证所有必填字段

### 2. 状态管理
- **保存草稿**：状态设置为'draft'（草稿）
- **提交**：状态设置为'submitted'（已提交）

### 3. 数据持久化
- 两个按钮都会调用`store.saveToLocal()`方法
- 数据自动保存到localStorage
- 页面刷新后数据不会丢失

### 4. 用户反馈
- 成功操作显示El-Message成功提示
- 失败操作显示错误提示
- 加载状态显示loading动画

### 5. 导航逻辑
- **提交成功**：跳转到周报列表页面
- **保存草稿**：不跳转，让用户继续编辑

## 成功提示信息

### 1. 提交成功
```typescript
ElMessage.success('周报提交成功！状态已更新为已提交')
```

### 2. 草稿保存成功
```typescript
ElMessage.success('草稿保存成功！数据已保存到本地')
```

### 3. 错误提示
```typescript
ElMessage.warning('请至少添加一个工时项')
ElMessage.error('周报提交失败')
ElMessage.error('草稿保存失败')
```

## 技术实现

### 1. 异步处理
- 使用async/await处理异步操作
- 统一的错误处理机制
- 加载状态管理

### 2. 条件逻辑
- 区分新建和编辑模式
- 根据操作类型设置不同状态
- 智能的导航逻辑

### 3. 数据同步
- 与Store状态同步
- 自动保存到localStorage
- 实时更新UI状态

## 使用流程

1. **用户填写周报**：填写总结和工时记录
2. **选择操作**：
   - 点击"保存草稿"：保存为草稿状态，继续编辑
   - 点击"提交"：提交为正式状态，跳转到列表页
3. **系统反馈**：显示相应的成功或错误提示
4. **数据持久化**：数据自动保存到localStorage

## 注意事项

1. 确保Store的saveToLocal方法正常工作
2. 表单验证规则需要完整
3. 错误处理要友好
4. 加载状态要清晰
5. 成功提示要明确

## 文件位置

- `src/views/ReportFormView.vue` - 周报填报页面
- `src/stores/weeklyReport.ts` - 数据管理Store
- `src/components/WorkItemsTable.vue` - 工时记录表格组件
