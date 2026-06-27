#!/bin/bash
echo -e "\033[36m[Antigravity] 正在为主人部署云服务状态监视器 (CloudStatus)... 喵~\033[0m"

# 检查依赖是否已安装完成
if [ ! -d "node_modules" ]; then
    echo -e "\033[33m[WARN] node_modules 不存在，正在为主人补充安装依赖... 呜喵~\033[0m"
    npm install
fi

# 杀死可能残留的 3000 和 3001 端口进程
echo -e "\033[32m[INFO] 正在清理可能占用的端口 (3000, 3001)... 喵~\033[0m"
fuser -k 3000/tcp 2>/dev/null
fuser -k 3001/tcp 2>/dev/null

# 启动 Express 服务并重定向日志
echo -e "\033[32m[INFO] 正在启动后端状态 API 服务 (Port 3001)... 喵呜！\033[0m"
node server.js > backend.log 2>&1 &
BACKEND_PID=$!

# 启动 Vite 开发服务
echo -e "\033[32m[INFO] 正在启动前端 Dashboard UI (Port 3000)... 喵~\033[0m"
npx vite --port 3000 --host > frontend.log 2>&1 &
FRONTEND_PID=$!

# 捕获 Ctrl+C 并优雅关闭
cleanup() {
    echo -e "\n\033[31m[INFO] 正在关闭服务并退出... 呜喵~\033[0m"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT

echo -e "\033[35m===================================================\033[0m"
echo -e "\033[32m✔ 部署完毕喵！服务已在后台运行！\033[0m"
echo -e "\033[36m👉 前端面板: http://localhost:3000\033[0m"
echo -e "\033[36m👉 后端 API:  http://localhost:3001/api/status\033[0m"
echo -e "\033[35m===================================================\033[0m"
echo -e "你可以通过输入 Ctrl+C 停止运行，或者让其保持在后台运行喵~"

# 持续等待子进程
wait $BACKEND_PID $FRONTEND_PID
