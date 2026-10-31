# AdSense 整改生产发布记录（2026-10-23）

用户在本地整改验收后要求上传 GitHub 并部署。此次发布代码和内容，没有提交 AdSense 复审或启用广告。

- GitHub 分支：[`codex/homepage-exif-seo`](https://github.com/achelie/metadataview/tree/codex/homepage-exif-seo)。
- 生产代码提交：[`63c07f4`](https://github.com/achelie/metadataview/commit/63c07f42cc9f6e1a71b85af6e18022386ed4d15c)。
- 正式网站：[ViewExif](https://www.viewexif.com/)。
- Cloudflare Pages 项目：`achelie-metadataview`，环境 Production，生产标签 `main`。
- 部署 ID：`08291a7f-7fb0-4d6a-85f2-b228be3e4719`。
- 部署地址：[08291a7f.achelie-metadataview.pages.dev](https://08291a7f.achelie-metadataview.pages.dev)。

沿用仓库既有直接上传流程，推送当前 GitHub 分支，Cloudflare 的 `main` 标签不表示合并 GitHub main。28 个本次整改文件单独提交；此前未跟踪的临时目录、依赖缓存、错误输出及旧审计报告保持原样。

## 发布内容

- 四语共享主导航改为工具、博客和关于；语言选项只保留一份，桌面和手机共享导航结构。
- 首页保留文件大小限制，缩短首屏说明，详细介绍移到上传工具后。
- 四语隐私政策增强 Cookie、第三方广告、退出与未来同意要求，日期为 2026-10-23。现有披露原本已存在，本次不把抓取误判描述成原先没有政策。
- 博客补可见发布日期，增加编辑规则、测试方法和纠错入口。
- 工具页面提供 2–3 篇按任务选择的相关指南。
- 新增 [EXIF 时区指南](https://www.viewexif.com/blog/exif-timezone-offsettimeoriginal/)、[EXIF 方向值指南](https://www.viewexif.com/blog/exif-orientation-values/)、[编辑政策](https://www.viewexif.com/editorial-policy/)与[测试方法](https://www.viewexif.com/how-we-test/)。

原有 31 篇博客保留，新增两篇后为 33 篇，博客分页由五页变为六页。两张新增 SVG 为原创示意图，设计字号不超过 28px。

## 干净副本验收

从生产提交的 Git archive 创建独立源码副本，执行 `pnpm install --frozen-lockfile --prefer-offline` 与 `pnpm verify:release`。上传的是该副本生成的 `dist`，不包含工作区其他文件，部署显式关联完整提交 SHA。

- 冻结锁文件安装通过，未修改依赖或锁文件。
- 27 个单元测试文件、287 项测试通过。
- Astro check 0 errors / 0 warnings，5 个既有 hints。
- 110 个页面输出（含 404），109 个可索引 canonical URL；资源大小、SEO、内链、语言 alternate、robots、JSON-LD 和 sitemap 检查通过。
- 发布浏览器回归：Chromium、Firefox、WebKit 共 22 项通过、4 项按测试中的浏览器能力条件跳过，失败 0。实际 SDK 隐私流程在 Chromium 和 WebKit 通过；Firefox 的对应两项按既有配置跳过。

构建仍提示已有浏览器依赖外部化、大包体及一个 WASM 文件接近 Cloudflare 单文件大小上限，未阻断本次构建和上传。

## 授权与网络处理

原 CLI 登录缺少 Pages 权限，项目 API 返回认证错误。用户在 Cloudflare 官方页面确认授权后，CLI 登录和 Pages 项目查询成功。

首次部署在上传前发生网络 `fetch failed`，部署列表仍为旧版本；直接连接重试也停在读取项目。改为本次命令使用系统已有代理后，完成上传和发布，没有修改系统代理、TLS 或浏览器安全设置。共上传 115 个文件，154 个文件复用既有缓存。后续部署列表确认新版本为 Production，Source 为 `63c07f4`。

## 生产复核

正式域名的全部 109 个 sitemap 页面已与独立发布产物逐页比较，失败 0：

- 全部 HTTP 200，单一 H1，自引用正式 canonical，无 noindex。
- 全部主内容 HTML 的 SHA-256 与生产提交的构建产物相同，包含四语隐私、两篇新指南、两篇规则页和第六页博客列表。
- 每页仅有一份正确的 AdSense 账号验证 meta，未发现广告运行脚本，语言菜单只有一份。
- 四语隐私政策均含 2026-10-23 日期。
- sitemap 返回 200，109 个 URL 与本次构建集合完全一致。
- `robots.txt`、`ads.txt`、`favicon.svg` 返回 200；robots 允许抓取，seller 行正确。

真实生产浏览器复核全部通过：

- 四语首页 × 320/390/1440px 共 12 组：页面无横向溢出，最大字号 28px；上传工具顶点为 184.2–261.4px，主导航、工具入口和语言列表均只有一份。
- 四语 × 390/1440px 共 8 个菜单场景：12 个工具链接可见，语言切换列表、Escape、焦点返回和手机抽屉 inert 正常，展开面板不超出可视区域。
- 新增四页 × 390/1440px 共 8 组：可访问，H1/canonical 正确，无横向溢出或超限字号。
- 已查看中文 390px 首页截图，文字、上传操作与样例按钮显示正常。检查未选择私人文件或点击广告。

机器证据：[生产静态检查](./adsense-production-static-2026-10-23.json)、[生产浏览器检查](./adsense-production-ux-2026-10-23.json)。手机截图保留在本地 `output/playwright/adsense-release-ux-2026-10-23.png`，未随文档提交。

[整改报告](./adsense-remediation-2026-10-23.md)是发布前验收快照，其中“未部署”描述当时状态；本记录说明后续已上传与发布。Google 的网站审核状态、实际流量和未来广告 CMP 等后台事项仍按整改报告核对，不由部署成功推断获批或已收录。

本地安装、构建、测试和上传日志保留在 `.tmp/adsense-*-20261023.*`，临时源码副本和日志没有提交或上传。
