# 周报系统 (Weekly Report System)

一个基于Vue 3 + Vite + Element Plus的现代化周报管理系统。

## ✨ 功能特性

- 📊 **仪表盘**: 工时趋势图表和统计信息
- 📝 **周报填报**: 支持动态添加工时记录
- 📋 **历史查看**: 周报列表和详情查看
- 👥 **多用户支持**: 用户切换和数据隔离
- 💾 **数据备份**: JSON格式导出/导入
- 📱 **响应式设计**: 完美适配移动端
- 🎨 **现代UI**: 基于Element Plus的美观界面

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build-only

# 预览构建结果
npm run preview
```

### 部署到GitHub Pages

#### 方法一：自动部署（推荐）

1. 推送代码到main分支
2. GitHub Actions会自动构建并部署
3. 访问：https://psyche3.github.io/weekly-report-system/

#### 方法二：手动部署

**Windows用户：**
```bash
# 运行部署脚本
deploy-gh-pages.bat
```

**Linux/Mac用户：**
```bash
# 给脚本执行权限
chmod +x deploy-gh-pages.sh

# 运行部署脚本
./deploy-gh-pages.sh
```

#### 方法三：其他平台部署

- **Netlify**: 拖拽`dist`文件夹到Netlify
- **Vercel**: 使用`vercel --prod`命令
- **其他**: 参考`DEPLOYMENT_GUIDE.md`

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **UI组件库**: Element Plus
- **图表库**: ECharts
- **日期处理**: Day.js
- **Excel导出**: xlsx
- **路由**: Vue Router
- **样式**: CSS3 + 响应式设计

## 📁 项目结构

```
src/
├── components/          # 公共组件
│   ├── Layout.vue      # 主布局组件
│   └── WorkItemsTable.vue # 工时记录表格
├── views/              # 页面组件
│   ├── HomeView.vue    # 首页仪表盘
│   ├── ReportFormView.vue # 周报填报页
│   ├── ReportListView.vue # 周报历史页
│   └── TestStore.vue   # 测试页面
├── stores/             # 状态管理
│   └── weeklyReport.ts # 周报Store
├── router/             # 路由配置
│   └── index.ts
├── types/              # 类型定义
│   └── index.ts
├── utils/              # 工具函数
│   ├── initData.ts     # 初始化数据
│   └── storeExample.ts # Store使用示例
└── assets/             # 静态资源
```

## 🔧 配置说明

### 环境要求

- Node.js 20.19+ 或 22.12+
- npm 或 yarn

### 构建配置

项目使用Vite构建，配置文件为`vite.config.ts`：

```typescript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

### 路由配置

使用Vue Router的history模式，需要配置服务器重定向：

- **Netlify**: `public/_redirects`
- **Apache**: `public/.htaccess`
- **Vercel**: `vercel.json`

## 📊 数据存储

- **本地存储**: 使用localStorage持久化数据
- **用户隔离**: 每个用户的数据独立存储
- **数据格式**: JSON格式，支持导入/导出

## 🎨 界面预览

- **首页**: 工时趋势图表和快速操作
- **填报页**: 周次选择、工时记录表格
- **列表页**: 历史周报列表和详情查看
- **移动端**: 响应式布局，抽屉式菜单

## 🔍 开发指南

### 添加新功能

1. 在`src/types/index.ts`中定义类型
2. 在`src/stores/weeklyReport.ts`中添加状态管理
3. 在`src/views/`中创建页面组件
4. 在`src/router/index.ts`中配置路由

### 样式规范

- 使用Element Plus组件
- 遵循响应式设计原则
- 保持一致的视觉风格

### 代码规范

- 使用TypeScript严格模式
- 遵循Vue 3 Composition API
- 保持代码简洁和可读性

## 🐛 问题排查

### 常见问题

1. **构建失败**: 检查Node.js版本和依赖安装
2. **路由404**: 确保配置了SPA重定向
3. **数据丢失**: 检查localStorage是否被清除
4. **移动端问题**: 检查响应式样式

### 调试工具

- Vue DevTools浏览器扩展
- 浏览器开发者工具
- 控制台日志输出

## 📝 更新日志

### v1.0.0 (2024-01-15)
- ✨ 初始版本发布
- 🎯 基础周报管理功能
- 📱 响应式设计
- 💾 数据备份功能

## 🤝 贡献指南

1. Fork本项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

- 项目地址: https://github.com/psyche3/weekly-report-system
- 在线演示: https://psyche3.github.io/weekly-report-system/

---

⭐ 如果这个项目对您有帮助，请给个Star支持一下！