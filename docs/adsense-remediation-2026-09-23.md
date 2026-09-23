# ViewExif AdSense 修复后复核 · 2026-09-23

**状态：初稿，验证与发布结果待主审核者回填。结论：Ready after fixes。**

本文件评估本轮候选源码、当天持有人确认和新增素材台账。当前还不能把候选源码的修改写成“生产已修复”或“可以立即提交”。旧报告 [adsense-audit-2026-09-23.md](./adsense-audit-2026-09-23.md) 及其证据继续作为修复前快照，不改写历史结论。本轮没有提交 AdSense 审核、开启广告或代发联系邮件。

完成下面的验证与发布后，可以将 **application-readiness** 更新为 Ready；它只表示网站具备提交条件。**Google Sites Ready** 是私有后台的实际审核结果，本报告不能代替 Google 批准，也不能保证通过。

## 待填写的版本与验收记录

| 项目 | 本初稿状态 | 最终证据（待填写） |
| --- | --- | --- |
| 修复前版本 | `c42b98a`；同日只读审核已存档 | 旧报告与旧证据保留 |
| 候选/最终提交 | Pending | SHA、分支、变更清单 |
| 单元测试 | 本地通过 | `pnpm test`：287/287；首次并行构建时 PDF 5 秒超时，原时限单独复跑通过 |
| 构建与 SEO/资源检查 | 本地通过；干净提交构建待发布阶段完成 | `pnpm build`：Astro 0 errors、101 个 sitemap URL，SEO 和资源检查通过 |
| 本地浏览器隐私回归 | Pending | 真实 Ahrefs pageview、地图各操作、重选/清除/刷新/卸载的请求摘要 |
| 导航与移动端回归 | 本地通过 | 首轮 246 项中 235 通过；10 条旧 UI 测试按真实展开/菜单操作修正，1 条外部资源连接中断；相关 29 项复跑全通过。包含 20 个清理页、28 篇文章和 320/375/390/430/1440px 结果布局 |
| 生产发布 | Pending | 部署 ID、URL、提交 SHA、完成时间 |
| 发布后全站与图片 GET | Pending | 新目录中的 crawl.json / images.json；实际数量、失败数 |
| 发布后隐私/导航浏览器复验 | Pending | 生产 Ahrefs 与实际 Cloudflare RUM 请求证据、工作区锚点、文章工具路径 |
| 最终 application-readiness | Pending | 由主审核者在证据齐全后填写 |
| Google Sites 当前状态 | Unknown | 运营者在后台确认，不以代码或测试替代 |

这里的 Pending 是工作进度；下方政策表仍严格使用 Pass、Fail、Unknown、N/A 四种状态。已修改但尚待运行时验证的要求暂记 Unknown，而不是提前改成 Pass。修复前生产的已知缺陷只有在对应版本发布并复验后才算关闭。

## 本地验证记录

原始失败如实保留：单元测试首次有 PDF 冷启动超时（286 passed / 1 failed），没有扩大 5 秒时限；单独重跑 287 passed。浏览器首轮 235 passed / 11 failed，10 项引用旧版始终展开的详情/导出控件或不唯一选择器，现先执行真实展开操作并保留字段、尺寸、格式、复制、下载与懒加载断言；Gmail 239px 检查遇到 `ERR_CONNECTION_CLOSED`，断言不变复跑通过。整份图片查看器及 Gmail 单项合计 29 passed。

真实统计回归首轮 1 passed / 1 failed，Windows Chromium 中键进入自动滚动模式，随后 Clear 鼠标点击先退出模式。测试显式 Escape 退出浏览器模式后，保留并加强清除断言：文件名、作者、哈希、预览、GPS、导出消失，文件输入为空、选择按钮可用且焦点归还；针对性测试通过。未修改产品清除行为。干净构建还暴露了新增测试 tuple 在项目严格模式下的两处类型错误，已用只读 tuple 类型修正并重新通过 Astro 检查。扩展三浏览器后，WebKit 的 Blob URL 被测试代理误当 HTTP、Firefox 映射请求继承原 Host 导致 403，均已修正。随后 Chromium/WebKit 的真实统计流程及三浏览器常规发布检查通过；Firefox Worker 动态 import 不进入 context.route，最小对照已复现此虚拟 DNS 限制，因此保留本地失败记录，并在真实生产域名用同一完整断言复核，不放宽正向 pageview、文件解析或隐私检查。生产验收完成前仍不标 Ready。

内容保全证据：[adsense-content-preservation-2026-09-23.json](./adsense-content-preservation-2026-09-23.json)。101 个页面 URL/title/H1/canonical/robots 与修复前保存 HTML 相同，28 篇正文及 28 张源封面字节保持不变。

