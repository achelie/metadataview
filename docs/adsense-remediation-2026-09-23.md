# ViewExif AdSense 修复后复核 · 2026-09-23

**申请准备度：Ready。已知 Fail 全部关闭，没有未解决的已确认 Blocker / High。Google Sites 审批状态：Unknown。**

当前生产站 [ViewExif](https://www.viewexif.com/) 已完成修复、干净提交构建、生产部署与复验，可以由运营者提交 AdSense 审核。这里的 Ready 只表示网站具备提交条件；Google 私有后台是否批准仍需单独确认，不保证审核结果。本轮没有提交审核、开启广告或代发联系邮件。

[修复前报告](./adsense-audit-2026-09-23.md)及其证据保留原样；[本轮机器可读证据](./adsense-remediation-evidence-2026-09-23.json)保存版本、全部 73 项、测试成功和失败、网络摘要、全量页面及图片复验。复核完成时间：2026-09-23 19:44:36 +08:00。

## 版本与验收记录

| 项目 | 最终结果 | 证据与范围 |
| --- | --- | --- |
| 修复前版本 | `c42b98a` | 同日只读审核已存档，原 5 个 Fail 不改写 |
| 生产源码 | `638429099a86cd60ae8c7a401df7e6057e708937` | `codex/homepage-exif-seo`；仅本次源码、测试、审核文件提交并推送 |
| 单元测试 | 287/287 Pass | 从已提交版本的独立干净工作区运行，27 个测试文件 |
| 构建与 SEO/资源 | Pass | `pnpm build`；Astro 0 errors / 0 warnings，3 个既有 hints；102 页面含 404，sitemap 101 URL；SEO/资源检查通过 |
| 最终本地发布回归 | 26 passed / 4 skipped / 0 failed | 实际 Ahrefs SDK 在非 localhost 映射地址运行；Firefox 映射 Worker 限制用真实生产测试补齐，两个 CDP 限速用例只适用 Chromium |
| 全部受影响 UI | 首轮 235/246，通过修正测试操作复跑 29/29 | 保留旧 UI 断言失配与外部连接失败；没有通过恢复重复地图入口或放宽字段/尺寸断言迁就测试 |
| 首轮生产浏览器 | 77/78；Firefox 中键后清除失败已定位并复验关闭 | 20 个清理锚点、28 篇文章、5 个博客索引、四语政策和四语地图均通过 |
| 最终生产浏览器 | 10 passed / 0 skipped / 0 failed | 三浏览器真实 Ahrefs / Cloudflare RUM、全部地图动作与文件接续、四宽菜单；敏感请求 0、自动下载 0 |
| 生产部署 | `e094c704-941e-47f7-8836-14ae8a1cb40e` | [部署版本](https://e094c704.achelie-metadataview.pages.dev)；Cloudflare Pages Production，现有 main 发布标签，不改 Git 分支 |
| 发布后全站 GET | 101/101 页面，28/28 图片 | 102 内部目标、0 断链/坏锚点、正确 title/H1/canonical/robots/account meta；HTML 和脚本/CSS 与干净 dist 对照 |
| 五宽视觉 | 320 / 375 / 390 / 430 / 1440px | 导航、结果导出菜单和博客；无横向溢出，字体不超过 28px，已修复手机导航子项 42px→44px |
| 封面与文章保全 | 28 篇正文、28 张源图保留 | URL 与索引资格不变；文件 SHA-256 与修复前相同，来源证据等级见素材台账 |
| Google Sites | Unknown | 未读取私有审批后台；不与申请准备度 Ready 混用 |

测试中的外部统计请求在发送前拦截，真实 SDK 产生的 pageview / RUM 是正向通过条件。这个结果证明当前脚本、页面和所测操作的数据流；不声称第三方脚本无法读取 DOM，也不声称已经收到统计服务端的入库回执。仅用户明确打开地图时允许已告知坐标进入 OpenStreetMap 导航，合成测试中的这些导航也被拦截，没有把合成文件上传给第三方。

## 最终生产统计与隐私证据

| 浏览器 | 流程 | Ahrefs pageview | Cloudflare RUM | 主动地图请求 | 自动下载 | 敏感请求 |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Chromium | 地图、重选、清除、刷新、离页 | 3 | 3 | 3 | 0 | 0 |
| Chromium | 查看 → 隐私检查 → 清理 → 副本复查 → 离页 | 5 | 8 | 0 | 0 | 0 |
| Firefox | 地图、重选、清除、刷新、离页 | 3 | 7 | 3 | 0 | 0 |
| Firefox | 查看 → 隐私检查 → 清理 → 副本复查 → 离页 | 5 | 27 | 0 | 0 | 0 |
| WebKit | 地图、重选、清除、刷新、离页 | 3 | 7 | 3 | 0 | 0 |
| WebKit | 查看 → 隐私检查 → 清理 → 副本复查 → 离页 | 5 | 29 | 0 | 0 | 0 |

六个流程均通过。每个地图流程的三次授权操作分别是鼠标、Enter 和 Space；中键没有新增地图请求。请求检查覆盖 URL、请求头和请求体，命中后即使已拦截也会判失败；本次命中数为 0。浏览器 Canvas 编码可能不同，合成 JPEG 的 SHA-256 在每次选文件前计算并登记，具体值、动作序列和请求摘要保存在机器证据中。

## 本地与生产验证记录

原始失败如实保留：单元测试首次有 PDF 冷启动超时（286 passed / 1 failed），没有扩大 5 秒时限；单独重跑 287 passed。浏览器首轮 235 passed / 11 failed，10 项引用旧版始终展开的详情/导出控件或不唯一选择器，现先执行真实展开操作并保留字段、尺寸、格式、复制、下载与懒加载断言；Gmail 239px 检查遇到 `ERR_CONNECTION_CLOSED`，断言不变复跑通过。整份图片查看器及 Gmail 单项合计 29 passed。

真实统计回归首轮 1 passed / 1 failed，Windows Chromium 中键进入自动滚动模式，随后 Clear 鼠标点击先退出模式。测试显式 Escape 退出浏览器模式后，保留并加强清除断言：文件名、作者、哈希、预览、GPS、导出消失，文件输入为空、选择按钮可用且焦点归还；针对性测试通过。未修改产品清除行为。干净构建还暴露了新增测试 tuple 在项目严格模式下的两处类型错误，已用只读 tuple 类型修正并重新通过 Astro 检查。扩展三浏览器后，WebKit 的 Blob URL 被测试代理误当 HTTP、Firefox 映射请求继承原 Host 导致 403，均已修正。随后 Chromium/WebKit 的真实统计流程及三浏览器常规发布检查通过；Firefox Worker 动态 import 不进入 context.route，最小对照已复现此虚拟 DNS 限制，因此保留本地失败记录，并在真实生产域名用同一完整断言复核，不放宽正向 pageview、文件解析或隐私检查。本地两条 Firefox 映射用例显式跳过，真实生产域名仍强制运行相同完整断言，最终通过。

生产首轮 77 passed / 1 failed：Firefox 在中键后虽向 Clear 发出可信 pointerdown/up、mousedown/up，但浏览器没有派发 click，React 清除处理器未触发。只读事件诊断保留；该含中键序列的用例改用原生 focus + Enter 激活 Clear，所有文件名、作者、GPS、哈希、预览、输入框清空及焦点断言保留，最终生产复验通过。两个未主动下载的流程还增加了全部页面下载事件计数，必须为 0。没有修改产品清除行为。网络摘要将 blob URL 明确标为本地资源，避免拼接成不存在的主机名。

生产视觉发现手机菜单子项只有 42px，低于项目的 44px 要求。已修正 CSS，并添加 320/375/390/430px 的真实菜单展开、十个子项尺寸、Escape、inert 与焦点回归，最终部署后全部通过。原始视觉失败仍保留。首次静态复验的 robots 逐字比较因 CRLF/LF 差异误报，保留原结果并按行内容正确比较；HTTP 和放行规则本身没有故障。

构建保留既有资源提示：最大 WASM 距 Cloudflare 单文件上限剩 93,987 bytes，资源门槛通过，升级依赖时需关注体积；本轮没有调整依赖。抓取脚本把中文 About（477 字符）和 Contact（400 字符）列入短正文提示，但页面不为空，包含对应的运营及联系信息；字符/分词启发式不足以判定低价值，不编造最低字数门槛。

内容保全证据：[adsense-content-preservation-2026-09-23.json](./adsense-content-preservation-2026-09-23.json)。101 个页面 URL/title/H1/canonical/robots 与修复前保存 HTML 相同，28 篇正文及 28 张源封面字节保持不变。

## 已关闭的三个问题

修复前的 5 个 Fail 对应三个问题，不是五种互不相关的违规：GPS 统计外传关联隐私两项和总体合规项，另两个 Fail 是局部导航缺陷。

1. **High：含 GPS 的地图 href 被统计脚本捕获。** 已发布 [MetadataReportWorkbench.tsx](../src/components/MetadataReportWorkbench.tsx) 把地图入口改为按钮，坐标 URL 保留在事件闭包，明确操作时才用 `window.open` 打开；页面不再为该操作渲染含坐标的链接 href。[四语就地提示](../src/i18n/workbench-report.ts) 和 [Privacy](../src/components/pages/ContentPage.astro) 同步说明新标签页、OpenStreetMap 接收坐标与网络信息；政策日期更新为 2026-09-23。保留 Ahrefs 页面统计，不能把“脚本在测试中没有运行”误判为隐私通过。新增 [analytics-privacy.spec.ts](../tests/e2e/analytics-privacy.spec.ts) 使用真实 SDK、普通访客检测和合成文件，并在外发前拦截敏感请求。**修复与关闭证据：**本地与生产实测均有真实 pageview；普通/键盘/辅助操作和页面生命周期没有将坐标、文件名、文件内容标记或哈希带入任何未授权请求；只有明确操作的 HTTPS 地图导航带坐标。已关闭：本地 Chromium/WebKit 与生产 Chromium/Firefox/WebKit 均捕获真实 pageview；生产实际 RUM 为正。鼠标、Enter、Space 各开一次地图，中键不开地图；重选、无 GPS、清除、刷新、离页及文件接续均通过，未检测到敏感请求。
2. **Medium：清理页的工作区锚点不存在。** 已发布 [MetadataRemovalWorkbench.tsx](../src/components/MetadataRemovalWorkbench.tsx) 给清理区域增加 `id="metadata-workbench-tool"`，共享指南无需改变 URL；滚动间距避免被页头遮挡。**修复与关闭证据：**四语 × 五类清理页面，在初始 HTML 和水合后都恰有一个目标，CTA 能滚动到文件选择区，不自行弹出文件选择器、处理文件或下载。对应 [navigation-readiness.spec.ts](../tests/e2e/navigation-readiness.spec.ts)，已关闭：20/20 路由初始与水合唯一锚点、英中 CTA 实际滚动和无自动操作通过；生产全量 GET 再次确认。这是页内定位缺陷，不是 HTTP 断链或已证实的欺骗行为。
3. **Medium：非图片文章尾部推荐图片工具。** 已发布 [BlogToolStrip.astro](../src/components/BlogToolStrip.astro) 按文章类别映射 image/document/audio/video/all；文章模板传入 category，未知类别和索引页回退到通用工具，非图片文章不显示图片隐私检查器。**修复与关闭证据：**28 篇文章及博客分页的推荐路径与实际主题相符，正文原有路径和封面保留；小屏幕可操作且无溢出。已关闭：28/28 文章及 5/5 博客索引推荐路径通过，编号连续；320/375/390/430px 无溢出，最终生产 GET 与浏览器证据一致。

这三项分别依据 Google 的 [页面内容与导航要求](https://support.google.com/adsense/answer/7299563?hl=zh-Hans) 和 [发布商隐私/位置数据政策](https://support.google.com/adsense/answer/10502938?hl=zh-Hans)。修复优先切断未披露的数据通路，不以修改措辞允许 GPS 进入统计。

## 本次新增确认与可保留的证据

- **持有人确认（2026-09-23）：**申请者已满 18 岁，无重复 AdSense 账号，控制该域名和 Publisher ID `pub-7443237558968985`。这是本次明确声明，不是读取身份证、付款后台或 AdSense 私有页面的结果。
- **28 张封面保留：**[图片来源台账](./blog-image-sources.md)逐项记录关联文章、本地文件、字节数和 SHA-256。2 张有具体原页/作者记录并核对官方页面：Athena Sandrini #2962087，以及从 Git 历史恢复的 ready made #3850268。其余 26 张记录 `owner attested 2026-09-23` 的 Pexels 来源声明，不虚构逐图独立认证。28 个源文件哈希全部与修复前 HEAD 一致。通用许可已重新阅读 [Pexels License](https://www.pexels.com/license/)；缺少旧 URL 不等于已侵权，也不要求因此批量换图。
- **内容审阅未因修复失效：**28 篇文章正文未被本轮修改；同日内容分审计已清点全部文章并深读/对照 8 篇，确认有具体字段、操作、限制及工具增量。六篇平台文章已注明历史资料边界。13 篇正文外链只有 Reddit 是来源改进建议，不是抄袭、欺骗或必拒的证明；没有最低篇数、字数、流量或公开真实姓名的额外门槛。
- **技术基线与最终复验：**修复前、首次发布后及最终发布后均分别保存全量证据；最终 101/101 sitemap 页面与 28/28 图片目标可访问，0 HTTP 断链、空主区域或完全重复正文；域名归一、DNS/TLS、robots、canonical、meta 和 ads.txt 正常。最终结果另存新目录，没有覆盖基线。原文件：`.tmp/adsense-live-evidence-20260923.json`、`.tmp/adsense-live-images-evidence-20260923.json`。
- **演示素材：**[样例来源说明](../public/samples/SOURCES.md)已区分 AI 生成的示例风景/合成 EXIF 与 Adobe C2PA 公共测试文件，记录许可和文件哈希；这类例子不声称是真实拍摄或已被信任的签名。

## 73 项重新评估

范围说明：源码与动态行为以本报告所列生产提交和最终运行时验证为准；内容判断保留同日深读记录，并用全文/图片哈希及 URL 对照确认未变；`持有人确认` 指本次用户声明。每项重新判断，没有复制旧 Fail 或将未经取证的运营事项改成 Pass。Pass 只覆盖列明的证据，不能推出未来投放或全量私有账号也已合规。Google 后台、真实 Google 来源 IP/WAF 和真实推广流量不可独立核验的项目保留 Unknown，**它们不是本轮已证实的 High 缺陷**。

| ID | Status | 当前证据与判定理由 | 下一步 |
| --- | --- | --- | --- |
| ADS-ELIG-01 | Pass | 持有人本次确认已满 18 岁；未读取身份证明。 | 用已确认的成年申请者账号办理。 |
| ADS-ELIG-02 | Pass | 持有人本次确认没有重复 AdSense 账号。 | 继续用现有对应账号添加/复审网站。 |
| ADS-ELIG-03 | Pass | 已逐项重新评估全部 73 项；GPS 统计外传、清理锚点、博客工具推荐已发布并复验关闭，无已确认未解决的 Blocker / High。 | 可以由运营者提交审核；Google 后台批准仍另记。 |
| ADS-ELIG-04 | N/A | 独立域名的 Astro 网站，不是 Blogger/YouTube 托管合作伙伴流程。 | 使用独立网站申请流程。 |
| ADS-OWN-01 | Pass | 拥有仓库与 head 注入权限，已从干净提交部署；最终 101 页各有一个正确账号 meta。 | 账号变化时同步验证标记。 |
| ADS-OWN-02 | Pass | 本次持有人确认域名及对应 Publisher ID 控制权，仓库与公开配置吻合。 | 由本人在后台完成验证，不冒称独立身份调查。 |
| ADS-OWN-03 | Pass | Astro/React 构建通过；三浏览器生产真实解析、地图与文件接续通过。 | 后续发布保留运行时回归。 |
| ADS-SITE-01 | Unknown | 未读取 AdSense 私有 Sites 状态。 | 运营者核对当前验证/复审入口；Google Sites Ready 后才投放。 |
| ADS-SITE-02 | Pass | 生产 101 页 account meta 与两域 ads.txt 一致，控制权由持有人确认。 | 后台用可用方法验证，无需提前开启广告。 |
| ADS-TXT-01 | Pass | 最终生产两域可到达正确 Google DIRECT 行，主站 200/text/plain，Publisher ID 获持有人确认。 | 后台 Authorized 状态由运营者单独记录。 |
| ADS-TXT-02 | Pass | public/ads.txt 与最终生产响应一致，可公开 GET。 | 账号变化时同步。 |
| ADS-CONTENT-01 | Pass | 可运行的本地工具与 28 篇用途相关指南；同日 8 篇深读有具体操作、字段和限制，正文未变。 | 优先补当前自有样例与技术一手来源，不凑文章数量。 |
| ADS-CONTENT-02 | Pass | 已读文章不是纯摘录、嵌入或联盟 feed，有问题分析和本站工具增量；未见无增量复制。 | 保留来源和适用范围；这不是全网查重认证。 |
| ADS-CONTENT-03 | Pass | 工具未选文件时已有静态解释；博客详情可 GET 阅读；分页连接完整文章。 | 启用广告时重新评估空结果、状态和信任页的投放范围。 |
| ADS-CONTENT-04 | Pass | 最终 101 页成形且无空主区域，未见建设中或 Lorem 占位；28 篇正文与封面保留。 | 新增内容保持可用性与具体价值。 |
| ADS-CONTENT-05 | Pass | 当前无广告、联盟或付费推广占据主体，工具 CTA 是本站功能入口。 | 广告上线后按真实版面重新评估内容占比。 |
| ADS-CONTENT-06 | Pass | 英语、德语、法语、简体中文均在官方支持列表，四语主体内容存在。 | 继续检查新增动态提示的四语覆盖。 |
| ADS-CONTENT-07 | N/A | 无公开评论、论坛或投稿；本地文件读取不发布为公共 UGC。 | 将来开放发布型 UGC 时加入审核机制。 |
| ADS-CONTENT-08 | Pass | 站内字面重复检查及深读未见门页或关键词堆砌；相近入门主题有各自操作与限制。 | 新内容优先补案例，避免继续铺同义关键词页面。 |
| ADS-UX-01 | Pass | 20 个清理路由 SSR/水合均有唯一锚点，CTA 可到上传区；四宽手机菜单子项达 44px，Escape/inert/焦点均通过。 | 后续改导航时复跑相应测试。 |
| ADS-UX-02 | Pass | 28 篇文章按现有 category 推荐对应格式工具，5 个博客索引用通用工具；编号连续，小屏无溢出。 | 未知类别继续回退通用工具。 |
| ADS-UX-03 | Pass | 工具按钮对应真实文件操作；清理 CTA 无自动处理/下载，博客推荐类型正确，没有伪装下载或不存在目标。 | 新增 CTA 保持明确行为。 |
| ADS-UX-04 | Pass | 三浏览器地图只在鼠标/Enter/Space 明确操作时开新标签页并保留结果；辅助点击不开图，接续不自动清理/下载。 | 未来交互保留显式操作。 |
| ADS-UX-05 | Pass | About/Contact/Privacy/Terms 四语齐全；个人运营、责任、邮箱和工具边界具体说明。 | 邮箱收发由运营者维护；本轮不代发邮件。 |
| ADS-UX-06 | Pass | 当前无广告占位或伪广告布局；工具与知识说明可区分。 | 将来投放时检查实际标签和视觉边界。 |
| ADS-CRAWL-01 | Pass | 最终 sitemap 全部 101 页 200，102 内部目标无断链/坏锚点；未知 URL 返回真实 404。 | 未来发布按当前 sitemap 全量复查。 |
| ADS-CRAWL-02 | Unknown | robots 放行，普通请求及 Google UA 成功，但无真实 Google 来源 IP、地区限制或 WAF 规则/事件证据。 | 有后台抓取报错时核对 Cloudflare 事件；不能把 UA 200 写成真实爬虫认证。 |
| ADS-CRAWL-03 | Pass | 静态页面无需 POST 或登录即可读取主要内容；本地结果是用户操作状态。 | 不在仅有私有状态的屏幕新增广告请求。 |
| ADS-CRAWL-04 | Pass | 最终规范 sitemap 页无重定向，HTTP/裸域到 HTTPS www 归一正常，技术探针通过。 | 保留单跳域名归一。 |
| ADS-CRAWL-05 | Pass | 稳定路径与自指 canonical，无会话参数；文件接续采用内存单槽。 | 保持文件名/元数据不进入网站 URL 与持久存储。 |
| ADS-CRAWL-06 | Pass | 最终两域 DNS/HTTPS、证书及公共请求成功；不把一次复验写成长期 uptime 保证。 | 持续维护可达性。 |
| ADS-CRAWL-07 | Pass | 直接 sitemap 暴露 101 个规范 URL，博客分页及站内链接提供稳定入口。 | 后台收录/AdSense 抓取时点由运营者查看。 |
| ADS-PROG-01 | Unknown | 当前不请求广告，本轮自动化没有加载/点击广告；历史账号行为与整体流量未独立审计。 | 运营者按运营清单持续避免自点、刷量和奖励广告互动。 |
| ADS-PROG-02 | Pass | 已读模板、工具 CTA 和文章未见鼓励广告点击、奖励观看或引导广告箭头。 | 加广告时继续检查周边措辞。 |
| ADS-PROG-03 | N/A | 当前没有广告单元或广告标签。 | 上线实际广告后验证中性标签及内容区分。 |
| ADS-PROG-04 | Unknown | 未取得真实来源日志或推广账户；本次资格/图片确认不等于流量核验。 | 运营者检查来源与异常峰值，禁止点击交换、垃圾推广等。 |
| ADS-PROG-05 | N/A | 无 Google 广告运行代码及包装器，只有验证 meta。 | 以后加入广告代码时检查修改及事件行为。 |
| ADS-PROG-06 | N/A | 当前不投放广告，未见软件、私密通讯或框架页面投放。 | 投放前排除无内容/状态/信任等不适合页面。 |
| ADS-PROG-07 | N/A | 当前为普通网站，没有 App WebView 创收实现。 | 如增加 WebView 另查对应要求。 |
| ADS-PUB-01 | Pass | 公开内容讨论本人/有权文件的元数据读取与清理，Terms 限制违法及侵权使用。 | 新工具/指南继续检查实际用途。 |
| ADS-PUB-02 | Pass | 28 封面有本轮 Pexels 来源确认，2 原页记录+26 owner attested；样例有来源许可与哈希，未见仿品/冒用。 | 保留证据等级，后续找回原页可补录；不称逐图独立法律认证。 |
| ADS-PUB-03 | Pass | 内容库存与深读未见仇恨、暴力、自伤、骚扰或极端组织宣传；无公共 UGC。 | 新内容维持同样审查。 |
| ADS-PUB-04 | Pass | 摄影/文件工具主题无虐待动物或濒危制品售卖内容。 | 新增商品/主题时复核。 |
| ADS-PUB-05 | Pass | 个人运营及品牌关系说明明确；四语 Privacy 现在准确承诺统计请求不含文件内容/提取值，实际 SDK 网络回归与披露一致。 | 第三方行为改变时重新验证并更新披露。 |
| ADS-PUB-06 | Pass | 无登录凭证收集、付款/获利诱导或伪装表单；邮箱入口用途明确。地图统计缺陷在隐私项跟踪，未认定蓄意盗取。 | 保持数据最小化和真实功能说明。 |
| ADS-PUB-07 | Pass | 工具用于查看/减少文件附带信息；未提供伪造文件、作弊、破解或未经授权跟踪服务，Terms 禁止相应用途。 | 不把隐私清理宣传成造假/逃避调查服务。 |
| ADS-PUB-08 | Pass | 文章、工具与已审阅素材没有性交易、跨境婚介或家庭内容中的成人主题。 | 新内容仍需审查。 |
| ADS-PUB-09 | Pass | 品牌/域名一致，账号 meta 与 ads.txt 一致且获持有人本轮 pub ID 确认；当前无广告请求。 | 后台付款/账号资料由运营者保持准确；投放前复核请求标识。 |
| ADS-PUB-10 | N/A | 没有广告覆盖内容、导航或控件的实现。 | 开启广告前逐设备检查位置。 |
| ADS-PUB-11 | N/A | 当前无广告屏幕；内容价值已在 CONTENT 项独立审查，没有因此免除内容要求。 | 上线时避免无内容、低价值状态与信任页投放。 |
| ADS-PUB-12 | N/A | 无背景、屏外或脱离用户注意场景的广告位。 | 广告上线检查懒加载和可见性。 |
| ADS-PUB-13 | Pass | 公开主题为元数据与文件隐私，未见选举、健康或气候有害虚假声明。 | 涉及新敏感主题时核对可靠来源。 |
| ADS-PUB-14 | Pass | 示例明确为 AI 生成/合成 EXIF，C2PA 无凭证明确不等于伪造；无公共议题欺骗性操纵媒体内容。 | 保持示例与事实素材区分。 |
| ADS-PUB-15 | Pass | 已审阅公开内容无儿童剥削/危害主题；没有供用户公开上传或传播文件的平台。 | 将来改变发布功能时重新审核。 |
| ADS-PUB-16 | Pass | 普通文件工具和教育指南，没有利用当前危机或敏感事件创收的内容。 | 新增时事内容时单独考虑敏感事件规则。 |
| ADS-REST-01 | Pass | 公开类别、正文与素材用途未见性内容、性服务或相关产品。 | 新增内容复核。 |
| ADS-REST-02 | Pass | 已读内容没有血腥、令人不适图片或突出粗俗语言。 | 新增素材复核。 |
| ADS-REST-03 | Pass | 无武器、爆炸物销售或制作/改进指南。 | 新增下载或文章复核。 |
| ADS-REST-04 | Pass | 无烟草、娱乐性毒品及生产使用指导。 | 新增商业内容复核。 |
| ADS-REST-05 | Pass | 无酒类销售或鼓励不负责任饮酒内容。 | 新增商品/推广复核。 |
| ADS-REST-06 | Pass | 无赌博或付费随机机会游戏；正文日常比喻不构成此类业务。 | 如新增相关服务另查地区限制。 |
| ADS-REST-07 | Pass | 无处方药销售、药房、未批准药物或已下架应用推广。 | 新增商业或应用内容复核。 |
| ADS-REST-08 | N/A | 没有广告视频、自动播放广告或遮挡广告的版面。 | 实际广告上线后再测视频/遮挡行为。 |
| ADS-PRIV-01 | Pass | 四语政策日期 2026-09-23，披露 Ahrefs、Cloudflare、地图及未来广告；生产真实 pageview/RUM 正向执行且敏感请求为 0。 | 持续复核实际数据流，不宣称第三方脚本不能读取 DOM。 |
| ADS-PRIV-02 | Pass | 四语 Advertising 节说明将来 Google/合作方可能使用 Cookie、local storage、beacon、IP/标识符及用途，当前无广告状态也说明。 | 投放方式变化前同步更新披露。 |
| ADS-PRIV-03 | N/A | 当前没有 Google 广告、Google Analytics 或受众请求；Ahrefs GPS 问题另在隐私项跟踪。 | 广告上线后检查所有请求参数和 PII 风险。 |
| ADS-PRIV-04 | N/A | 当前未运行 Google 广告同意流程；无 CMP 横幅本身不是无广告申请版本的缺陷。 | 投放前按地区、广告类型和存储行为实现适用同意/CMP。 |
| ADS-PRIV-05 | Pass | 原生按钮提供明确操作，四语说明 OSM 接收坐标/IP并新标签页打开；每浏览器地图流程的三次授权 HTTPS 导航可带 GPS，三浏览器合计九次，其余请求无坐标。 | 保留就地告知、HTTPS 和无地图点击统计设计。 |
| ADS-PRIV-06 | N/A | 普通摄影/文件工具非面向儿童的内容，当前无定向广告。 | 受众或广告配置改变时评估儿童内容标记。 |
| ADS-PRIV-07 | N/A | 未见操作 Google 域 Cookie 的自定义广告、代理或拦截代码。 | 新增广告/代理功能时复核。 |
| ADS-PRIV-08 | N/A | 当前无 Google 个性化广告、再营销或敏感受众名单实现。 | 开启广告时不把文件内容或敏感属性用于受众。 |
| ADS-PRIV-09 | N/A | 没有美国/加拿大住房、就业、信贷广告定向业务。 | 业务改变时检查定向限制。 |
| ADS-PRIV-10 | N/A | 当前无个性化广告及相应受众数据使用。 | 启用后验证数据权利、说明、选择与撤回入口。 |

## 最终证据与保留限制

[机器可读证据](./adsense-remediation-evidence-2026-09-23.json)包含完整 73 项、最终生产逐页/逐图与资源比对、浏览器用例结果、实际统计请求摘要、已知失败及复跑结果。原始日志、Playwright trace 与截图保存在本地 output/.tmp，未作为缓存或截图混入提交。

没有独立核验的 4 项保持 Unknown：Google 私有 Sites 审批、真实 Google IP/WAF/跨地区访问、历史广告互动、实际推广来源。没有发现这些项目存在违规，公共 UA 探针也不能将它们证明为全量 Pass。26 张旧封面来源由持有人确认，2 张有具体来源/作者记录；这种证据区分不等于发现侵权。17 项因尚未投放广告或与当前站型、业务不适用而保持 N/A，各行单独说明原因；实际启用广告或改变业务前按[运营清单](./adsense-operations.md)重新验证。

## 官方依据与适用边界

2026-09-23 已重新读取技能完整要求，并刷新以下官方资料。若 Google 以后更新，以更新后的官方要求为准。

- 资格、控制权和审批阶段：[加入资格](https://support.google.com/adsense/answer/9724?hl=zh-Hans)、[网站拥有权](https://support.google.com/adsense/answer/91205?hl=zh-Hans)、[网站管理](https://support.google.com/adsense/answer/12131223?hl=zh-Hans)、[验证与 Request review 流程](https://support.google.com/adsense/answer/12169212?hl=en)。支持 meta/ads.txt 验证；申请准备度与 Google 的审核就绪状态分别记录。
- 内容与导航：[页面要求](https://support.google.com/adsense/answer/7299563?hl=zh-Hans)、[支持语言](https://support.google.com/adsense/answer/9727?hl=zh-Hans)。网站实际内容和可用性是依据，不添加未被官方规定的文章数量/字数门槛。
- 技术访问：[抓取问题](https://support.google.com/adsense/answer/2381908?hl=zh-Hans)。本轮公共请求可达不能替代真实 Google 来源的服务端证据。
- 广告行为、版权、身份和隐私：[AdSense 合作规范](https://support.google.com/adsense/answer/48182?hl=zh-Hans)、[Google 发布商政策](https://support.google.com/adsense/answer/10502938?hl=zh-Hans)、[发布商限制](https://support.google.com/adsense/answer/10437795?hl=zh-Hans)。当前无广告不免除网站本身的内容与隐私准备要求；未匹配某类违规也不意味着未来投放无需再查。
- 同意阶段：[发布商 CMP 要求](https://support.google.com/adsense/answer/13554116?hl=en)。EEA/英国/瑞士个性化广告须用 Google 认证且集成 IAB TCF 的 CMP，其他模式仍要按实际处理落实适用同意。当前无广告版本不能因为没有横幅被单独判不合格。
- 素材许可：[Pexels License](https://www.pexels.com/license/)。台账准确区分原始来源记录与持有人确认，不编造逐图授权证书。

## 完整性检查

- 技能 requirements：73 个唯一 ID；报告表格：73 行、73 个唯一 ID。
- 缺失、重复、额外 ID：均无，机器脚本进行了集合比较。
- 最终状态：**Pass 52、Fail 0、Unknown 4、N/A 17**。
- 修复前的 5 个 Fail 已按对应生产证据关闭；没有已确认未解决的 Blocker / High。
- 最终申请准备度：**Ready**；Google 私有后台批准状态：**Unknown**。
