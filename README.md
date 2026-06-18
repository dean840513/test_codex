# Cloudflare Pages + Pages Functions + D1 测试商城

这是一个无外部服务器的测试酒类商城：静态页面由 Cloudflare Pages 托管，接口由 Pages Functions 提供，数据持久化到 Cloudflare D1。

## 功能

- 商品列表与商品详情
- 模拟登录（固定测试用户 `demo@example.com`）
- 模拟下单并扣减商品库存
- 购买后自动加入“我的酒窖”
- 从酒窖中选择藏品并转售上架

## 本地运行

```bash
npm install
npm run db:migrate:local
npm run dev
```

打开 Wrangler 输出的本地地址即可体验商城。


## Cloudflare Pages 构建设置

在 Cloudflare Pages 通过 GitHub 同步仓库时，请使用 Pages 的静态站点构建流程，不要把部署命令设置为 `npx wrangler deploy`。`wrangler deploy` 是 Workers 部署命令，会要求 Worker 入口文件或 assets 配置，不能正确部署本项目的 Pages Functions。

推荐设置：

| 设置项 | 值 |
| --- | --- |
| Framework preset | `None` |
| Build command | `npm run build` 或 `bun run build` |
| Build output directory | `public` |
| Deploy command | 留空；如果界面必须填写，请使用 `npx wrangler pages deploy public` |

`npm run build` 只校验 `public` 输出目录是否存在，因为本项目是原生静态页面，不需要打包步骤。

## 部署到 Cloudflare Pages

1. 创建 D1 数据库：
   ```bash
   npx wrangler d1 create shop-db
   ```
2. 将输出的 `database_id` 填入 `wrangler.toml`。
3. 执行远端迁移：
   ```bash
   npm run db:migrate:remote
   ```
4. 在 Cloudflare Pages 项目中绑定 D1，binding 名称必须为 `DB`。
5. 部署 Pages 项目，构建输出目录为 `public`。
