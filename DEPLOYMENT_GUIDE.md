# Vite项目构建和部署指南

## 📦 构建命令

### 1. 开发环境构建
```bash
# 进入项目目录
cd weekly-report-system

# 安装依赖
npm install

# 开发服务器
npm run dev
```

### 2. 生产环境构建
```bash
# 完整构建（包含类型检查）
npm run build

# 仅构建（跳过类型检查，推荐用于部署）
npm run build-only

# 预览构建结果
npm run preview
```

## 🏗️ 构建产物说明

构建完成后，会在 `dist` 目录下生成以下文件：

```
dist/
├── index.html                    # 主HTML文件
├── favicon.ico                   # 网站图标
└── assets/                       # 静态资源目录
    ├── index-DRy33ewS.js         # 主JavaScript包 (1.14MB)
    ├── index-r33KIGgw.css        # 主CSS样式 (348KB)
    ├── HomeView-DAw4rFEc.js      # 首页组件 (4.5KB)
    ├── HomeView-DDEq-OwQ.css     # 首页样式 (1.45KB)
    ├── ReportFormView-JyF1SBal.js # 周报表单组件 (6.45KB)
    ├── ReportFormView-DKgotNI5.css # 周报表单样式 (0.69KB)
    ├── ReportListView-DH2z3Bfg.js # 周报列表组件 (5.61KB)
    ├── ReportListView-Bj_qrywt.css # 周报列表样式 (1.83KB)
    ├── TestStore-BKEZQE2I.js     # 测试组件 (2.18KB)
    └── TestStore-DOzjJgXg.css    # 测试样式 (0.56KB)
```

### 文件说明