## 三个问题的修复与关闭条件

修复前的 5 个 Fail 对应三个问题，不是五种互不相关的违规：GPS 统计外传关联隐私两项和总体合规项，另两个 Fail 是局部导航缺陷。

1. **High：含 GPS 的地图 href 被统计脚本捕获。** 候选 [MetadataReportWorkbench.tsx](../src/components/MetadataReportWorkbench.tsx) 把地图入口改为按钮，坐标 URL 保留在事件闭包，明确操作时才用 `window.open` 打开；页面不再为该操作渲染含坐标的链接 href。[四语就地提示](../src/i18n/workbench-report.ts) 和 [Privacy](../src/components/pages/ContentPage.astro) 同步说明新标签页、OpenStreetMap 接收坐标与网络信息；政策日期更新为 2026-09-23。保留 Ahrefs 页面统计，不能把“脚本在测试中没有运行”误判为隐私通过。新增 [analytics-privacy.spec.ts](../tests/e2e/analytics-privacy.spec.ts) 使用真实 SDK、普通访客检测和合成文件，并在外发前拦截敏感请求。**关闭条件：**本地与生产实测均有真实 pageview；普通/键盘/辅助操作和页面生命周期没有将坐标、文件名、文件内容标记或哈希带入任何未授权请求；只有明确操作的 HTTPS 地图导航带坐标。当前仅确认源码与验证计划，实际结果 Pending。
2. **Medium：清理页的工作区锚点不存在。** 候选 [MetadataRemovalWorkbench.tsx](../src/components/MetadataRemovalWorkbench.tsx) 给清理区域增加 `id="metadata-workbench-tool"`，共享指南无需改变 URL；滚动间距避免被页头遮挡。**关闭条件：**四语 × 五类清理页面，在初始 HTML 和水合后都恰有一个目标，CTA 能滚动到文件选择区，不自行弹出文件选择器、处理文件或下载。对应 [navigation-readiness.spec.ts](../tests/e2e/navigation-readiness.spec.ts)，结果 Pending。这是页内定位缺陷，不是 HTTP 断链或已证实的欺骗行为。
3. **Medium：非图片文章尾部推荐图片工具。** 候选 [BlogToolStrip.astro](../src/components/BlogToolStrip.astro) 按文章类别映射 image/document/audio/video/all；文章模板传入 category，未知类别和索引页回退到通用工具，非图片文章不显示图片隐私检查器。**关闭条件：**28 篇文章及博客分页的推荐路径与实际主题相符，正文原有路径和封面保留；小屏幕可操作且无溢出。浏览器回归已编写，结果 Pending。

