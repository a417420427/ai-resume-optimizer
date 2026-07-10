# 📄 AI 简历优化系统

> 上传简历，AI 智能分析 ATS 评分、优化内容、匹配关键词，帮你通过简历筛选。

---

## 功能概览

### 🎯 核心功能

| 功能 | 说明 |
|------|------|
| **📤 简历上传** | 支持 PDF / DOCX / TXT 格式，最大 10MB |
| **📊 ATS 评分** | AI 模拟机器筛选，0-100 分，评估简历通过率 |
| **✏️ 内容优化** | AI 重写简历内容，突出亮点，量化成果 |
| **🔑 关键词分析** | 匹配/缺失行业关键词，提高 ATS 通过率 |
| **💡 优化建议** | severity 分级（高/中/低），涵盖内容、格式、关键词、ATS 四类 |
| **💬 AI 对话** | 针对简历进行问答，获取针对性建议 |
| **📥 下载导出** | 支持 DOCX / PDF / Markdown / TXT 格式 |
| **🎨 模板选择** | 三种模板：现代简约、经典商务、极简风格 |
| **👤 用户系统** | 注册/登录，JWT 认证，免费 3 次 / VIP 无限 |

### 🖥️ 支持的终端

| 终端 | 状态 | 技术 |
|------|------|------|
| **Web 端** | ✅ 已完成 | React + TypeScript + Ant Design |
| **微信小程序** | ✅ 已完成 | 微信原生小程序 |
| **API** | ✅ 已完成 | FastAPI + Swagger 文档 |

### 🎨 模板样式

| 模板 | 特点 | 色系 |
|------|------|------|
| **现代简约** | 蓝色调，干净利落 | 蓝 #1897FF |
| **经典商务** | 深色系，正式稳重 | 深蓝灰 #2C3E50 |
| **极简风格** | 中性灰，简洁大方 | 中性灰 #555555 |

### 🤖 AI 优化输出

上传简历后，AI 返回以下内容：

1. **ATS 评分** — 模拟招聘系统评分，附带分数说明
2. **优化后的简历全文** — 保留原有信息，优化表述和结构
3. **优化建议列表** — 每条建议有类型和严重程度标签
4. **关键词分析** — 已匹配关键词 + 缺失关键词 + 覆盖率
5. **ATS 兼容性建议** — 格式、排版、关键词布局建议

---

## 技术栈

| 层 | 技术 |
|----|------|
| **后端** | Python 3.9+ / FastAPI / SQLAlchemy / SQLite |
| **前端 Web** | React 18 / TypeScript / Vite / Ant Design 5 |
| **小程序** | 微信原生小程序 |
| **AI** | DeepSeek API / OpenAI API（可配置） |
| **文档生成** | python-docx（DOCX）/ ReportLab（PDF） |
| **文件解析** | PyMuPDF（PDF）/ python-docx（DOCX） |

---

## 快速启动

### 1. 后端

```bash
cd backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 配置 API Key
cp .env.example .env
vim .env   # 填入 DEEPSEEK_API_KEY 或 OPENAI_API_KEY

# 启动服务
uvicorn app.main:app --reload --port 8001
```

API 文档：http://localhost:8001/docs

### 2. 前端 Web

```bash
cd frontend
npm install
npm run dev
```

访问：http://localhost:3000

### 3. 微信小程序

用微信开发者工具打开 `miniapp/` 目录，修改 `utils/api.js` 中的 `BASE_URL` 为你的服务器地址。

---

## 项目结构

```
ai-resume-optimizer/
├── backend/                    # Python FastAPI 后端
│   ├── app/
│   │   ├── main.py             # 入口
│   │   ├── api/v1/             # REST API
│   │   │   ├── auth.py         # 注册/登录
│   │   │   ├── resume.py       # 简历上传/优化/下载/聊天
│   │   │   └── user.py         # 用户信息
│   │   ├── core/               # 配置/数据库/安全
│   │   ├── models/             # User, Resume, OptimizationResult
│   │   ├── schemas/            # Pydantic 请求/响应模型
│   │   └── services/           # 业务逻辑
│   │       ├── ai_service.py   # AI 简历优化（DeepSeek/OpenAI）
│   │       ├── auth_service.py # 用户认证
│   │       ├── doc_service.py  # DOCX/PDF 文档生成
│   │       └── file_service.py # 文件上传/文本提取
│   └── requirements.txt
│
├── frontend/                   # React Web 端
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx        # 主页（上传+优化结果）
│       │   ├── Login.tsx       # 登录/注册
│       │   ├── History.tsx     # 历史记录（含下载）
│       │   └── ResultDetail.tsx # 优化结果详情
│       ├── components/
│       │   └── AppLayout.tsx   # 全局布局
│       ├── services/api.ts     # API 封装
│       ├── hooks/useAuth.ts    # 认证 Hook
│       └── types/index.ts      # TypeScript 类型
│
├── miniapp/                    # 微信小程序
│   ├── pages/
│   │   ├── index/              # 首页
│   │   ├── login/              # 登录/注册
│   │   ├── upload/             # 上传简历+结果
│   │   └── result/             # 历史记录
│   ├── utils/api.js            # 小程序 API 封装
│   └── app.json
│
└── README.md
```

---

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/register` | 注册 |
| POST | `/api/v1/auth/login` | 登录 |
| GET | `/api/v1/user/me` | 用户信息 |
| POST | `/api/v1/resume/upload` | 上传简历 + AI 优化 |
| GET | `/api/v1/resume/history` | 历史记录 |
| GET | `/api/v1/resume/result/{id}` | 优化结果详情 |
| POST | `/api/v1/resume/chat/{id}` | AI 对话问答 |
| GET | `/api/v1/resume/download/{id}?fmt=docx&template=modern` | 下载 DOCX/PDF |
| GET | `/api/v1/resume/templates` | 获取可用模板列表 |

### 上传参数

| 参数 | 类型 | 说明 |
|------|------|------|
| file | File | 简历文件（PDF/DOCX/TXT） |
| target_position | string | 目标职位（选填） |
| target_industry | string | 目标行业（选填） |
| language | string | zh / en |
| tone | string | professional / concise / creative |

### 下载参数

| 参数 | 类型 | 说明 |
|------|------|------|
| fmt | string | docx / pdf |
| template | string | modern / classic / minimal |

---

## 免费 / VIP 策略

- **免费用户**：3 次优化机会
- **VIP 用户**：无限次优化
- VIP 功能需在数据库手动标记（`users.is_vip = true`）

---

## 开发环境

- macOS / Linux
- Python 3.9+
- Node.js 20+
- 微信开发者工具（小程序开发）
