# AdSense 内容整改生产发布记录（2026-10-05）

用户在本地验收后要求上传 GitHub 并部署。本轮已发布代码与内容，没有提交 AdSense 复审或开启广告。

- GitHub 分支：[`codex/homepage-exif-seo`](https://github.com/achelie/metadataview/tree/codex/homepage-exif-seo)。
- 生产代码提交：[`c3a76f1`](https://github.com/achelie/metadataview/commit/c3a76f11dcf1bf234181bc63583a6260e9f46a0a)。
- 正式网站：[ViewExif](https://www.viewexif.com/)。
- Cloudflare Pages 项目：`achelie-metadataview`，Production，生产标签 `main`。
- 部署 ID：`0a60f594-b822-4c8f-96bc-d2724af09966`。
- 部署地址：[0a60f594.achelie-metadataview.pages.dev](https://0a60f594.achelie-metadataview.pages.dev)。

沿用项目既有直接上传流程。Cloudflare 的 `main` 标签不表示合并了 GitHub main。48 个整改文件单独提交；临时文件、依赖缓存和此前未跟踪的旧报告未纳入。发布产物来自该提交的 Git archive 独立副本及 frozen lockfile 安装，不包含工作区其他文件。

## 发布内容与本地验收

四语工具说明、格式字段表及实际合成示例已发布；既有成熟说明保留。新增三篇英文指南：

- [复查元数据清理](https://www.viewexif.com/blog/verify-metadata-removal/)。
- [排查缺失元数据](https://www.viewexif.com/blog/why-metadata-is-missing/)。
- [阅读 C2PA 结果](https://www.viewexif.com/blog/how-to-read-c2pa-results/)。

四语隐私政策日期为 2026-10-05，已补充将来按此前网站访问记录提供个性化广告的 Cookie 机制，以及 Ads Settings 退出入口。语言选项只显示一处“简体中文”；hreflang 校验要求四语及 x-default 的唯一代码集合。Google 账号 meta 与 ads.txt 继续用于验证，无广告运行脚本。

- 独立副本 `pnpm install --frozen-lockfile` 通过，锁文件未改。
- `pnpm test --maxWorkers=1` 首次 286/287 通过，既有中文 PDF 导出用例触发 5000ms 超时；日志保留。完整复跑 287/287 通过，2026-10-05 20:08:14+08 开始，15.79 秒；没有修改断言或放宽时限。
- 独立副本 `pnpm build` 于 20:07:34+08 完成：105 个构建页面（含 404）、104 个 sitemap canonical URL；类型、资源及 SEO 校验通过。
- 独立产物正文计数：52 个工具入口、三篇新指南共 55 条，0 失败；重复结果操作提示整块排除。中文版同时记录汉字数、分词数，语义复核见整改报告。
- 本轮整改已有发布/真实 SDK 隐私回归：22 通过、4 项明确按浏览器能力跳过；本地 368 个移动状态通过。记录详见[整改报告](adsense-remediation-2026-10-05.md)，不将本地测试冒称线上运行测试。

首次部署在上传前发生 `fetch failed`，当时部署列表仍为旧版本；相同提交和配置重试成功。生产列表确认本部署为 Production、来源 `c3a76f1`。随后一次部署列表查询也发生连接失败，再查询成功；错误日志均保留，没有升级依赖或修改认证配置。

## 生产复核

- 2026-10-05 20:12:44–20:13:19+08，104 页及五项公共资源（robots、sitemap、favicon、www/裸域 ads.txt）均返回 200，没有重试。
- 104 页 title、H1、description、canonical、hreflang 与独立产物一致；无 noindex，sitemap 集合一致，账号 meta 唯一且正确，无 Google 广告运行标签。
- 四语隐私的“此前访问”披露、退出段落和日期与独立产物一致；48 个工具页的新增格式说明逐段与产物一致，语言菜单标签正确。
- 对正式站保存的 HTML 再运行正文检查：52 入口与三篇指南共 55 条，0 失败。
- 九张新 PNG（六张工具截图、三张指南封面）返回 200/image/png，SHA-256 与独立产物逐一相同。
- 真实浏览器独立查看英文指南的 320px 表格：页面 scroll/client 均为 320px，两张表格 width/scroll/client 均为 296px；已查看截图。
- 2026-10-05 20:12:45–20:21:05+08，线上完整移动复核 368 状态通过（236 初始页面、48 菜单/语言/折叠、42 真实合成文件结果、42 导出菜单）。覆盖 320/375/390/430px，0 失败、0 自动下载、0 捕获的浏览器错误；字号含伪元素≤28px，输入≥16px，主要触控≥44px，页面和表格无横向溢出。不同宽度抓取的版本一致。
- 该移动检查拦截统计/RUM 端点，只证明版面和工具交互；真实 SDK 隐私检查单独记录，不将其冒称新的线上隐私运行测试。已保存[生产机器证据](adsense-production-evidence-2026-10-05.json)。

原 101 个生产 URL 保留，新指南增加三个 canonical URL。28 篇旧文和 28 张旧封面未更改；保留证据见[内容保留记录](adsense-preservation-evidence-2026-10-05.json)。

[整改报告](adsense-remediation-2026-10-05.md)与其 JSON 是发布前的本地验收快照，里面“尚未发布”的记载属于当时状态；本记录说明后续已发布及线上复核结果。Google Sites 据用户确认仍为“审核中”，本轮未读取私有后台，未提交复审、开启广告或 CMP。后台、真实爬虫、流量、账号资料及已接受的旧图片授权缺口仍按 73 项表执行，不由部署成功推断获批或已收录。

本地证据保留在 `.tmp/adsense-release-clean-*-20261005.*`、`.tmp/adsense-deploy*-20261005.*`、`.tmp/adsense-production-mobile-20261005.log` 和 `output/playwright/adsense-production-*20261005*`。失败与重试记录没有覆盖；日志、抓取 HTML 和临时源码副本没有上传。
