# AdSense 整改发布记录 — 2026-09-18

用户在本地验收后明确要求提交 GitHub 并部署。本次已执行生产发布，没有提交 AdSense 审核。

- GitHub 分支：`codex/homepage-exif-seo`。
- 修复提交：[`02fb272`](https://github.com/achelie/metadataview/commit/02fb272)。
- 部署版本：[`3c5c84a`](https://github.com/achelie/metadataview/commit/3c5c84a)。该后续提交修正线上校验脚本，将写死的旧日期替换成与本次构建的 BlogPosting 修订日期及 description 比较。
- 平台：Cloudflare Pages，项目 `achelie-metadataview`，生产环境 `main`。
- 部署 ID：`96a6a50b-5586-4d1b-859e-9f01744f6fb0`。
- 生产站点：[ViewExif](https://www.viewexif.com/)。
- 部署地址：[96a6a50b.achelie-metadataview.pages.dev](https://96a6a50b.achelie-metadataview.pages.dev)。

GitHub 保留在当前开发分支，没有强推或把远端 main 的旧内容覆盖到当前站点。Pages 是直接上传项目，生产部署使用项目既有脚本指定 `--branch main`；Cloudflare 的该标签不表示本次合并了 GitHub main。

## 发布前验证

从已提交版本建立干净 detached worktree，使用 Node 22.19.0 / pnpm 11.1.2 执行 frozen 安装、`pnpm test` 和 `pnpm build`。266 项单元测试通过，构建及 100 页 SEO 输出检查通过，工作树无源文件差异。依赖和锁文件不变。本地临时文件、日志、截图、缓存未提交或上传。

`pnpm test:e2e:release` 首轮 17 通过、1 失败、2 跳过。失败为 Firefox 中文 PDF 等待下载超时；同一用例单独重跑通过（11.4 秒），未改断言或扩大限时。2 个跳过为仅 Chromium 支持的 CDP 限速测试。记录这次间歇超时，不将首轮描述为全通过。

## 生产复验

- `node scripts/check-production-content.mjs`：100 个页面和 www/裸域两处 ads.txt 共 102 个检查结果，失败 0。页面均为 200，title/H1/canonical 与构建一致，无 noindex，sitemap 包含页面；六篇文章修订日期及 description 为新值。
- `/robots.txt`、`/sitemap.xml`、`/favicon.svg` 均返回 200；robots 允许抓取。
- 线上 Chromium 的四项回归全部通过：四语隐私披露、Terms 日期、六篇 FAQ 问题/答案与 JSON-LD、ads.txt 和无广告运行代码。
- Playwright CLI 真实浏览器检查英、德、法、简中首页。每种语言两个地图入口及两份可见说明；选择合成 GPS 文件、完整解析期间没有地图请求；两次主动点击产生预期坐标链接，无请求体、Referer 或 opener。
- 四种语言共 8 次地图导航均由测试拦截，未向 OpenStreetMap 发送坐标。1440/390/239 px 无横向溢出，浏览器 pageerror 为 0；已查看生产简中截图。

本次部署关闭了之前仅在本地修复的地图披露缺口。Google 最新账号审批、真实流量、图片授权及全站内容价值判断仍沿用整改报告中的 Unknown，发布成功不表示 AdSense 审核通过或搜索引擎已重新收录。

本地证据：`.tmp/adsense-production-20260918.json`、`.tmp/adsense-production-browser-20260918.log`、`.tmp/adsense-production-map-20260918.log`、`.tmp/adsense-deployments-20260918.json`；截图位于 `output/playwright/production-map-*.png`。