- **index.html**: 应用入口文件，包含所有必要的meta标签和资源引用
- **assets/index-*.js**: 主要的JavaScript包，包含Vue框架、Pinia状态管理、Element Plus等
- **assets/index-*.css**: 主要的CSS样式，包含Element Plus主题和全局样式
- **assets/*View-*.js**: 各个页面组件的代码分割包
- **assets/*View-*.css**: 各个页面组件的样式文件

## 🚀 部署到静态托管服务

### 1. GitHub Pages 部署

#### 方法一：使用 GitHub Actions（推荐）

1. **创建GitHub仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/weekly-report-system.git
   git push -u origin main
   ```

2. **创建GitHub Actions工作流**
   创建 `.github/workflows/deploy.yml`：
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       
       steps:
       - name: Checkout
         uses: actions/checkout@v3
       
       - name: Setup Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '20'
           cache: 'npm'
       
       - name: Install dependencies
         run: npm ci
       
       - name: Build
         run: npm run build-only
       
       - name: Deploy to GitHub Pages
         uses: peaceiris/actions-gh-pages@v3
         if: github.ref == 'refs/heads/main'
         with:
           github_token: ${{ secrets.GITHUB_TOKEN }}
           publish_dir: ./dist
   ```

3. **启用GitHub Pages**
   - 进入仓库的 Settings > Pages
   - Source 选择 "GitHub Actions"
   - 保存设置

#### 方法二：手动部署

1. **构建项目**
   ```bash
   npm run build-only
   ```

2. **推送到gh-pages分支**
   ```bash
   # 创建gh-pages分支
   git checkout --orphan gh-pages
   git rm -rf .
   cp -r dist/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

3. **配置GitHub Pages**
   - 进入仓库的 Settings > Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "gh-pages"
   - 保存设置

### 2. Netlify 部署

#### 方法一：拖拽部署（最简单）

1. **构建项目**
   ```bash
   npm run build-only
   ```

2. **拖拽部署**
   - 访问 [Netlify](https://netlify.com)
   - 登录账户
   - 将 `dist` 文件夹拖拽到部署区域
   - 等待部署完成

#### 方法二：Git集成部署

1. **连接GitHub仓库**
   - 登录 Netlify
   - 点击 "New site from Git"
   - 选择 GitHub 仓库
   - 配置构建设置：
     - Build command: `npm run build-only`
     - Publish directory: `dist`
     - Node version: `20`

2. **配置环境变量**
   - 在 Site settings > Environment variables 中添加必要的环境变量

#### 方法三：Netlify CLI

1. **安装Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录和部署**
   ```bash
   # 登录
   netlify login
   
   # 构建
   npm run build-only
   
   # 部署
   netlify deploy --prod --dir=dist
   ```

### 3. Vercel 部署

#### 方法一：Vercel CLI

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **部署**
   ```bash
   # 构建
   npm run build-only
   
   # 部署
   vercel --prod
   ```

#### 方法二：Git集成

1. **连接GitHub仓库**
   - 访问 [Vercel](https://vercel.com)
   - 导入 GitHub 仓库
   - 配置构建设置：
     - Framework Preset: Vite
     - Build Command: `npm run build-only`
     - Output Directory: `dist`

### 4. 其他静态托管服务

#### Surge.sh
```bash
# 安装
npm install -g surge

# 构建
npm run build-only

# 部署
surge dist your-domain.surge.sh
```

#### Firebase Hosting
```bash
# 安装Firebase CLI
npm install -g firebase-tools

# 初始化
firebase init hosting

# 构建
npm run build-only

# 部署
firebase deploy
```

## 🔧 SPA重定向配置

由于使用了Vue Router的history模式，需要配置服务器将所有路由重定向到 `index.html`。

### 1. Netlify配置

已创建 `public/_redirects` 文件：
```
/*    /index.html   200
```

### 2. Apache配置

已创建 `public/.htaccess` 文件：
```apache
Options -MultiViews
RewriteEngine On

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 3. Nginx配置

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### 4. Vercel配置

已创建 `vercel.json` 文件：
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 📊 性能优化建议

### 1. 代码分割优化

当前构建警告提示主包过大（1.14MB），建议优化：

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'echarts': ['echarts'],
          'utils': ['dayjs', 'xlsx']
        }
      }
    }
  }
})
```

### 2. 资源压缩

- 启用Gzip压缩
- 使用CDN加速
- 图片优化

### 3. 缓存策略

- 静态资源设置长期缓存
- HTML文件设置短期缓存
- 使用版本号控制缓存更新

## 🔍 部署检查清单

### 构建前检查
- [ ] 确保所有依赖已安装
- [ ] 检查环境变量配置
- [ ] 验证API端点配置
- [ ] 测试本地构建

### 部署后检查
- [ ] 访问网站首页
- [ ] 测试路由跳转
- [ ] 验证用户切换功能
- [ ] 测试数据备份功能
- [ ] 检查移动端响应式
- [ ] 验证localStorage功能

## 🐛 常见问题解决

### 1. 路由404问题
- 确保配置了正确的SPA重定向规则
- 检查服务器配置是否正确

### 2. 静态资源加载失败
- 检查base路径配置
- 确保资源路径正确

### 3. 环境变量问题
- 确保生产环境变量正确配置
- 检查变量名大小写

### 4. 构建失败
- 检查Node.js版本（推荐20.19+）
- 清除node_modules重新安装
- 检查TypeScript错误

## 📝 部署命令总结

```bash
# 1. 进入项目目录
cd weekly-report-system

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build-only

# 4. 预览构建结果
npm run preview

# 5. 部署到GitHub Pages
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main

# 6. 部署到Netlify
netlify deploy --prod --dir=dist

# 7. 部署到Vercel
vercel --prod
```

## 🎯 推荐部署方案

1. **开发阶段**: 使用 `npm run dev` 本地开发
2. **测试阶段**: 使用 `npm run preview` 本地预览
3. **生产部署**: 使用 `npm run build-only` 构建后部署到Netlify或Vercel
4. **持续集成**: 使用GitHub Actions自动部署

选择最适合您需求的部署方案，推荐使用Netlify或Vercel，它们对Vue SPA应用有很好的支持。
