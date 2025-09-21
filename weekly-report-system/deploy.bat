@echo off
chcp 65001 >nul

REM 周报系统部署脚本 (Windows)
echo 🚀 开始部署周报系统...

REM 检查Node.js版本
echo 📋 检查Node.js版本...
node --version

REM 安装依赖
echo 📦 安装依赖...
npm install

REM 构建项目
echo 🏗️ 构建项目...
npm run build-only

REM 检查构建结果
if exist "dist" (
    echo ✅ 构建成功！
    echo 📁 构建产物：
    dir dist
    echo.
    echo 📊 文件大小：
    for /f "tokens=3" %%a in ('dir dist /s /-c ^| find "个文件"') do echo 总计: %%a 字节
    echo.
    echo 🎯 部署选项：
    echo 1. GitHub Pages: 将dist目录内容推送到gh-pages分支
    echo 2. Netlify: 拖拽dist目录到Netlify部署区域
    echo 3. Vercel: 运行 'vercel --prod' 命令
    echo 4. 其他: 将dist目录上传到您的静态托管服务
    echo.
    echo 📖 详细部署说明请查看 DEPLOYMENT_GUIDE.md
) else (
    echo ❌ 构建失败！请检查错误信息。
    exit /b 1
)

pause
