# ViewExif 低价值内容整改后 AdSense 审计

审计日期：2026-09-05。对象：https://www.viewexif.com 。代码提交：`e84c87a`；Cloudflare 生产部署：`59ca39e9`。本报告取代旧报告作为当前状态，旧报告仅保留历史证据。

## 结论

**Not ready（尚不能宣称通过 Google 审核）。** 站点内容整改已发布并完成本地验收；Google 最近可用证据仍是用户提供的 2026-09-03「Needs attention／低价值内容」截图。不能把代码改善、部署成功或测试通过改写为 Google 的 Ready。

**53 Pass / 3 Fail / 2 Unknown / 15 N/A，共 73 行。** 三个 Fail 是拒绝尚未解除在总体合规、站点审批、内容价值三项中的保守记录，不是三个新发现的技术故障，也不是对新版本作出 Google 式判决。

## 重要问题与下一步

- Blocker：后台仍有低价值拒绝，尚无新审核结果。完成内容/来源复核并核对后台申请入口；不自动提交审核，不启用广告。
- High：CMP 历史配置缺口尚无新证据；核对隐私 URL、关闭优化、三按钮和四语，保存截图。广告启用前另做真实地域与撤回测试。
- High：截图只显示落地页指标，无法核验所有流量来源；持有人需核对来源和异常流量，SOP 不能代替日志。
- Medium：84 条文章外链初次自动检查中 70 条受限或超时，11 条可达，3 条 ExifTool 返回异常；后者已改为可读取的官方 GitHub 文档。Google Photos/Gmail/Telegram 官方页面已通过另一网页工具补核。其余受限引用不标为已核验。Reddit 仅作为历史场景，不作为现行平台保证。

## 本轮证据

- `pnpm test`：253/253；`pnpm build`：成功，0 类型错误、3 条既有提示。
- 本地静态构建上的完整 Playwright：246/246，覆盖博客、四语、法律页、所有工具与隐私网络检查。
- 生产域名上的法律页与全站三视口 Playwright：10/10；99 页在三种视口均通过，四语信任页及无广告请求专项通过。
- 新保留测试：99 页 × 1440/390/239px，唯一 H1、自引用 canonical、HTTP 200、无整页横向溢出、无 pageerror。
- 基线脚本：99 个原 URL、标题、H1、robots、sitemap 资格与原站内页面入口均保留；未删除/合并/新增 noindex。
- 生产脚本：99 页与两个 ads.txt 端点共 101 个检查全部通过；生产 HTML 不含 AdSense/Funding Choices 运行标签，account meta 恰好一个。
- 生产 robots 200：Allow: /，sitemap 正确；Google-Extended 是 AI 用途机器人，不等同于 AdSense 爬虫。
- 修改记录：`docs/content-remediation-2026-09-05.md`，逐页覆盖 99 个 URL，并标出截图 25 个。
- 本轮未读取 AdSense 私有后台、付款任务或来源日志；年龄、域名控制、无重复账号、Publisher ID 和邮箱采用用户明确确认。未发送邮件、未声称全站所有可能输入都已测试。

## 官方依据

