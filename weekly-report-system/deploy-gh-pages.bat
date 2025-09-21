@echo off
chcp 65001 >nul

REM GitHub Pages 手动部署脚本 (Windows)
echo 🚀 开始部署到GitHub Pages...

REM 检查是否在正确的分支
for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
if not "%current_branch%"=="main" (
    echo ⚠️  当前不在main分支，正在切换到main分支...
    git checkout main
)

REM 构建项目
echo 🏗️ 构建项目...
npm run build-only

if not exist "dist" (
    echo ❌ 构建失败！dist目录不存在。
    exit /b 1
)

REM 创建gh-pages分支（如果不存在）
echo 📝 准备gh-pages分支...
git show-ref --verify --quiet refs/heads/gh-pages
if %errorlevel%==0 (
    echo gh-pages分支已存在，正在切换...
    git checkout gh-pages
    git rm -rf .
) else (
    echo 创建新的gh-pages分支...
    git checkout --orphan gh-pages
    git rm -rf .
)

REM 复制构建产物
echo 📦 复制构建产物...
xcopy /E /I /Y dist\* .
if exist "dist\.htaccess" copy "dist\.htaccess" .
if exist "dist\_redirects" copy "dist\_redirects" .

REM 添加文件到Git
echo 📝 添加文件到Git...
git add .
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set mydate=%%c-%%a-%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a:%%b
git commit -m "Deploy to GitHub Pages - %mydate% %mytime%"

REM 推送到远程仓库
echo 🚀 推送到GitHub...
git push origin gh-pages --force

REM 切换回main分支
git checkout main

echo ✅ 部署完成！
echo 🌐 您的网站将在几分钟后可用：
echo    https://psyche3.github.io/weekly-report-system/
echo.
echo 📖 如果网站无法访问，请检查：
echo    1. GitHub仓库的Settings ^> Pages设置
echo    2. Source选择'Deploy from a branch'
echo    3. Branch选择'gh-pages'

pause
