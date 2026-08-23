# ViewExif AdSense Ready 审计（申请版生产复审）

审计日期：2026-08-23

目标：`https://www.viewexif.com` 与提交 `a19baa9`（Cloudflare Pages 部署 `ec8438ca`）

阶段：AdSense 申请版；仅发布 `ads.txt` 与 account meta，不加载 AdSense、Auto Ads、广告位或 Funding Choices 运行时代码

## 结论

- **站点侧结论：申请版已部署并通过生产验收。** 当前代码、生产内容、导航、隐私披露和网络行为没有 `Fail`；完整决策仍是 `Ready after external steps`，须关闭 Google CMP 与 Sites 后台两个证据缺口。
- **Google 后台结论：尚不能称为 `Ready`。** 后台已存在 `viewexif.com`，所有权验证完成且 `ads.txt` 为“已授权”，但审批状态仍是“需要审核”，尚未提交“申请审核”。
- **CMP 结论：已发现两个待修配置。** ViewExif 的 Google 欧洲法规消息已发布，包含 Consent / Do not consent / Manage options 三按钮及英、德、法、简中；但意见征求优化仍开启，隐私政策 URL 仍是错误的 `http://viewexif.com`，所以 `ADS-PRIV-04` 保持 `Unknown`。
- **当前真实计数：`56 Pass / 0 Fail / 2 Unknown / 15 N/A`。** Google CMP 配置、发布并留证后预计为 `57 / 0 / 1 / 15`；Sites 状态再变为 `Ready` 后预计为 `58 / 0 / 0 / 15`。
- Google 的最终批准不能由代码、自动化测试或本报告保证。后台若显示 `Needs attention`，必须按具体原因整改后重新执行全部 73 项。

## 证据边界

- 自动化证据：`pnpm test` 为 253/253；`pnpm build` 成功，生成 85 个唯一、可索引 canonical URL；完整 Playwright 为 184/184，法律页与 i18n 聚焦验收为 15/15。`dist` 中 86 个 HTML（含 404）均恰好有一个正确 account meta，且没有 AdSense/Funding Choices 运行时命中。
- 生产证据：2026-08-23 对 `www.viewexif.com` 运行法律页 Playwright 为 7/7；四语 16 个 Trust URL 全部 HTTP 200、唯一 H1/canonical/account meta、Footer 可达，390px 与 239px 无溢出/控制台错误。生产 sitemap 为 85 URL，根域与 www 的 `ads.txt` 均返回同一精确 seller 行，浏览器未发出 Google 广告请求。
- Google 后台证据：2026-08-23 在 Publisher `pub-7443237558968985` 的 Sites 列表确认 `viewexif.com` 为“需要审核”、`ads.txt` 为“已授权”；站点详情显示所有权验证完成并提供“申请审核”按钮。Privacy & messaging 中 ViewExif 欧洲法规消息为“已发布”，三按钮已开启，选择了英语及另外 31 种语言（含 de/fr/zh-CN），但优化开启且隐私 URL 错误。账号主页另显示地址 PIN 于 2026-08-11 寄出、地址验证仍待完成。
- 代码证据：统一身份在 `src/config/site.ts`；四语 About、Contact、Privacy、Terms 在 `src/components/pages/ContentPage.astro`；全站 meta 在 `src/layouts/BaseLayout.astro`；seller 行在 `public/ads.txt`；长期控制在 `docs/adsense-operations.md`。
- 用户已明确确认：申请者已满 18 岁、控制域名、没有重复 AdSense 账号、该 Publisher ID 属于本次账号、公开邮箱可收信，并承诺长期执行合规流量与 PII 防泄漏 SOP。相关行以“用户确认”作为证据，不把它伪装成 Google 后台或第三方独立验证。
- 本表评估的是**已部署的申请版**。生产页面与网络证据已经复验；Google 账号/CMP 后台状态仍只能由后台截图与实际状态证明。
- 15 个 `N/A` 中，`ADS-PROG-02/03/05/06`、`ADS-PUB-10/12`、`ADS-REST-08`、`ADS-PRIV-07/08/10` 是“申请版尚无广告”的条件性 N/A；启用广告前必须改为实测结论。其余 N/A 由站点类型或受众决定，条件变化时同样重审。

## 官方依据