本轮刷新：[页面准备要求](https://support.google.com/adsense/answer/7299563?hl=en)、[AdSense 计划政策](https://support.google.com/adsense/answer/48182?hl=en)、[发布商政策](https://support.google.com/adsense/answer/10502938?hl=en)、[以用户为先的内容](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)。Publisher Restrictions 英语入口本轮读取失败，其条目保留清单与先前政策核对边界，不宣称本轮刷新成功。没有采用任意文章数、字数、流量或等待天数门槛。

## 完整 ADS 检查表

Pass 为本次证据范围内通过；Unknown 为缺少证据；N/A 明确限定无广告或非相关业务。任何状态都不是 Google 批准承诺。

| ID | Status | Evidence | Next action |
| --- | --- | --- | --- |
| ADS-ELIG-01 | Pass | 用户明确确认申请者已满 18 岁。 | 在账号任务页保存年龄/付款主体完成证据；主体变化时重审。 |
| ADS-ELIG-02 | Pass | 用户明确确认没有重复 AdSense 账号，并使用已确认的现有账号。 | 只在该账号中添加站点，不另建重复账号。 |
| ADS-ELIG-03 | Fail | 2026-09-03 用户后台截图记录低价值内容拒绝；新版本已整改，尚无 Google 解除拒绝证据。 | 按具体反馈复核内容与后台资格，不以自动测试代替批准。 |
| ADS-ELIG-04 | N/A | ViewExif 是独立 Cloudflare Pages 网站，不是 Blogger、YouTube 或 AdSense hosted partner。 | 若迁移到托管合作产品，改走对应资格流程并重审。 |
| ADS-OWN-01 | Pass | 已有完整仓库和共享 `<head>` 修改权；`BaseLayout.astro` 已成功注入 account meta，构建验证通过。 | 保持 meta 由单一共享布局输出。 |
| ADS-OWN-02 | Pass | 用户明确确认控制 `viewexif.com` 域名。 | 保存 DNS/Cloudflare 与 AdSense 验证截图。 |
| ADS-OWN-03 | Pass | 本地 Chromium 246/246，包括工具 hydration、解析、清理、导出及三视口页面检查。 | 生产回归另见本报告验收记录。 |
| ADS-SITE-01 | Fail | 最近提供的后台证据为 Needs attention／低价值内容，不是 Ready；本轮未提交复审。 | 核对后台是否允许重新申请；取得新结果后更新状态。 |
| ADS-SITE-02 | Pass | 生产 99 页均恰好输出一个正确的 ca-pub-7443237558968985 account meta；未更改验证方式。 | 保持 meta 与账号一致，审核期间不要移除。 |
| ADS-TXT-01 | Pass | 本轮根域与 www 的 /ads.txt 均返回 200 和精确 seller 行；用户 9月3日后台截图为已授权。 | 账号或销售关系变化时同步更新并复查后台。 |
| ADS-TXT-02 | Pass | 根路径 ads.txt 已实际部署且本轮可取得，不是仅有文档计划。 | 保持文件可抓取；账号或销售关系变化时同步更新。 |
| ADS-CONTENT-01 | Fail | 保守保留低价值内容拒绝未解除这一事实。新版本强化 26 篇文章与四语工具结果说明，未新增实验或虚构实测；不宣称 Google 已认可。 | 人工复核未确认的外链与来源，再依据后台流程复审。 |
| ADS-CONTENT-02 | Pass | 内容为本地可运行工具及问题专属说明；文章引用场景但不复制来源全文。新增段落说明坐标、时间冲突、传输副本、清理边界等具体判断。 | 保持主来源优先；Reddit 不用作现行平台保证。 |
| ADS-CONTENT-03 | Pass | 99 页有可抓取正文，工具可直接操作；首页与博客增加现有任务指南，不新增空分类，分页全部保留。 | 保留逐页记录，后续根据具体用户问题改正文。 |
| ADS-CONTENT-04 | Pass | 构建无 coming soon、Lorem Ipsum 或施工占位；工具和博客均可实际使用/阅读，申请版没有广告。 | 部署后抽查所有主导航目标 200。 |
| ADS-CONTENT-05 | Pass | 申请版没有广告、联盟模块、赞助列表或付费推广，付费内容占比为 0。 | 将来接入任何商业模块后重新计算首屏与整页比例。 |
| ADS-CONTENT-06 | Pass | 英语、德语、法语、简体中文均为 AdSense 支持语言；本地化页面含真实正文并有 hreflang。 | 新增语言前先确认支持范围与翻译质量。 |
| ADS-CONTENT-07 | N/A | 仓库没有评论、论坛、公开投稿或其他 UGC 发布入口。 | 若增加 UGC，先建立审核、举报和垃圾内容处理流程。 |
| ADS-CONTENT-08 | Pass | 保留原搜索意图、标题、H1；定义、比较、查看、清理按任务分工；减少重复答案，不通过增词或关键词堆砌设门槛。 | 新增页面前继续检查主题重叠。 |
| ADS-UX-01 | Pass | 99 页三视口 HTTP/H1/canonical/溢出检查通过；导航与四语 Footer 专项通过。 | 发布后持续检查窄屏与键盘访问。 |
| ADS-UX-02 | Pass | 首页工具保留首屏；工具后直接解释结果；首页与博客列表增加四个任务指南入口。 | 非英语页面明确指南为英语，避免语言误导。 |
| ADS-UX-03 | Pass | 原站内页面入口完整保留，下载仍对应本地输出；未新增误导按钮或无关跳转。 | 外部来源部分请求受限，不能视为全部已核验。 |
| ADS-UX-04 | Pass | 页面不改浏览器偏好、不自动跳转或下载；无 popup/popunder，文件操作须用户选择并在浏览器本地执行。 | 保持第三方脚本最小化，并持续检查供应链变更。 |
| ADS-UX-05 | Pass | 生产四语 About、Contact、Privacy、Terms 可达、邮箱一致、Footer 可达；邮箱可收信采用用户已确认前提，本轮没有发送真实邮件。 | 保存公开邮箱真实投递与回复记录。 |
| ADS-UX-06 | Pass | 申请版无广告位、广告占位或仿广告模块，不存在广告与内容边界混淆。 | 广告版设计评审时明确标签与安全间距。 |
| ADS-CRAWL-01 | Pass | 本轮生产抓取 99/99 canonical 页面均为 HTTP 200，并且最终 URL 未改变；截图保护的 25 个包含在内。 | 提交审核期间保持生产路由稳定。 |
| ADS-CRAWL-02 | Pass | 生产 robots 的通配规则 Allow: /；Cloudflare 附加禁用部分 AI 抓取器，但未禁止 Mediapartners-Google。公开 GET 与浏览器可达；未验证所有地区或 Google 实际抓取日志。 | 部署后以普通浏览器和抓取客户端检查 WAF/地区限制。 |
| ADS-CRAWL-03 | Pass | 所有可索引内容都是静态 GET URL；文件选择仅增强本地工具，不是读取页面正文的 POST 前提。 | 广告只考虑 GET 可访问且有发布者内容的页面。 |
| ADS-CRAWL-04 | Pass | 本次保护清单及全部 99 canonical 均未发生重定向；现有其他历史重定向未改动。 | 部署后用 redirect trace 抽查首页、文章与工具页。 |
| ADS-CRAWL-05 | Pass | 99 个基线 canonical、标题、H1、robots 和站内入口全部保留，无新重定向或 noindex。 | 每次构建运行保留脚本。 |
| ADS-CRAWL-06 | Pass | Cloudflare 从干净工作树 e84c87a 发布 59ca39e9；生产 HTTPS 与全部 99 页面响应通过。这不是长期可用率保证。 | 持续监测 DNS、TLS 和代表性响应时延。 |
| ADS-CRAWL-07 | Pass | 生产 sitemap 收录全部 99 个 canonical；所有原站内入口保留。可索引不等于 Google 已收录。 | 向搜索工具提交并在路由变化后复查。 |
| ADS-PROG-01 | Pass | 用户接受不自点、不刷量、不使用机器人/重复操作；`docs/adsense-operations.md` 规定月度无效流量检查与处置。 | 广告启用后保留每月来源、CTR、自动化流量记录。 |
| ADS-PROG-02 | N/A | 申请版没有广告，因此没有诱导点击文案、奖励点击或广告旁箭头。 | 启用广告时实测广告周边文案；禁止任何点击号召。 |
| ADS-PROG-03 | N/A | 申请版没有广告单元或广告标签可供检查。 | 广告启用前检查标签、边界、颜色和导航距离。 |
| ADS-PROG-04 | Unknown | 已有流量截图只包含落地页指标，不能证明全部来源合法；SOP 是运营承诺，不是来源日志。 | 账号持有人核对来源、活动与异常自动流量并留证。 |
| ADS-PROG-05 | N/A | 没有 AdSense loader、广告代码、wrapper 或修改逻辑。 | 未来只使用官方代码；任何 wrapper 变更后重审。 |
| ADS-PROG-06 | N/A | 当前没有 Google 广告，因而未在工具、弹窗、邮件、私聊、无内容页或第三方 frame 中投放。 | 启用时明确排除 Trust 页及低内容页，并实测工具交互区域。 |
| ADS-PROG-07 | N/A | ViewExif 是普通浏览器网站，不是原生 App WebView。 | 若封装为 App/WebView，单独按 WebView 政策审计。 |
| ADS-PUB-01 | Pass | 仓库内容范围是合法的文件元数据查看、清理、隐私教育和技术指南；未发现违法活动销售或指导。 | 新主题/下载内容发布前做政策筛查。 |
| ADS-PUB-02 | Pass | 文章保留来源链接但提供自有分析；品牌页明确无虚假从属，工具不销售仿品或绕过版权保护。 | 持续核对图片、引文和库许可证。 |
| ADS-PUB-03 | Pass | 26 篇文章及工具内容未出现仇恨、骚扰、威胁、自残、暴力赞美、恐怖主义或敲诈主题；无 UGC。 | 内容范围变化或引入 UGC 时重审。 |
| ADS-PUB-04 | Pass | 内容目录没有虐待动物或濒危物种制品相关页面、商品或链接。 | 若扩展到新垂类，重新筛查。 |
| ADS-PUB-05 | Pass | About 明确 ViewExif 由个人独立运营，说明工具开发、文章编写和技术核验责任；统一署名 `ViewExif`，并否认虚假机构/品牌从属。 | 保持 About、作者 schema、meta author 与实际运营一致。 |
| ADS-PUB-06 | Pass | 无登录/联系表单、付费承诺或收集凭据流程；工具说明具体且文件处理在本地，没有 phishing 或致富承诺。 | 新增表单、账号或商业承诺前做安全/真实性审查。 |
| ADS-PUB-07 | Pass | 工具用于查看或删除用户自己选择文件的元数据，不提供假证件、作弊、破解、DRM 绕过或未经授权跟踪能力。 | 文案继续强调用户责任和授权文件。 |
| ADS-PUB-08 | Pass | 内容库存没有有偿性行为、跨境婚介、家庭向成人主题或儿童性剥削内容；无 UGC。 | 任何用户内容入口上线前加入强制审核。 |
| ADS-PUB-09 | Pass | 站点品牌、作者、运营说明、account meta 和 `ads.txt` 一致；用户确认 Publisher ID 属于本次账号。 | 在 Google 后台核对付款主体、域名、Publisher ID，并保存截图。 |
| ADS-PUB-10 | N/A | 申请版不加载广告，无法出现广告覆盖内容、导航或退出陷阱。 | 广告版在桌面、390px 和 239px 实测每个 placement。 |
| ADS-PUB-11 | Pass | 当前无广告，所以没有在法律页、薄页或工具交互中投放。低价值拒绝单独保留，不用无广告事实掩盖。 | 未来启用广告前落实法律页排除与逐路由审核。 |
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
| ADS-PRIV-03 | Pass | 文件操作仍由本地 Workers/Object URL 完成；本轮工具与隐私 E2E 的敏感请求检查通过；无广告运行时。 | 这覆盖测试流程而非所有未知输入；广告启用前重做 PII 网络检查。 |
| ADS-PRIV-04 | Unknown | 历史审计记录 CMP 优化开启和错误隐私 URL；本轮没有新后台配置证据，未加载 CMP 或广告标签。 | 核对关闭优化，隐私 URL 为 https://www.viewexif.com/privacy/；留三按钮与四语截图，广告上线前实测撤回。 |
| ADS-PRIV-05 | Pass | 网站不请求浏览器 geolocation；文件内 GPS 只在本地解析/显示，不由 ViewExif 收集或传给 Google，Privacy 明确披露此边界。 | 保持本地处理；若未来收集精确位置，先做即时告知、opt-in、加密与政策更新。 |
| ADS-PRIV-06 | N/A | ViewExif 是通用文件隐私/元数据工具，不是面向 13 岁以下儿童的站点或专区。 | 受众或内容定位变化时评估 COPPA 标记和非个性化处理。 |
| ADS-PRIV-07 | N/A | 申请版没有 Google 广告/CMP 自定义 cookie 代码，也没有代理 Google 域 cookie 的逻辑。 | 接入广告后检查所有自定义脚本，不得改动 Google 域 Cookie。 |
| ADS-PRIV-08 | N/A | 申请版没有 Google 广告个性化、remarketing、受众列表或相关 data-layer 事件。 | 广告启用前审查 CMP、个性化和敏感受众配置。 |
| ADS-PRIV-09 | N/A | ViewExif 不经营或推广住房、就业、信贷，也没有美国/加拿大相关广告受众定向。 | 若开展此类广告活动，按受限属性重新审计。 |
| ADS-PRIV-10 | N/A | 申请版不使用个性化广告，也未构建广告受众数据。 | 若启用个性化，验证数据权利、AdChoices/行业披露与撤回控制。 |

## 完整性与发布记录

- 参考清单 73 个唯一 ID；本表 73 个，重复 0、缺失 0、非法状态 0。
- 计数：53 Pass、3 Fail、2 Unknown、15 N/A。
- 保留的 15 项 N/A 在广告启用/业务变化后重审；本轮不改广告接入或 CSP。
- 分支 `codex/homepage-exif-seo`；本地已提交并从干净工作树发布。GitHub 推送三次因连接重置/443连接失败未完成；不要把它记录成已同步远程。