这三项分别依据 Google 的 [页面内容与导航要求](https://support.google.com/adsense/answer/7299563?hl=zh-Hans) 和 [发布商隐私/位置数据政策](https://support.google.com/adsense/answer/10502938?hl=zh-Hans)。修复优先切断未披露的数据通路，不以修改措辞允许 GPS 进入统计。

## 本次新增确认与可保留的证据

- **持有人确认（2026-09-23）：**申请者已满 18 岁，无重复 AdSense 账号，控制该域名和 Publisher ID `pub-7443237558968985`。这是本次明确声明，不是读取身份证、付款后台或 AdSense 私有页面的结果。
- **28 张封面保留：**[图片来源台账](./blog-image-sources.md)逐项记录关联文章、本地文件、字节数和 SHA-256。2 张有具体原页/作者记录并核对官方页面：Athena Sandrini #2962087，以及从 Git 历史恢复的 ready made #3850268。其余 26 张记录 `owner attested 2026-09-23` 的 Pexels 来源声明，不虚构逐图独立认证。28 个源文件哈希全部与修复前 HEAD 一致。通用许可已重新阅读 [Pexels License](https://www.pexels.com/license/)；缺少旧 URL 不等于已侵权，也不要求因此批量换图。
- **内容审阅未因修复失效：**28 篇文章正文未被本轮修改；同日内容分审计已清点全部文章并深读/对照 8 篇，确认有具体字段、操作、限制及工具增量。六篇平台文章已注明历史资料边界。13 篇正文外链只有 Reddit 是来源改进建议，不是抄袭、欺骗或必拒的证明；没有最低篇数、字数、流量或公开真实姓名的额外门槛。
- **修复前技术基线：**当天全量 101/101 sitemap 页面与 28/28 图片目标可访问，0 HTTP 断链、空主区域或完全重复正文；域名归一、DNS/TLS、robots、canonical、meta 和 ads.txt 正常。它们是修复前基线，不冒充发布后复验。原文件：`.tmp/adsense-live-evidence-20260923.json`、`.tmp/adsense-live-images-evidence-20260923.json`。
- **演示素材：**[样例来源说明](../public/samples/SOURCES.md)已区分 AI 生成的示例风景/合成 EXIF 与 Adobe C2PA 公共测试文件，记录许可和文件哈希；这类例子不声称是真实拍摄或已被信任的签名。

## 73 项重新评估

范围说明：`候选源码` 指本轮修改的当前工作区；`同日基线` 指修复前的实时 GET/浏览器证据；`持有人确认` 指本次用户声明。Pass 只覆盖列明的证据，不能推出未来投放或全量私有账号也已合规。Google 后台、真实 Google 来源 IP/WAF 和真实推广流量不可独立核验的项目保留 Unknown，**它们不是本轮已证实的 High 缺陷**。

| ID | Status | 当前证据与判定理由 | 下一步 |
| --- | --- | --- | --- |
| ADS-ELIG-01 | Pass | 持有人本次确认已满 18 岁；未读取身份证明。 | 用已确认的成年申请者账号办理。 |
| ADS-ELIG-02 | Pass | 持有人本次确认没有重复 AdSense 账号。 | 继续用现有对应账号添加/复审网站。 |
| ADS-ELIG-03 | Unknown | 已重新评估以下内容与行为项；GPS 与两项导航修复已落入候选源码，运行时/生产关闭证据 Pending。 | 完成三个问题的关闭条件后再给总体合规结论。 |
| ADS-ELIG-04 | N/A | 独立域名的 Astro 网站，不是 Blogger/YouTube 托管合作伙伴流程。 | 使用独立网站申请流程。 |
| ADS-OWN-01 | Pass | BaseLayout 有 head 注入入口；当前仓库可编辑，同日 101 页均有账号 meta。 | 发布后确认标记仍恰好一个。 |
| ADS-OWN-02 | Pass | 本次持有人确认域名及对应 Publisher ID 控制权，仓库与公开配置吻合。 | 由本人在后台完成验证，不冒称独立身份调查。 |
| ADS-OWN-03 | Pass | Astro/React 正常 JS 结构；同日基线浏览器已完成文件解析、接续与下载，站点支持脚本。 | 候选修改仍须通过构建与浏览器回归。 |
| ADS-SITE-01 | Unknown | 未读取 AdSense 私有 Sites 状态。 | 运营者核对当前验证/复审入口；Google Sites Ready 后才投放。 |
| ADS-SITE-02 | Pass | account meta 与根目录 ads.txt 已部署且一致；候选源码保留两种入口。 | 后台使用可用方法完成验证，不为验证提前加广告脚本。 |
| ADS-TXT-01 | Pass | 两域可到达正确 Google DIRECT seller 行，pub ID 已获持有人确认。 | 发布后复测 200/text/plain；后台 Authorized 单独记录。 |
| ADS-TXT-02 | Pass | public/ads.txt 存在，同日生产成功抓取。 | 保持可访问，账号变化时同步。 |
| ADS-CONTENT-01 | Pass | 可运行的本地工具与 28 篇用途相关指南；同日 8 篇深读有具体操作、字段和限制，正文未变。 | 优先补当前自有样例与技术一手来源，不凑文章数量。 |
| ADS-CONTENT-02 | Pass | 已读文章不是纯摘录、嵌入或联盟 feed，有问题分析和本站工具增量；未见无增量复制。 | 保留来源和适用范围；这不是全网查重认证。 |
| ADS-CONTENT-03 | Pass | 工具未选文件时已有静态解释；博客详情可 GET 阅读；分页连接完整文章。 | 启用广告时重新评估空结果、状态和信任页的投放范围。 |
| ADS-CONTENT-04 | Pass | 同日基线页面成形，源码无建设中或 Lorem 占位；本轮保留文章与封面。 | 新版本发布后检查状态及资源。 |
| ADS-CONTENT-05 | Pass | 当前无广告、联盟或付费推广占据主体，工具 CTA 是本站功能入口。 | 广告上线后按真实版面重新评估内容占比。 |
| ADS-CONTENT-06 | Pass | 英语、德语、法语、简体中文均在官方支持列表，四语主体内容存在。 | 继续检查新增动态提示的四语覆盖。 |
| ADS-CONTENT-07 | N/A | 无公开评论、论坛或投稿；本地文件读取不发布为公共 UGC。 | 将来开放发布型 UGC 时加入审核机制。 |
| ADS-CONTENT-08 | Pass | 站内字面重复检查及深读未见门页或关键词堆砌；相近入门主题有各自操作与限制。 | 新内容优先补案例，避免继续铺同义关键词页面。 |
| ADS-UX-01 | Unknown | 候选清理工作区已新增稳定 id；旧版 20 页无目标锚点已确认，但新结果 Pending。 | 全 20 页检查 SSR、水合、滚动与移动端操作。 |
| ADS-UX-02 | Unknown | 候选文章类别映射已改为对应格式工具；索引/未知类别用通用工具。 | 运行 28 篇及所有分页的实际推荐路径回归。 |
| ADS-UX-03 | Pass | 没有伪装下载/广告入口；同日基线真实清理副本可下载，未发现蓄意欺骗。两项局部导航缺陷另记。 | 保持下载对应明确选择的输出，复测新 CTA。 |
| ADS-UX-04 | Pass | 文件选择、清理、下载均需明确操作；无恶意弹窗、自动下载或偏好篡改实现。地图候选为明确按钮操作。 | 地图运行时开窗与隐私检查仍需完成。 |
| ADS-UX-05 | Pass | About/Contact/Privacy/Terms 四语齐全；个人运营、责任、邮箱和工具边界具体说明。 | 邮箱收发由运营者维护；本轮不代发邮件。 |
| ADS-UX-06 | Pass | 当前无广告占位或伪广告布局；工具与知识说明可区分。 | 将来投放时检查实际标签和视觉边界。 |
| ADS-CRAWL-01 | Pass | 同日基线 101 页全 200、额外内部目标成功，未知 URL 真 404；候选未删公开路由。 | 发布后按新 sitemap 全量复抓，回填实际数量。 |
| ADS-CRAWL-02 | Unknown | robots 放行，普通请求及 Google UA 成功，但无真实 Google 来源 IP、地区限制或 WAF 规则/事件证据。 | 有后台抓取报错时核对 Cloudflare 事件；不能把 UA 200 写成真实爬虫认证。 |
| ADS-CRAWL-03 | Pass | 静态页面无需 POST 或登录即可读取主要内容；本地结果是用户操作状态。 | 不在仅有私有状态的屏幕新增广告请求。 |
| ADS-CRAWL-04 | Pass | 同日 sitemap 页面无重定向；HTTP/裸域到 HTTPS www 单跳，候选配置未改变。 | 发布后重测协议与域名变体。 |
| ADS-CRAWL-05 | Pass | 稳定路径与自指 canonical，无会话参数；文件接续采用内存单槽。 | 保持文件名/元数据不进入网站 URL 与持久存储。 |
| ADS-CRAWL-06 | Pass | 同日两域 A/AAAA、TLS1.3 和证书链正常、请求成功；不是长期 uptime 证明。 | 保持监测并在发布后复核 DNS/HTTPS。 |
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
| ADS-PUB-05 | Unknown | 个人运营与品牌关系说明真实，持有人已确认控制权；GPS 隐私承诺已改为出站请求表述，实际一致性仍待回归。 | 完成隐私网络验证后关闭该功能说明的一致性缺口。 |
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
| ADS-PRIV-01 | Unknown | 四语政策披露 Ahrefs/Cloudflare、地图和未来 Google 广告处理；候选已更新统计承诺，但实际遵守仍待网络验证。 | 对本地与生产的实际 SDK、全部出站请求取证后判定。 |
| ADS-PRIV-02 | Pass | 四语 Advertising 节说明将来 Google/合作方可能使用 Cookie、local storage、beacon、IP/标识符及用途，当前无广告状态也说明。 | 投放方式变化前同步更新披露。 |
| ADS-PRIV-03 | N/A | 当前没有 Google 广告、Google Analytics 或受众请求；Ahrefs GPS 问题另在隐私项跟踪。 | 广告上线后检查所有请求参数和 PII 风险。 |
| ADS-PRIV-04 | N/A | 当前未运行 Google 广告同意流程；无 CMP 横幅本身不是无广告申请版本的缺陷。 | 投放前按地区、广告类型和存储行为实现适用同意/CMP。 |
| ADS-PRIV-05 | Unknown | 候选坐标链接改为明确按钮操作，含接收方和数据说明；精确坐标不进入统计的实际保证待验证。 | 测普通/键盘/辅助激活、重选/清除/刷新/卸载及实际 RUM，只有明确地图导航可带坐标。 |
| ADS-PRIV-06 | N/A | 普通摄影/文件工具非面向儿童的内容，当前无定向广告。 | 受众或广告配置改变时评估儿童内容标记。 |
| ADS-PRIV-07 | N/A | 未见操作 Google 域 Cookie 的自定义广告、代理或拦截代码。 | 新增广告/代理功能时复核。 |
| ADS-PRIV-08 | N/A | 当前无 Google 个性化广告、再营销或敏感受众名单实现。 | 开启广告时不把文件内容或敏感属性用于受众。 |
| ADS-PRIV-09 | N/A | 没有美国/加拿大住房、就业、信贷广告定向业务。 | 业务改变时检查定向限制。 |
| ADS-PRIV-10 | N/A | 当前无个性化广告及相应受众数据使用。 | 启用后验证数据权利、说明、选择与撤回入口。 |

## 需回填的最小证据清单

1. **版本与构建：**最终 SHA、构建命令和退出结果、当前 sitemap 数量；不沿用旧的 100 页 baseline 作为全量覆盖。
2. **隐私：**本地和生产浏览器结果；必须证明真实 SDK 已产生 pageview；生产应包含实际 Cloudflare RUM，并覆盖当前单个地图按钮、键盘/鼠标/辅助动作、无 GPS 文件、重选、清除、刷新、软导航与页面卸载。记录无敏感字段请求；拦截到的泄漏也要算失败，不能因为已阻止网络而记通过。
3. **导航：**20 个清理路由初始与水合后的唯一目标、真实滚动/无自动操作；28 篇文章和博客分页正确推荐，320/375/390/430px 可操作无溢出。
4. **生产资源：**新证据目录中的全 sitemap GET 与去重图片 GET；保存实际总数、失败数、canonical/meta/robots 结果。修复前证据不得覆盖。
5. **范围保持：**28 张封面哈希与台账一致；无 AdSense/Funding Choices 运行标签，未自动提交审核、未开启广告。
6. **最终决策：**只有上述关闭条件完成后才把本表中与修复相关的 Unknown 改成实测 Pass，并填写 application-readiness；未取得后台/流量/WAF 证据的 Unknown 保留，不冒充已测违规或后台已 Ready。

## 官方依据与适用边界

2026-09-23 已重新读取技能完整要求，并刷新以下官方资料。若 Google 以后更新，以更新后的官方要求为准。

- 资格、控制权和审批阶段：[加入资格](https://support.google.com/adsense/answer/9724?hl=zh-Hans)、[网站拥有权](https://support.google.com/adsense/answer/91205?hl=zh-Hans)、[网站管理](https://support.google.com/adsense/answer/12131223?hl=zh-Hans)、[验证与 Request review 流程](https://support.google.com/adsense/answer/12169212?hl=en)。支持 meta/ads.txt 验证；申请准备度与 Google 的审核就绪状态分别记录。
- 内容与导航：[页面要求](https://support.google.com/adsense/answer/7299563?hl=zh-Hans)、[支持语言](https://support.google.com/adsense/answer/9727?hl=zh-Hans)。网站实际内容和可用性是依据，不添加未被官方规定的文章数量/字数门槛。
- 技术访问：[抓取问题](https://support.google.com/adsense/answer/2381908?hl=zh-Hans)。本轮公共请求可达不能替代真实 Google 来源的服务端证据。
- 广告行为、版权、身份和隐私：[AdSense 合作规范](https://support.google.com/adsense/answer/48182?hl=zh-Hans)、[Google 发布商政策](https://support.google.com/adsense/answer/10502938?hl=zh-Hans)、[发布商限制](https://support.google.com/adsense/answer/10437795?hl=zh-Hans)。当前无广告不免除网站本身的内容与隐私准备要求；未匹配某类违规也不意味着未来投放无需再查。
- 同意阶段：[发布商 CMP 要求](https://support.google.com/adsense/answer/13554116?hl=en)。EEA/英国/瑞士个性化广告须用 Google 认证且集成 IAB TCF 的 CMP，其他模式仍要按实际处理落实适用同意。当前无广告版本不能因为没有横幅被单独判不合格。
- 素材许可：[Pexels License](https://www.pexels.com/license/)。台账准确区分原始来源记录与持有人确认，不编造逐图授权证书。

## 完整性检查

- 技能 requirement ID：73。
- 本报告表格 ID：73 个，逐项一行；技能示例表中重复列出的 2 个 ID 不重复计数。
- 重复/遗漏：均无；无额外 ID。
- 初稿状态统计：Pass 46、Fail 0、Unknown 10、N/A 17；其中修复后的运行时结论尚未完成，不用这一统计宣称旧缺陷已经在线关闭，也不把它当作获批概率。
- 最终发布后状态：Pending，不能用此初稿宣称生产验证完成。
