# 非英语版本 noindex 发布记录（2026-10-26）

按用户明确要求，将 `/de/`、`/fr/`、`/zh-cn/` 的全部语言页面暂时设为 noindex，仅保留英文页面参与搜索索引。页面没有删除或重定向，语言选择和工具操作继续可用。

- GitHub 分支：[`codex/homepage-exif-seo`](https://github.com/achelie/metadataview/tree/codex/homepage-exif-seo)。
- 生产代码提交：[`5835b30`](https://github.com/achelie/metadataview/commit/5835b30de228a84af259053c65f08b762c07811e)。
- 正式网站：[ViewExif](https://www.viewexif.com/)。
- Cloudflare Pages：`achelie-metadataview`，Production，生产标签 `main`；没有合并 GitHub main。
- 部署 ID：`1c984b7c-8db9-48e7-ad2f-86b1f44a267d`。
- 部署地址：[1c984b7c.achelie-metadataview.pages.dev](https://1c984b7c.achelie-metadataview.pages.dev)。

## 改动

- `src/config/search-indexing.mjs` 集中维护三个暂不索引的语言目录；只匹配完整目录边界，不误匹配 `/debug/` 等英文路径。
- `BaseLayout.astro` 为这三个目录输出唯一的 `<meta name="robots" content="noindex, follow">`，保留各页 self-canonical 和正确语言标记。英文 404 继续 noindex，其余英文页保持可索引。
- 移除四语页面的搜索 hreflang 集合和 Open Graph alternate locale 标签；页内语言切换链接照常保留。
- 既有 sitemap 生成器自动排除 noindex 页，sitemap 由 109 条减少至 58 条英文 URL。德、法、中文各 17 页，共 51 页仍生成并可访问。
- SEO、内容保留、生产复核脚本和语言回归测试同步采用当前索引规则，继续检查所有语言页面的内容和可用性。
- `robots.txt` 继续允许抓取，让搜索引擎能够读取 noindex；没有通过 Disallow 隐藏这些目录。

## 验证

1. 本地构建及干净 Git archive 副本构建均通过：110 个页面含 404，58 个可索引 canonical；SEO、资源、JSON-LD、页面语言、canonical、sitemap 和无残留 hreflang 检查通过。
2. 语言回归 8 项通过，覆盖全部 51 个非英语路由、同页语言切换、手机语言菜单及本地化文件操作。切回英文后 noindex 标签被正确移除。
3. 首次并行单元测试 286/287 通过，既有中文 PDF 导出用例触发 5 秒超时。保持原断言和时限，以单 worker 完整复跑，287/287 通过。
4. 干净副本发布浏览器回归 22 项通过、4 项按既有浏览器能力条件跳过，失败 0。
5. 109 页主内容与上一干净发布副本比对一致；仅归一化 Astro 自动生成的 hydration UID 和静态资源文件名哈希。见[内容保留证据](./locale-noindex-content-preservation-2026-10-26.json)。

CLI 原登录已不包含此前的 Pages 权限，用户在 Cloudflare 官方页面恢复登录后成功获得发布权限。旧 CLI 和代理连接曾发生 fetch 错误，本次通过临时调用 Wrangler 4.152.0 并使用直接连接完成发布；仓库依赖与锁文件没有更改，也没有修改系统网络设置。发布产物来自该提交的独立 Git archive，未上传工作区临时文件。269 个资源中上传 70 个，199 个复用缓存。

## 正式域名复验

全部 109 个公共页面逐页复验，0 失败：

- 51 个非英语页均返回 200，有唯一 `noindex, follow`，保留自己的 canonical 和原语言。
- 58 个英文页均返回 200，未收到 meta 或响应头 noindex，canonical 正确。
- 全部页面均有一个 H1，没有搜索 hreflang；主内容 HTML 哈希与本次干净发布产物一致。
- sitemap 返回 200，集合与构建的 58 个英文 URL 完全一致；不包含任何三个语言目录 URL。
- `robots.txt`、`ads.txt`、`favicon.svg` 均返回 200，robots 保持允许抓取，ads.txt seller 行保持正确。
- Cloudflare API 确认部署为 Production，Source 是本次代码提交，deploy 阶段为 success。

见[生产机器证据](./locale-noindex-production-2026-10-26.json)。

这次完成的是索引信号修改与发布。Google 需要重新抓取后才能更新搜索结果，并非部署后立即移除旧结果；没有代用户执行 Search Console 临时移除或提交 AdSense 复审。[Google noindex 说明](https://developers.google.com/search/docs/crawling-indexing/block-indexing)

当前目录策略记录在 `src/config/search-indexing.mjs`。后续放开语言时需按用户选择修改策略并复核 sitemap 和 hreflang，不会自动恢复。