- [Google Publisher Policies](https://support.google.com/adsense/answer/10502938?hl=en)
- [AdSense Program policies](https://support.google.com/adsense/answer/48182?hl=en)
- [Add a new site to your AdSense sites list](https://support.google.com/adsense/answer/12169212?hl=en)
- [Google consent management requirements](https://support.google.com/adsense/answer/13554020?hl=en-GB)
- [Privacy policy URL requirements](https://support.google.com/adsense/answer/10961370?hl=en)

## 完整 ADS-* 检查表

| ID | Status | Evidence | Next action |
| --- | --- | --- | --- |
| ADS-ELIG-01 | Pass | 用户明确确认申请者已满 18 岁。 | 在账号任务页保存年龄/付款主体完成证据；主体变化时重审。 |
| ADS-ELIG-02 | Pass | 用户明确确认没有重复 AdSense 账号，并使用已确认的现有账号。 | 只在该账号中添加站点，不另建重复账号。 |
| ADS-ELIG-03 | Pass | 本表 C–H 全部为 Pass 或有明确不适用条件；没有 Fail。 | 内容或广告实现变化后重跑完整审计。 |
| ADS-ELIG-04 | N/A | ViewExif 是独立 Cloudflare Pages 网站，不是 Blogger、YouTube 或 AdSense hosted partner。 | 若迁移到托管合作产品，改走对应资格流程并重审。 |
| ADS-OWN-01 | Pass | 已有完整仓库和共享 `<head>` 修改权；`BaseLayout.astro` 已成功注入 account meta，构建验证通过。 | 保持 meta 由单一共享布局输出。 |
| ADS-OWN-02 | Pass | 用户明确确认控制 `viewexif.com` 域名。 | 保存 DNS/Cloudflare 与 AdSense 验证截图。 |
| ADS-OWN-03 | Pass | Astro 页面结构有效；本地完整 Playwright 184/184，生产法律页 Playwright 7/7，覆盖工具 hydration、法律页和 239/390px。 | 依赖或浏览器支持范围变化时复测。 |
| ADS-SITE-01 | Unknown | AdSense Sites 已添加并验证 `viewexif.com`，但后台审批状态为“需要审核”，详情页仍提供“申请审核”按钮，尚未显示 `Ready`。 | 提交审核；仅在 Google 完成审核并显示 `Ready` 后改为 Pass。 |
| ADS-SITE-02 | Pass | 生产首页与四语 Trust 页均恰好输出一个正确 account meta；AdSense 站点详情显示所有权验证已完成。 | 保持 meta 与账号一致，审核期间不要移除。 |
| ADS-TXT-01 | Pass | 根域与 www 的生产 `/ads.txt` 均为 200 并精确返回 seller 行；AdSense Sites 后台已显示“已授权”。 | 账号或销售关系变化时同步更新并复查后台。 |
| ADS-TXT-02 | Pass | 仓库已发布根路径 `ads.txt`，不是仅写在文档中的计划。 | 保持文件可抓取；账号或销售关系变化时同步更新。 |
| ADS-CONTENT-01 | Pass | 站点提供可运行的本地元数据查看、清理、隐私检查和 C2PA 工具，并有 14 篇针对具体分享场景的原创指南。 | 定期复查技术结论，继续增加真实使用场景和实测证据。 |
| ADS-CONTENT-02 | Pass | 核心价值来自自有浏览器工具、解析逻辑、测试和原创说明；文章虽有外部引用，但不是嵌入/聚合页或复制正文。 | 发布新文时保留原创分析与清晰来源。 |
| ADS-CONTENT-03 | Pass | 首页、工具详情、博客文章及法律页均有实质正文；85 个 canonical URL 通过 SEO 构建检查，无空分类/标签页。 | 监测低价值落地页，启用广告前排除信任页和任何薄页。 |
| ADS-CONTENT-04 | Pass | 构建无 coming soon、Lorem Ipsum 或施工占位；工具和博客均可实际使用/阅读，申请版没有广告。 | 部署后抽查所有主导航目标 200。 |
| ADS-CONTENT-05 | Pass | 申请版没有广告、联盟模块、赞助列表或付费推广，付费内容占比为 0。 | 将来接入任何商业模块后重新计算首屏与整页比例。 |
| ADS-CONTENT-06 | Pass | 英语、德语、法语、简体中文均为 AdSense 支持语言；本地化页面含真实正文并有 hreflang。 | 新增语言前先确认支持范围与翻译质量。 |
| ADS-CONTENT-07 | N/A | 仓库没有评论、论坛、公开投稿或其他 UGC 发布入口。 | 若增加 UGC，先建立审核、举报和垃圾内容处理流程。 |
| ADS-CONTENT-08 | Pass | SEO 构建检查要求唯一 canonical、正确内部链接与一致语言替代；抽查页面是场景化内容，没有 doorway 模板或关键词堆砌。 | 上线新批量路由时检查重复率、H1 和搜索意图。 |
| ADS-UX-01 | Pass | Header/Footer 导航均为真实内部链接；生产 Playwright 覆盖四语 Footer，239px 与 390px 无横向溢出、无控制台错误。 | 导航变化后在桌面与手机复测。 |
| ADS-UX-02 | Pass | 首页说明本地元数据工具用途；工具、博客与 Trust 区路径明确，详情页有 breadcrumbs/schema 与相关工具链接。 | 用真实用户路径复查“查看—清理—验证—帮助”闭环。 |
| ADS-UX-03 | Pass | 代码检查与浏览器测试未发现假下载/播放按钮、广告伪装、空链接或无关跳转；下载动作对应本地生成文件。 | 新 CTA 和外链上线时加入回归检查。 |
| ADS-UX-04 | Pass | 页面不改浏览器偏好、不自动跳转或下载；无 popup/popunder，文件操作须用户选择并在浏览器本地执行。 | 保持第三方脚本最小化，并持续检查供应链变更。 |
| ADS-UX-05 | Pass | 四语 About、Contact、Privacy、Terms 已落地；16 个生产 URL 均为 200，Footer 可达，Contact 使用 `mailto:` 且无虚构公司、地址或表单。 | 保存公开邮箱真实投递与回复记录。 |
| ADS-UX-06 | Pass | 申请版无广告位、广告占位或仿广告模块，不存在广告与内容边界混淆。 | 广告版设计评审时明确标签与安全间距。 |
| ADS-CRAWL-01 | Pass | 公开站点可访问；生产抽查与四语 16 个 Trust URL 均为 HTTP 200，构建生成首页、工具、博客及信任页，无缺失路由。 | 提交审核期间保持生产路由稳定。 |
| ADS-CRAWL-02 | Pass | `public/robots.txt` 为 `User-agent: *` + `Allow: /`，无登录墙；静态 Pages 路由不依赖账号或 POST。 | 部署后以普通浏览器和抓取客户端检查 WAF/地区限制。 |
| ADS-CRAWL-03 | Pass | 所有可索引内容都是静态 GET URL；文件选择仅增强本地工具，不是读取页面正文的 POST 前提。 | 广告只考虑 GET 可访问且有发布者内容的页面。 |
| ADS-CRAWL-04 | Pass | 仅见明确的旧 PDF 路径 301 到文档查看器；主 canonical 路由不依赖 cookie/session 重定向。 | 部署后用 redirect trace 抽查首页、文章与工具页。 |
| ADS-CRAWL-05 | Pass | 85 个 canonical 均为稳定、尾斜杠路径；没有 session ID、用户 ID 或一次性查询串，构建检查保证唯一性。 | 新动态路由继续经过 canonical/SEO 构建门槛。 |
| ADS-CRAWL-06 | Pass | `www.viewexif.com` 经 HTTPS 正常访问，根域重定向到 www；Cloudflare Pages 生产部署成功，构建资产通过 25 MiB Pages 限制检查。 | 持续监测 DNS、TLS 和代表性响应时延。 |
| ADS-CRAWL-07 | Pass | `robots.txt` 指向 `https://www.viewexif.com/sitemap.xml`；生产 sitemap 含 85 URL，并与 85 个 indexable canonical 一致。 | 向搜索工具提交并在路由变化后复查。 |
| ADS-PROG-01 | Pass | 用户接受不自点、不刷量、不使用机器人/重复操作；`docs/adsense-operations.md` 规定月度无效流量检查与处置。 | 广告启用后保留每月来源、CTR、自动化流量记录。 |
| ADS-PROG-02 | N/A | 申请版没有广告，因此没有诱导点击文案、奖励点击或广告旁箭头。 | 启用广告时实测广告周边文案；禁止任何点击号召。 |
| ADS-PROG-03 | N/A | 申请版没有广告单元或广告标签可供检查。 | 广告启用前检查标签、边界、颜色和导航距离。 |
| ADS-PROG-04 | Pass | 用户确认流量合规要求纳入长期 SOP；运营文档明确禁止 paid-to-click、点击交换、垃圾导流和机器人流量。 | 每月按来源/国家/落地页审查异常，并保存处置证据。 |
| ADS-PROG-05 | N/A | 没有 AdSense loader、广告代码、wrapper 或修改逻辑。 | 未来只使用官方代码；任何 wrapper 变更后重审。 |
| ADS-PROG-06 | N/A | 当前没有 Google 广告，因而未在工具、弹窗、邮件、私聊、无内容页或第三方 frame 中投放。 | 启用时明确排除 Trust 页及低内容页，并实测工具交互区域。 |
| ADS-PROG-07 | N/A | ViewExif 是普通浏览器网站，不是原生 App WebView。 | 若封装为 App/WebView，单独按 WebView 政策审计。 |
| ADS-PUB-01 | Pass | 仓库内容范围是合法的文件元数据查看、清理、隐私教育和技术指南；未发现违法活动销售或指导。 | 新主题/下载内容发布前做政策筛查。 |
| ADS-PUB-02 | Pass | 文章保留来源链接但提供自有分析；品牌页明确无虚假从属，工具不销售仿品或绕过版权保护。 | 持续核对图片、引文和库许可证。 |
| ADS-PUB-03 | Pass | 14 篇文章及工具内容未出现仇恨、骚扰、威胁、自残、暴力赞美、恐怖主义或敲诈主题；无 UGC。 | 内容范围变化或引入 UGC 时重审。 |
| ADS-PUB-04 | Pass | 内容目录没有虐待动物或濒危物种制品相关页面、商品或链接。 | 若扩展到新垂类，重新筛查。 |
| ADS-PUB-05 | Pass | About 明确 ViewExif 由个人独立运营，说明工具开发、文章编写和技术核验责任；统一署名 `ViewExif`，并否认虚假机构/品牌从属。 | 保持 About、作者 schema、meta author 与实际运营一致。 |
| ADS-PUB-06 | Pass | 无登录/联系表单、付费承诺或收集凭据流程；工具说明具体且文件处理在本地，没有 phishing 或致富承诺。 | 新增表单、账号或商业承诺前做安全/真实性审查。 |
| ADS-PUB-07 | Pass | 工具用于查看或删除用户自己选择文件的元数据，不提供假证件、作弊、破解、DRM 绕过或未经授权跟踪能力。 | 文案继续强调用户责任和授权文件。 |
| ADS-PUB-08 | Pass | 内容库存没有有偿性行为、跨境婚介、家庭向成人主题或儿童性剥削内容；无 UGC。 | 任何用户内容入口上线前加入强制审核。 |
| ADS-PUB-09 | Pass | 站点品牌、作者、运营说明、account meta 和 `ads.txt` 一致；用户确认 Publisher ID 属于本次账号。 | 在 Google 后台核对付款主体、域名、Publisher ID，并保存截图。 |
| ADS-PUB-10 | N/A | 申请版不加载广告，无法出现广告覆盖内容、导航或退出陷阱。 | 广告版在桌面、390px 和 239px 实测每个 placement。 |
| ADS-PUB-11 | Pass | 计划明确广告启用后排除 About、Contact、Privacy、Terms 和其他低内容页；其余候选页有工具或原创长文，当前也无广告。 | 启用广告前落实逐路由排除并抽查内容/推广比例。 |
| ADS-PUB-12 | N/A | 当前没有后台、屏外、失焦或上下文外的广告 placement。 | 广告版检查 lazy load、visibility 和页面焦点条件。 |
| ADS-PUB-13 | Pass | 内容范围不涉及选举、民主程序、健康共识或气候否认；抽查库存未发现相关虚假主张。 | 若发布新闻、健康、政治或气候内容，逐篇事实核验。 |
| ADS-PUB-14 | Pass | 没有利用操纵媒体欺骗用户的政治、社会议题或公共事件内容；C2PA 页面反而解释来源凭证限制。 | 未来使用生成/编辑媒体时披露其性质与用途。 |
| ADS-PUB-15 | Pass | 站点与内容库存没有儿童诱骗、性化、勒索、贩运或 CSAM 内容，也无 UGC/上传到服务器的发布能力。 | 若发现任何信号立即下架、报告并停止变现。 |
| ADS-PUB-16 | Pass | 站点不是危机新闻或敏感事件站，内容库存没有利用、否认或消费活动危机的页面。 | 发布时事内容或敏感事件页面前单独评估并排除广告。 |
| ADS-REST-01 | Pass | 内容库存未发现色情、性娱乐、性产品或性建议主题。 | 内容或 UGC 范围变化时复查。 |
| ADS-REST-02 | Pass | 未发现血腥、暴力、恶心素材或突出粗口；视觉资产是工具截图/封面风格。 | 新图片、视频和评论入口上线前筛查。 |
| ADS-REST-03 | Pass | 无爆炸物、枪械、武器销售或制作/改造指南。 | 新垂类上线时重审。 |
| ADS-REST-04 | Pass | 无烟草、娱乐性毒品、用具或制作/使用指导。 | 新垂类上线时重审。 |
| ADS-REST-05 | Pass | 无在线酒类销售、联盟链接或不负责任饮酒宣传。 | 新垂类上线时重审。 |
| ADS-REST-06 | Pass | 无博彩、真钱游戏或付费机会游戏。 | 若增加游戏/促销机制，先按地区重审。 |
| ADS-REST-07 | Pass | 无处方药销售、在线药房、未批准药品/补充剂或下架应用推广。 | 新健康/应用内容上线时重审。 |
| ADS-REST-08 | N/A | 申请版没有展示/视频广告，不能实测遮挡、控件覆盖、自动播放或 sticky video 行为。 | 启用广告后以真实创意和多视口重新审计。 |
| ADS-PRIV-01 | Pass | 四语 Privacy 披露 Google 启用广告后可能进行的数据收集/共享/用途，明确 Cookie、local storage、web beacon、IP、设备标识、页面和广告互动，并从 Footer 可达。 | 实际启用任何 Google 广告能力前核对披露与配置一致。 |
| ADS-PRIV-02 | Pass | 四语 Privacy 明确 Google 与广告技术合作伙伴可能放置/读取 Cookie，并通过 web beacon、IP 和其他标识收集信息。 | 合作伙伴或处理目的变化时先更新政策。 |
| ADS-PRIV-03 | Pass | 解析、清理和导出由浏览器 worker/Object URL 完成；敏感文件名/路径/邮箱/GPS/哈希/元数据 E2E 未发现不安全出站，生产法律页测试也未发现 Google 广告请求；SOP 要求月度复测。 | 每月按 SOP 重做全流程 PII 网络留证。 |
| ADS-PRIV-04 | Unknown | Google 欧洲法规消息已为 ViewExif 发布，三按钮已开启，英语及 31 种其他语言含 de/fr/zh-CN；但意见征求优化仍开启，隐私政策 URL 仍是错误的 `http://viewexif.com`，也尚无 EEA/UK/CH 撤回实测。 | 关闭优化，将 URL 改为 `https://www.viewexif.com/privacy/` 并发布；广告启用后再实测同意、拒绝、管理和撤回。 |
| ADS-PRIV-05 | Pass | 网站不请求浏览器 geolocation；文件内 GPS 只在本地解析/显示，不由 ViewExif 收集或传给 Google，Privacy 明确披露此边界。 | 保持本地处理；若未来收集精确位置，先做即时告知、opt-in、加密与政策更新。 |
| ADS-PRIV-06 | N/A | ViewExif 是通用文件隐私/元数据工具，不是面向 13 岁以下儿童的站点或专区。 | 受众或内容定位变化时评估 COPPA 标记和非个性化处理。 |
| ADS-PRIV-07 | N/A | 申请版没有 Google 广告/CMP 自定义 cookie 代码，也没有代理 Google 域 cookie 的逻辑。 | 接入广告后检查所有自定义脚本，不得改动 Google 域 Cookie。 |
| ADS-PRIV-08 | N/A | 申请版没有 Google 广告个性化、remarketing、受众列表或相关 data-layer 事件。 | 广告启用前审查 CMP、个性化和敏感受众配置。 |
| ADS-PRIV-09 | N/A | ViewExif 不经营或推广住房、就业、信贷，也没有美国/加拿大相关广告受众定向。 | 若开展此类广告活动，按受限属性重新审计。 |
| ADS-PRIV-10 | N/A | 申请版不使用个性化广告，也未构建广告受众数据。 | 若启用个性化，验证数据权利、AdChoices/行业披露与撤回控制。 |

## 完整性校验

- 参考清单 ID：73
- 本报告 ID：73
- 重复 ID：none
- 缺失 ID：none
- 非法状态：none
- 状态汇总：`Pass 56 / Fail 0 / Unknown 2 / N/A 15`

## 剩余 Google 后台门槛

1. 在 Google CMP 关闭意见征求优化，将隐私政策 URL 改为 `https://www.viewexif.com/privacy/`，发布并留证，使 `ADS-PRIV-04` 从 Unknown 变为 Pass；申请版仍不加载 CMP/Funding Choices 标签。
2. 点击“申请审核”；仅在 Sites 显示 `Ready` 后使 `ADS-SITE-01` 从 Unknown 变为 Pass。地址 PIN 到达后由账号持有人完成地址验证。
3. 保持本次申请版不启用广告。Ready 后启用广告仍需单独处理 CSP、Trust 页排除、CMP 运行时和 10 个条件性 N/A 项。
