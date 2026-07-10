# 📄 AI 简历优化系统

上传简历，AI 自动分析 ATS 评分、优化内容和关键词匹配，助你通过简历筛选。

## 技术栈

| 端 | 技术 |
|----|------|
| **后端** | Python FastAPI + SQLAlchemy + SQLite |
| **前端 Web** | React 18 + TypeScript + Ant Design 5 + Vite |
| **小程序** | 微信原生小程序 |
| **AI** | DeepSeek / OpenAI API |

## 快速启动

### 1. 后端

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 配置 API Key（编辑 .env 文件）
# vim .env

uvicorn app.main:app --reload --port 8000
```

API 文档：http://localhost:8000/docs

### 2. 前端 Web

```bash
cd frontend
npm install
npm run dev
```

访问：http://localhost:3000

### 3. 小程序

用微信开发者工具打开 `miniapp/` 目录，修改 `utils/api.js` 中的 `BASE_URL` 为你的服务器地址。

## 功能

- ✅ **ATS 评分** - AI 模拟机器筛选，0-100 分
- ✅ **内容优化** - AI 重写简历内容，突出亮点
- ✅ **关键词分析** - 匹配/缺失关键词，提高通过率
- ✅ **格式建议** - ATS 友好的排版建议
- ✅ **AI 对话** - 针对简历进行问答
- ✅ **全端覆盖** - Web + 小程序

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/register` | 注册 |
| POST | `/api/v1/auth/login` | 登录 |
| GET | `/api/v1/user/me` | 用户信息 |
| POST | `/api/v1/resume/upload` | 上传简历并优化 |
| GET | `/api/v1/resume/history` | 历史记录 |
| GET | `/api/v1/resume/result/{id}` | 获取优化结果 |
| POST | `/api/v1/resume/chat/{id}` | AI 对话 |

## 免费 / VIP

- **免费用户**：3 次优化
- **VIP 用户**：无限次优化 + 高级功能（开发中）
