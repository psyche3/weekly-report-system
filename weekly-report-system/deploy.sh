#!/bin/bash

# 周报系统部署脚本
echo "🚀 开始部署周报系统..."

# 检查Node.js版本
echo "📋 检查Node.js版本..."
node --version

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🏗️ 构建项目..."
npm run build-only

# 检查构建结果
if [ -d "dist" ]; then
    echo "✅ 构建成功！"
    echo "📁 构建产物："
    ls -la dist/
    echo ""
    echo "📊 文件大小："
    du -sh dist/*
    echo ""
    echo "🎯 部署选项："
    echo "1. GitHub Pages: 将dist目录内容推送到gh-pages分支"
    echo "2. Netlify: 拖拽dist目录到Netlify部署区域"
    echo "3. Vercel: 运行 'vercel --prod' 命令"
    echo "4. 其他: 将dist目录上传到您的静态托管服务"
    echo ""
    echo "📖 详细部署说明请查看 DEPLOYMENT_GUIDE.md"
else
    echo "❌ 构建失败！请检查错误信息。"
    exit 1
fi
