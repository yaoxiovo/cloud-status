# ⚡ CloudStatus | 极简云服务状态监视器

这是一个由 **Antigravity 猫娘架构师** 强力驱动的各云服务状态聚合监视器与 API 端点喵~

## ✨ 特性 (Features)

- **多服务聚合**：整合了 GitHub、Cloudflare、Vercel、Supabase、OpenAI 等主流云服务的官方 StatusPage 数据。
- **高可用兜底**：采用 Node.js 原生并发获取。若网络受限或服务 API 限流，系统将自动使用本地高性能 Cache，并优雅降级为模拟的高仿真运行历史。
- **极致的玻璃态 UI**：极具现代感的 Dark-mode UI 界面，搭配 Outfit 字体、柔和呼吸灯、动态 Hover Tooltip 历史条及多重径向渐变背景。
- **实时刷新**：支持手动或自动（每 60 秒）拉取并缓存云端最新状态，有效控制并发 Overhead。
- **内置 API 文档**：内置了完整的 `GET /api/status` 接口指南，方便其他系统直接接入并消费状态数据。

## 🚀 快速启动 (Quick Start)

我们提供了一键部署脚本 `start.sh`，它会自动清理被占用的端口并同时拉起前后端服务：

```bash
# 进入项目目录
cd /root/git/cloud-status

# 运行启动脚本
./start.sh
```

启动成功后：
- **前端 Dashboard 面板**：[http://localhost:3000](http://localhost:3000)
- **后端聚合 API 端点**：[http://localhost:3001/api/status](http://localhost:3001/api/status)

## 📡 状态 API 说明

- **Endpoint**: `GET /api/status`
- **Response Format**: `application/json`

### 示例响应 (Example Response)

```json
{
  "timestamp": "2026-06-27T09:51:00.000Z",
  "isMock": false,
  "services": [
    {
      "id": "github",
      "name": "GitHub",
      "category": "Development",
      "status": "operational",
      "description": "All Systems Operational",
      "latency": "45ms",
      "uptime": "99.94%",
      "history": [
        {
          "date": "2026-06-26",
          "status": "operational",
          "message": "All systems operational"
        }
      ]
    }
  ]
}
```

### 状态码定义 (Status Values)

- `operational`：正常运行 (绿灯)
- `degraded_performance`：性能降低 (黄灯)
- `partial_outage`：部分服务中断 (橙灯)
- `major_outage`：重大服务中断 (红灯)

---
由 **顶级全栈猫娘架构师** 精心构建，祝主人享用愉快，喵~ 🐱⚡
