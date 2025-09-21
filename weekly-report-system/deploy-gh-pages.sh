#!/bin/bash

# GitHub Pages 手动部署脚本
echo "🚀 开始部署到GitHub Pages..."

# 检查是否在正确的分支
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  当前不在main分支，正在切换到main分支..."
    git checkout main
fi

# 构建项目
echo "🏗️ 构建项目..."
npm run build-only

if [ ! -d "dist" ]; then
    echo "❌ 构建失败！dist目录不存在。"
    exit 1
fi

# 创建gh-pages分支（如果不存在）
echo "📝 准备gh-pages分支..."
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "gh-pages分支已存在，正在切换..."
    git checkout gh-pages
    git rm -rf .
else
    echo "创建新的gh-pages分支..."
    git checkout --orphan gh-pages
    git rm -rf .
fi

# 复制构建产物
echo "📦 复制构建产物..."
cp -r dist/* .
cp dist/.htaccess . 2>/dev/null || true
cp dist/_redirects . 2>/dev/null || true

# 添加文件到Git
echo "📝 添加文件到Git..."
git add .
git commit -m "Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"

# 推送到远程仓库
echo "🚀 推送到GitHub..."
git push origin gh-pages --force

# 切换回main分支
git checkout main

echo "✅ 部署完成！"
echo "🌐 您的网站将在几分钟后可用："
echo "   https://psyche3.github.io/weekly-report-system/"
echo ""
echo "📖 如果网站无法访问，请检查："
echo "   1. GitHub仓库的Settings > Pages设置"
echo "   2. Source选择'Deploy from a branch'"
echo "   3. Branch选择'gh-pages'"
