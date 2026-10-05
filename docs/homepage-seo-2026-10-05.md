# 首页 On-page SEO 实施与本地验收

日期：2026-10-05。本报告记录四语首页代码、图片资产和部署前本地验收。

## 四语预览

本地生产构建预览运行在 4332 端口：

| 语言 | 预览 | 桌面整页截图 | 手机整页截图 |
| --- | --- | --- | --- |
| 英文 | [首页](http://127.0.0.1:4332/) | [1440px](E:/code/sy/metadataview/output/playwright/home-seo-en-1440.png) | [390px](E:/code/sy/metadataview/output/playwright/home-seo-en-390.png) |
| 德文 | [首页](http://127.0.0.1:4332/de/) | [1440px](E:/code/sy/metadataview/output/playwright/home-seo-de-1440.png) | [390px](E:/code/sy/metadataview/output/playwright/home-seo-de-390.png) |
| 法文 | [首页](http://127.0.0.1:4332/fr/) | [1440px](E:/code/sy/metadataview/output/playwright/home-seo-fr-1440.png) | [390px](E:/code/sy/metadataview/output/playwright/home-seo-fr-390.png) |
| 中文 | [首页](http://127.0.0.1:4332/zh-cn/) | [1440px](E:/code/sy/metadataview/output/playwright/home-seo-zh-cn-1440.png) | [390px](E:/code/sy/metadataview/output/playwright/home-seo-zh-cn-390.png) |

服务停止后可用 `pnpm preview --host 127.0.0.1 --port 4332` 重新打开。

## SEO 前后对照

| 项目 | 修改前 | 修改后 |
| --- | --- | --- |
| 英文 Title | Free Online EXIF & Metadata Viewer \| ViewExif | Free EXIF Viewer Online – View Photo Metadata \| ViewExif |
| 英文 H1 | Free Online EXIF & Metadata Viewer | Free Online EXIF Viewer |
| 英文 Description | Free online EXIF and metadata viewer. View EXIF, XMP, IPTC, GPS, camera and file metadata from images, videos, documents and audio. No upload required. | View EXIF data, GPS coordinates, camera settings and photo dates with ViewExif's free online EXIF viewer. Files stay in your browser. No upload. |
| 英文主内容 | 约 825 词 | 约 1307 词 |
| 上传限制说明 | 首屏统一写 100 MB | 图片最大 50 MB，其他支持文件最大 100 MB |
| 格式说明 | 正文和结构化数据声称支持 28 种格式 | 列出现有上传配置支持的扩展名，说明不同文件的字段差异 |
| EXIF 解释 | 一段概述 | 保留定义，补充 GPS、拍摄时间与文件日期、缺失字段三段解释，区分 XMP/IPTC |
| 示例图 | 无独立首页示例截图 | 四语实际解析报告截图，说明相机参数与地标坐标为演示添加 |
| 分享图 | 首页未提供图片 | 四语 1200×630 PNG，OG/Twitter 共用对应语言资产、alt 和尺寸 |
| 快捷入口 | 仅英文输出五个 EXIF 检查入口 | 四语均输出本地化标签、说明与工具链接 |
| SoftwareApplication | 通用 Metadata Viewer 定位，含 28 格式声称 | ViewExif EXIF Viewer 定位，本地化功能说明 |

词数按浏览器 `main.innerText` 的空白分词统计，只用于比较内容量，不作为排名或关键词密度验收指标。首屏工具、结果阅读说明、四类工具入口、三个下一步入口、五步流程、阅读指南和五个 FAQ 均保留。

根 URL、自引用 canonical、四语 hreflang 与 sitemap 沿用现有规则。新增 [CIPA 标准参考](https://www.cipa.jp/e/std/std-sec.html) 已检查可访问。

## 代码与资产

- [四语首页文案](E:/code/sy/metadataview/src/i18n/home.ts)：Title、Description、首屏、字段解释、格式、示例、alt、五个入口和应用功能。
- [首页组件](E:/code/sy/metadataview/src/components/pages/HomePage.astro)：正文静态输出、新示例图片和格式区域，复用 BaseLayout 的 image 接口。
- [SEO 输出检查](E:/code/sy/metadataview/scripts/check-seo-output.mjs)：四语首页 OG/Twitter、PNG 实际尺寸与资产存在性、正文图片 alt/尺寸/加载属性、可见 FAQ 与 JSON-LD 一致性。
- [浏览器回归](E:/code/sy/metadataview/tests/e2e/toolkit.spec.ts)：更新首页有意改变的文案断言，按各页面自己的 FAQ 验证完整 schema。
- [内容基线](E:/code/sy/metadataview/docs/content-url-baseline.json)：只更新四语首页的 Title 和 H1，共八个值。
- [图片来源说明](E:/code/sy/metadataview/public/seo/SOURCES.md)：记录样本与实际解析字段。`public/seo/` 新增四张 1200×720 正文截图和四张 1200×630 分享图。

截图使用现有公开 JPEG 样本，经“测试案例”入口及本地解析器完成读取后，组合实际预览和 EXIF 摘要 DOM 进行静态截图。截图没有替换字段值。运行时只加载独立 `/seo/` PNG，样本 JPEG 仍由用户点击示例按钮后加载。

## 验收结果

| 检查 | 结果 |
| --- | --- |
| `pnpm build` | 通过，102 个页面（含 404），101 个可索引 canonical URL |
| 新增 SEO 输出检查 | 通过；四语图片与可见 FAQ/JSON-LD 一致性均通过 |
| 四语原始 HTML | Title/Description 与四语配置一致；唯一 H1；正文直出；自引用 canonical；五条 hreflang；有效 WebSite、SoftwareApplication、FAQPage JSON-LD |
| 四语 × 320/375/390/430/1440px | 20 组通过：无横向溢出，无可见文字超过 28px，主要文件/示例/格式/快捷入口触控目标至少 44px |
| 上传和示例 | 28 个上传夹具及 28 个本地化示例入口通过；点击示例前没有 `/samples/` 请求 |
| 结果阅读与搜索 | 四语预览、关键字段、详情展开状态、字段搜索通过，结果区同样检查五种宽度 |
| 导出与清除 | 手机 JSON 内容与 PDF 文件头验证通过；菜单在可视区域内；清除后结果和浮动操作移除 |
| 首屏与极窄屏 | 桌面和 390px 手机文件按钮在首屏；239px 极窄屏额外回归通过 |
| FAQ | 首页、通用查看器各自的五条问题和完整答案与对应 JSON-LD 一致 |
| 定向 Playwright 回归 | 三组共 14 项通过（5 + 7 + 2） |
| `git diff --check` | 通过 |

首组测试覆盖 `toolkit.spec.ts`、`samples.spec.ts` 和 `i18n.spec.ts`；第二组覆盖首页结果与 `result-ux.spec.ts` 的四语搜索、导出及清除；第三组覆盖 FAQ 和极窄屏。构建后没有再修改页面实现。

验收证据保存在 [output/playwright](E:/code/sy/metadataview/output/playwright)：`home-seo-build.log`、`home-seo-e2e.log`、`home-seo-result-e2e.log`、`home-seo-faq-e2e.log`、`home-seo-html-evidence.json`、`home-seo-browser-evidence.json`、`home-seo-image-evidence.json`。该目录按项目既有规则忽略，不属于生产资产。

## 已有内容基线差异

全站 `node scripts/check-content-preservation.mjs` 仍报告三处博客分页链接差异。本次首页全部基线断言通过；其他页面的基线记录未改。

| 旧基线页面 | 已移动的文章链接 | 当前所在分页 |
| --- | --- | --- |
| `/blog/page/2/` | `/blog/remove-metadata-from-mp3/` | `/blog/page/3/` |
| `/blog/page/3/` | `/blog/how-to-view-exif-data-on-iphone/` | `/blog/page/4/` |
| `/blog/page/4/` | `/blog/does-discord-remove-exif-data/` | `/blog/page/5/` |

原因：基线最后更新于 2026-09-18（`02fb272`）；2026-09-22 的 `c42b98a` 新增文章后，每页六篇的博客列表顺移，旧基线未同步。上述文章和 URL 均存在，博客内容与分页代码在本次未改。保留这三处失败记录，避免将首页优化扩展为无关的全站基线更新。
