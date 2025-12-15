# 五险一金计算器

一个基于 Next.js 和 Supabase 的多城市社保费用计算工具。

## 功能特性

- 支持多城市社保标准管理
- 批量员工工资数据导入
- 自动计算社保缴费基数和公司应缴金额
- 历史计算记录管理
- Excel 数据导入导出

## 技术栈

- **前端**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **数据库**: Supabase
- **文件处理**: xlsx
- **部署**: GitHub Actions

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd social-insurance-calculator
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local.example` 到 `.env.local` 并填入你的 Supabase 配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 4. 设置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在项目设置中获取 URL 和 API 密钥
3. 在 SQL 编辑器中执行 `database-schema.sql` 中的 SQL 语句

### 5. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 数据格式说明

### 城市社保标准 (cities.xlsx)

| 列名 | 类型 | 说明 | 示例 |
|------|------|------|------|
| city_name | 文本 | 城市名称 | 佛山 |
| year | 文本 | 年份 | 2024 |
| base_min | 数字 | 缴费基数下限 | 4546 |
| base_max | 数字 | 缴费基数上限 | 26421 |
| rate | 数字 | 综合缴纳比例 | 0.14 |

### 员工工资数据 (salaries.xlsx)

| 列名 | 类型 | 说明 | 示例 |
|------|------|------|------|
| employee_id | 文本 | 员工工号 | EMP001 |
| employee_name | 文本 | 员工姓名 | 张三 |
| month | 文本 | 年份月份 | 202401 |
| salary_amount | 数字 | 工资金额 | 10000 |

## 部署

### GitHub 部署

1. 推送代码到 GitHub
2. 在 Vercel 或其他平台连接你的仓库
3. 配置环境变量
4. 自动部署

### 手动部署

```bash
npm run build
npm start
```

## 项目结构

```
├── app/                    # Next.js App Router 页面
│   ├── upload/            # 数据上传页面
│   ├── results/           # 结果展示页面
│   └── history/           # 历史记录页面
├── lib/                   # 工具函数和配置
│   ├── supabase.ts       # Supabase 客户端配置
│   ├── calculations.ts   # 核心计算逻辑
│   └── utils.ts          # 通用工具函数
├── components/            # React 组件
└── public/               # 静态资源
    └── templates/        # Excel 模板文件
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如有问题或建议，请创建 [Issue](https://github.com/your-username/social-insurance-calculator/issues)。
