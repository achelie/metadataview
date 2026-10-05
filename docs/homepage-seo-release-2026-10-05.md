# 首页 SEO 生产发布记录

2026-10-05，按用户要求将首页 SEO 改动上传 GitHub 并部署。

- GitHub 分支：[`codex/homepage-exif-seo`](https://github.com/achelie/metadataview/tree/codex/homepage-exif-seo)。
- 生产代码提交：[`b3d1e33`](https://github.com/achelie/metadataview/commit/b3d1e33abdbbd1ef55a43120dbce4776600ea0b1)。
- 正式网站：[ViewExif](https://www.viewexif.com/)；[德文](https://www.viewexif.com/de/)、[法文](https://www.viewexif.com/fr/)、[中文](https://www.viewexif.com/zh-cn/)。
- Cloudflare Pages 项目：`achelie-metadataview`，环境 Production，生产标签 `main`。
- 部署 ID：`b51b05cc-fd6e-4745-9179-614a0f53edfb`。
- 部署地址：[b51b05cc.achelie-metadataview.pages.dev](https://b51b05cc.achelie-metadataview.pages.dev)。

沿用项目现有直接上传发布方式；GitHub 保留当前分支，Cloudflare 的 `main` 标签不表示合并了 GitHub main。只提交本次首页代码、测试、图片和文档，其他临时文件和报告保持原样。

## 发布前验收

- `pnpm test`：27 个测试文件、287 项单元测试通过。
- 从 `b3d1e33` 的 Git archive 解压出独立源码副本，执行 `pnpm install --frozen-lockfile` 和 `pnpm build`；102 个页面（含 404）、101 个可索引 URL 的构建与 SEO 输出检查通过。
- `pnpm test:e2e:release`：Chromium、Firefox、WebKit 共 22 项通过、4 项按浏览器能力跳过，失败 0。
- 首页专项验收、SEO 前后对照与四语截图见 [本地验收报告](homepage-seo-2026-10-05.md)。其中 3 处既有博客分页基线差异仍保留，文章和 URL 没有移除。

部署只上传独立源码副本生成的 `dist`，显式标记生产提交。CLI 虽从父仓库检测到未跟踪文件而提示 dirty，上传目录内不包含这些本地文件。首次部署在账户信息读取阶段出现网络 `terminated`，尚未开始上传；重试使用已确认的 Cloudflare account ID，成功上传并发布。未更换依赖或修改认证配置。

## 生产复验

- `node scripts/check-production-content.mjs`：100 个原有页面及两处 ads.txt，共 102 个结果，失败 0；页面的 HTTP 状态、Title/H1/canonical、robots、sitemap 与本次构建一致。
- 四语首页专项原始 HTML 检查：HTTP 200、唯一 H1、正文直出、正确 Title/Description、自引用 canonical、五条 hreflang；WebSite、SoftwareApplication 和 FAQPage JSON-LD 与部署构建一致。
- 八张正文/分享 PNG 均返回 200，响应类型为 PNG，尺寸正确，下载字节与干净发布副本完全相同。
- `robots.txt`、`sitemap.xml`、`favicon.svg` 返回 200；robots 允许抓取，sitemap 含 101 个 canonical URL。
- 真实 Chromium 浏览器四语 × 1440/390/320px 共 12 组检查通过：无横向溢出，无文字超过 28px，主要上传、示例、快捷入口与格式链接至少 44px，点击示例前没有样本请求。
- 已检查正式站英文和中文的浏览器 JavaScript 错误缓冲，均为空；已查看中文手机首屏截图。

生产专项图片检查首次遇到一个连接超时，自动重试后完整通过。线上已提供新版页面；此记录不代表 Google 已重新抓取或排名已经变化。

本地证据位于 `output/playwright/`：`home-seo-release-unit.log`、`home-seo-clean-build.log`、`home-seo-release-e2e.log`、`home-seo-deploy.log`、`home-seo-deploy-retry.log`、`home-seo-deployments.json`、`home-seo-production-content.json`、`home-seo-production-evidence.json`、`home-seo-live-browser-evidence.json` 和 `home-seo-live-*.png`。日志与临时发布副本未提交或上传。
