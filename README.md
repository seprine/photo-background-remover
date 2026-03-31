# 🖼️ Photo Background Remover

> 在线图片背景去除工具 - MVP

**特点：** 快、简、净 — 5秒去除背景，不存储任何图片

## 在线体验

（部署后填写地址）

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 原生 HTML/CSS/JS（零依赖）|
| 后端 | Cloudflare Worker |
| API | Remove.bg |

## 快速部署

### 1. 克隆项目

```bash
git clone https://github.com/seprine/photo-background-remover.git
cd photo-background-remover
```

### 2. 配置 Remove.bg API Key

1. 申请 API Key：https://www.remove.bg/api
2. 在 `worker/wrangler.toml` 中添加：

```toml
[vars]
REMOVE_BG_API_KEY = "你的API Key"
```

或在 Cloudflare Worker 控制台设置环境变量 `REMOVE_BG_API_KEY`

### 3. 部署 Worker

```bash
cd worker
npm install
npx wrangler deploy
```

部署后会返回 Worker URL，例如：`https://photo-background-remover.xxx.workers.dev`

### 4. 部署前端

#### 方式一：Cloudflare Pages

1. 上传 `frontend` 文件夹到 GitHub
2. 在 Cloudflare Pages 创建项目
3. 构建命令留空，输出目录设为 `/`
4. 在 Pages 设置中添加环境变量：
   - `VITE_API_ENDPOINT` = 你的 Worker URL

#### 方式二：其他静态托管

直接上传 `frontend/index.html`，将 `VITE_API_ENDPOINT` 指向你的 Worker 地址。

### 5. 配置自定义域名（可选）

在 Cloudflare 控制台将域名解析到 Worker / Pages。

## 项目结构

```
photo-background-remover/
├── worker/
│   ├── index.js        # Worker 主逻辑
│   └── wrangler.toml   # 部署配置
├── frontend/
│   └── index.html      # 前端页面
├── docs/
│   └── mvp.md          # MVP 需求文档
└── README.md
```

## 成本

| 服务 | 费用 |
|------|------|
| Cloudflare Worker | 免费（10万次/天）|
| Cloudflare Pages | 免费 |
| Remove.bg API | 免费50张/月，付费 ¥5/100张 |

## 开发

```bash
# 本地调试 Worker
cd worker
npx wrangler dev

# 前端无需构建，直接打开 index.html 即可
```

## 隐私

- 🚫 不存储任何用户图片
- 🚫 不使用 Cookie
- ✅ 图片处理完成后立即释放内存

---

MIT License
