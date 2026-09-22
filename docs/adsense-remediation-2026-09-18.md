# AdSense 优先问题整改 — 2026-09-18

> 后续状态：用户随后授权提交和部署。本轮修复现已在生产发布并通过线上复验，详见 [2026-09-18 发布记录](adsense-release-2026-09-18.md)。以下正文保留修复验收当时的“尚未部署”状态，作为历史记录。

本轮完成地图披露、六篇平台文章证据修正和本地依赖恢复。**本地修复与生产状态分开记录：未部署、未提交 AdSense 审核，生产仍是 9 月 17 日审计时的版本。** 本文不把后台资格、流量、图片授权或内容价值审批标记为已解决。

## 代码与隐私

- 首页 GPS 摘要和完整报告都使用明确的 OpenStreetMap 链接名称，旁边显示坐标、IP 等网络信息会发送给该服务的说明；`aria-describedby` 关联说明，保留新标签打开及 `noopener noreferrer`。
- 不自动加载地图，不请求浏览器定位，不增加弹窗、同意状态、后端接口或报告字段。没有可用 GPS 时没有地图入口。
- 英、德、法、简中 Privacy 新增 `#maps`，说明接收方、用途、坐标 URL、IP/浏览器信息和点击触发条件，链接 [OpenStreetMap Foundation 隐私政策](https://osmfoundation.org/wiki/Privacy_Policy)。文件、名称、哈希及其他字段不随地图链接发送。
- 将“不会进入 URL”限定为 ViewExif 自身 URL，并说明主动打开地图的例外。Privacy 日期独立更新到 `2026-09-18`；Terms 保持 `2026-08-23`。
- 广告运行代码仍未启用。验证用 account meta 和 ads.txt 保持不变。

## 逐篇来源与结论记录

全部六篇保留原 URL、title/H1、publishedAt、封面、related 和正文内部链接；仅实际修改文章的 updatedAt 改为 `2026-09-18`。description、excerpt、Practical take、表格、FAQ 与正文同步收窄。FAQ 继续由同一份 frontmatter 生成可见内容和 JSON-LD。

| 文章 | 实际复核的来源及性质 | 允许保留的结论 | 已删除或收窄的结论 |
| --- | --- | --- | --- |
| Instagram | [IPTC / Embedded Metadata Initiative](https://www.embeddedmetadata.org/social-media-test-results.php)，历史测试；[Meta Feed ranking system card](https://ai.meta.com/tools/system-cards/instagram-feed-ranking/)，官方机制说明 | 标明 2013 Save As 路线与 2015 iOS 6.4.1 未能取回文件；排名文档不证明修改 EXIF 日期能提升分发 | 删除“通常所有公开图片都无 GPS/相机信息”的现时断言；表格改为逐字段检查方法。Meta 分辨率和隐私入口本次跳到登录页，不再用未取到的正文支撑细节。删去未经本次复核的社区轶事 |
| Discord | [2024 图片讨论](https://www.reddit.com/r/discordapp/comments/1e5i7we/question_does_discord_remove_exif_data_from/)，第一人称社区观察；[2020 视频讨论及 ReallyAmused 回复](https://www.reddit.com/r/discordapp/comments/jzwite/psa_discord_does_not_strip_location_data_for/)，历史报告/修复计划；[2023 PNG 讨论](https://www.reddit.com/r/discordapp/comments/12800f7/discord_is_stripping_metadata_out_of_png_images/)，社区观察 | 2024 发帖者检查了聊天下载图片但没提供原始字段、格式或版本；2020 回复描述 iOS 待发布、Android 无 ETA、后端概念验证；PNG 讨论反映不同下载路线的历史差异 | 不再把随意下载检查写成 JPEG 全字段对照实验，不将评论者相信新视频已清理写成测试结果；删除“2020 年 11 月后所有视频安全”的分界。明确旧附件和今日路线都需实查 |
| Telegram | [HD / original-file 公告](https://telegram.org/blog/direct-to-channel-trim-voice-and-more)，官方功能说明；[隐私政策](https://www.telegram.org/privacy)，官方 Secret Chat 说明 | 区分优化照片、HD 与原文件发送；原文件应按可能保留已有标签处理。加密与收件人读取文件标签是两件事 | 删除无对应引用的“下文研究”；不从压缩、HD 或加密推导所有 EXIF/GPS 必然删除；删除未经复核的 Reddit 引述与泛化的转发行为 |
| WhatsApp | [2025 图像传输研究](https://doi.org/10.70322/plfs.2025.10006)，已发表研究、有限样本 | 聊天/文档传输的选定字段结果不同；负标记包括“未可靠恢复”，不能解释成全部字段已清除 | 不再声称每个普通照片发送都清除 EXIF；不虚构研究中未明确区分的 HD 或 app 版本结果；删除未复核的个人图库数字和案例。保留日期修复、备份和接收副本检查步骤 |
| Reddit | [2024 r/help banner 讨论](https://www.reddit.com/r/help/comments/1dx53tz/does_reddit_still_remove_exif_data_when_i_upload/)，社区断言 | 如实说明主题是猫照片/banner，回复未提供对照文件与字段清单；外部源文件需单独检查 | 不将讨论推广到所有帖子、头像和 banner；不把服务端处理路径/保留规则当作已证明事实；预览、文件尺寸变化都不是清理证明 |
| Gmail | [Google 附件帮助](https://support.google.com/mail/answer/6584?hl=en)，官方操作规则 | 保留个人账号总附件 25 MB、超限转 Drive 链接、工作/学校账号受管理员设置影响的区别；用哈希与字段检查实际附件 | Help Community 页面本次未取得可核实的测试正文，删除“字节完全相同”的归因及普遍保证；改为隐私操作建议：按附件可能保留标签处理。删除未复核的邮件/Reddit 案例 |

来源复核日期：2026-09-18。社区来源只证明当事人的发言或观察，不作为平台的当前保证。页面不可读取不等于来源不存在或链接失效。正文保留了具体字段、接收副本、哈希、文件名和发送模式检查步骤；没有发送邮件、发布社交内容、虚构截图或平台实验。

## 安装与验证记录

环境：Node `22.19.0`，pnpm `11.1.2`。先检查发现 `node_modules/astro` 链接存在，但 `.bin/astro.cmd`、`.modules.yaml` 和 TypeScript 包文件不完整。

1. `pnpm install --frozen-lockfile` 返回 Already up to date，未修好命令入口；单独 `--force` 也被跳过。
2. 关闭重复安装跳过后暴露 TypeScript 包文件缺失。最终 `pnpm install --frozen-lockfile --force --optimistic-repeat-install=false` 重建 597 个锁定包，恢复命令入口。
3. `package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml` 均未变化；没有升级框架或依赖。

- `pnpm test`：最终 **25 个文件、266 项全部通过**。首轮与构建并行时，PDF 中文导出超出原有 5 秒限制；该文件单独 13/13 通过，完整重跑 266/266 通过。没有放宽超时或改测试断言来规避失败。
- `pnpm build`：通过 Astro 检查、静态构建、sitemap、Cloudflare 资产和 SEO 检查。生成 101 个 HTML 页面，其中 100 个可索引页面和 404。原有 WASM 体积余量提示仍在（93,987 字节），本轮没有扩大该资源。
- 首轮指定浏览器套件 **180/180 通过**：legal、image-viewer、blog、i18n、content-preservation。最终修订和 100 页基线更新后的复验结果见文末。
- 地图回归：4 种语言 × 首页两个入口；合成 JPEG 在文件选择、解析、完整扫描结束前零地图请求；点击产生的请求只含预期 `mlat`/`mlon`，无请求体、无 Referer、无 opener；无 GPS 的替换文件移除入口和说明。外部导航由测试拦截，没有向地图服务发送测试坐标。外部脚本在该专项测试中也被拦截，因此它不是第三方统计服务行为认证。
- GPS 结果、四语法律页与既有页面在 1440、390、239 px 检查横向溢出；四语隐私日期和 Terms 日期分别断言。
- 六篇可见 FAQ 的**问题和答案**逐项与 JSON-LD 对比，同时检查修订日期和 description 一致。
- `docs/content-url-baseline.json` 从旧 99 页更新为**修改前 2026-09-17 生产抓取的 100 页**。旧基线遗漏后增的文章，并保留旧分页入口，不能代表本轮起点。没有用修改后的输出放宽内容保留条件。
- `node scripts/check-content-preservation.mjs` 与独立生产快照比对均确认 100 个 URL、canonical、title、H1、索引资格及既有站内入口保留；六篇 protected frontmatter 与 HEAD 一致。广告运行代码扫描为零。

日志保存在 `.tmp/adsense-*-20260918.log`；页面快照比对在 `.tmp/adsense-preservation-20260918.json`；地图截图在 `output/playwright/adsense-map-*.png`。它们是本地检查产物，不代表生产已更新。

## 尚未关闭的边界

- **High / 内容价值与完整事实核验**：此次纠正六篇的已知证据问题，不等于全站每条事实、原创性和 Google“有价值内容”判断得到认证。其他文章结构和运营者身份按范围未调整。
- **High / 图片授权**：27 张封面的完整来源和权利台账未在本轮补齐，继续 Unknown。
- **Blocker / 后台状态与资格**：年龄、重复账号、真实域名/账号归属、最新 Sites 审批与拒绝原因需持有人核对。9 月 3 日旧拒绝记录不是当前状态证据。
- **High / 真实流量与爬虫**：流量质量、历史无效点击、WAF 对真实 Google 爬虫的处理无法通过本地构建证明。
- 生产地图披露缺口仍需将来经授权部署后复查；本轮明确不部署。启用广告时另行核验实际广告位置、CMP 和同意撤回流程。

## 73 项完整复核

下表逐项复核当前本地源码/构建，并明确沿用 9 月 17 日生产只读审计的环境证据。没有再次把生产抓取写成“9 月 18 日修复上线”。Pass 表示所述范围检查通过，不表示 AdSense 批准；未在本轮取得的新外部证据仍为 Unknown。原始审计见 [9 月 17 日报告](adsense-audit-2026-09-17.md)。

| ID | 状态 | 证据与范围 | 后续或边界 |
| --- | --- | --- | --- |
| ADS-ELIG-01 | Unknown | 本次无年龄/申请者身份材料。 | 持有人核对成年资格或合法监护账号。 |
| ADS-ELIG-02 | Unknown | 无账号清单权限。 | 核对无重复发布商账号。 |
| ADS-ELIG-03 | Unknown | 本地地图和六篇证据问题已修复；账号资格、权利和最终内容质量仍待外部核对。 | 不将本地修复等同政策全面合规或审批通过。 |
| ADS-ELIG-04 | N/A | 自有域名静态站，不是 Blogger/YouTube 托管账号流程。 | 使用网站申请流程。 |
| ADS-OWN-01 | Pass | 可读写 Astro 模板，BaseLayout 有 head 验证注入点。 | 保持模板与发布权限。 |
| ADS-OWN-02 | Unknown | 仓库权限不等于 DNS/生产域名所有权证明。 | 核对域名及 Pages 控制权。 |
| ADS-OWN-03 | Pass | 9/17 生产合成文件可处理；本轮本地图像查看器和地图交互回归通过。 | 发布后复测真实线上交互。 |
| ADS-SITE-01 | Unknown | 旧文档记载 9 月 3 日拒绝，本次无最新后台。 | 获取当前 Sites 状态与原因。 |
| ADS-SITE-02 | Pass | 9/17 生产 100 页验证标识一致；本轮未改标识、ads.txt，法律页回归通过。 | 实际账号验证结果仍待后台核对。 |
| ADS-TXT-01 | Pass | Google DIRECT seller 行格式正确，与站点 ID 一致。 | 真实账号归属见 ADS-PUB-09。 |
| ADS-TXT-02 | Pass | 已发布 ads.txt，www 与根域可读取。 | 保持可访问与账号一致。 |
| ADS-CONTENT-01 | Unknown | 六篇表述已按证据收窄，保留具体检查步骤；27 篇及工具内容仍在。 | 全站内容质量与 Google 当前低价值判断仍待核对。 |
| ADS-CONTENT-02 | Pass | 站点提供本地解析、清理、风险解释及自己的操作指南，非嵌入/转载聚合站。 | 保留引用区分；未做全互联网查重或逐项版权鉴定。 |
| ADS-CONTENT-03 | Pass | 100 页保留预渲染正文与工具说明，六篇修改后仍有逐字段和副本检查方法。 | 不按固定字数或篇数承诺过审。 |
| ADS-CONTENT-04 | Pass | 本地生成 100 个正常可索引页面，无占位路由；生产可达性沿用9/17记录。 | 未来部署后重跑线上检查。 |
| ADS-CONTENT-05 | Pass | 当前无广告、无赞助/联盟推广主导内容的布局。 | 广告版另测比例。 |
| ADS-CONTENT-06 | Pass | 英、德、法、简中均为支持语言；翻译页面有正文。 | 保持正文与语言标签一致。 |
| ADS-CONTENT-07 | N/A | 无评论、论坛或用户公开发布；文件仅本地处理。 | 引入公开UGC前制定审核流程。 |
| ADS-CONTENT-08 | Pass | 主题集中且有不同任务页面；未证实门页或关键词垃圾。 | 区分4篇相近概念/查看文章的独立用途。 |
| ADS-UX-01 | Pass | 本轮既有导航、多语言及 1440/390/239 px 内容保留回归通过。 | 上线后再验证生产资源和导航。 |
| ADS-UX-02 | Pass | 首页工具、格式入口、博客、相关阅读及页脚信任页构成完整路径。 | 继续清晰标示非英语页面链接至英文指南。 |
| ADS-UX-03 | Pass | 站内无缺失页面链接，清理下载按钮产生真实本地文件。 | 不在上传/下载控件附近放混淆广告。 |
| ADS-UX-04 | Pass | 所测页面无非预期跳转或自动下载；下载由明确点击触发。 | 第三方脚本变化后复测；非完整安全渗透测试。 |
| ADS-UX-05 | Pass | 本轮四语 16 个法律/联系/关于页面可达；Privacy 新增地图段落并独立更新日期。 | 真实身份和邮箱收发不由本轮证明。 |
| ADS-UX-06 | Pass | 无广告占位、遮挡或混淆标签；实看桌面及手机截图。 | 广告启用后再次检查。 |
| ADS-CRAWL-01 | Pass | 9/17 生产100页200、虚构路径404；本轮100页本地浏览器与构建检查通过。 | 当前生产未重新发布。 |
| ADS-CRAWL-02 | Unknown | robots放行、公开访问和UA探针成功；无WAF日志。 | 核对真实Google爬虫访问/安全事件。 |
| ADS-CRAWL-03 | Pass | 静态GET即含页面正文，不依赖POST；用户文件结果在本地。 | 保持广告所在页面有可抓取发布商内容。 |
| ADS-CRAWL-04 | Pass | 正式canonical页直接200，HTTP/裸域最终正确，没有会话依赖。 | 保持入口重定向简洁。 |
| ADS-CRAWL-05 | Pass | 100 页原路径及自引用 canonical 保留；仅用户主动点击时坐标进入外部地图 URL。 | 保持 ViewExif URL 不含文件元数据，第三方入口明示披露。 |
| ADS-CRAWL-06 | Pass | 本次DNS、HTTPS和100页请求正常。 | 持续可用性未知；按现有监控核对历史。 |
| ADS-CRAWL-07 | Pass | 100 个原 URL、sitemap 项和站内入口按修改前生产快照保留。 | Search Console 实际收录仍需外部确认。 |
| ADS-PROG-01 | Unknown | 本次无广告点击；无法知道所有历史运营行为。 | 持有人确认并检查无效流量记录。 |
| ADS-PROG-02 | Pass | 所查内容无要求点击广告、奖励看广告等文案。 | 投放后保持中性标签。 |
| ADS-PROG-03 | N/A | 无广告单元或广告标签。 | 广告版检查广告/赞助标识。 |
| ADS-PROG-04 | Unknown | 无真实来源日志或推广账户数据。 | 检查自然、付费、推荐来源及异常流量。 |
| ADS-PROG-05 | N/A | 当前没有AdSense广告运行代码可修改。 | 添加广告时审核实际封装与行为。 |
| ADS-PROG-06 | N/A | 无Google广告展示位置。 | 排除无内容页与不适当屏幕后再投放。 |
| ADS-PROG-07 | N/A | 普通网站，不是应用WebView变现。 | 如另做App需单独审查。 |
| ADS-PUB-01 | Pass | 文件隐私工具及教程，无非法商品/违法推广功能。 | 保持授权文件处理边界。 |
| ADS-PUB-02 | Unknown | 依赖有许可说明；未见27张封面的完整授权来源台账。 | 补齐资产出处及使用权证据。 |
| ADS-PUB-03 | Pass | 内容库存为文件隐私/技术教程，无仇恨、恐吓或暴力宣扬主题，无UGC。 | 新内容按同范围审核。 |
| ADS-PUB-04 | Pass | 无动物虐待或濒危物种商品内容。 | 新垂类出现时复核。 |
| ADS-PUB-05 | Unknown | 六篇已知证据夸大和摘要/FAQ不一致已修复；本轮未完成其余文章逐来源核验或实名核查。 | 维持全站层面的 Unknown；不得宣称完整事实认证。 |
| ADS-PUB-06 | Pass | 无钓鱼、账号凭证表单、致富承诺；上传选择在本地处理。 | 不引入误导服务承诺。 |
| ADS-PUB-07 | Pass | 未提供破解、伪证或追踪服务；教程明确反对用清理规避重复内容检测。 | 继续限制授权、非欺诈用途。 |
| ADS-PUB-08 | Pass | 内容库存不涉及有偿性行为、跨境婚介或家庭向成人内容，无UGC。 | 内容范围变化时复审。 |
| ADS-PUB-09 | Unknown | meta/ads.txt/品牌一致，但账号归属及付款信息不公开。 | 在真实AdSense账号中核对。 |
| ADS-PUB-10 | N/A | 无广告覆盖/交互位置。 | 广告版检查不挡上传、导航及下载。 |
| ADS-PUB-11 | N/A | 当前不在任何页面展示Google广告。 | 投放前审查低价值/无内容屏幕与页面排除。 |
| ADS-PUB-12 | N/A | 无后台、屏外或失焦广告。 | 加广告后检查加载时机与上下文。 |
| ADS-PUB-13 | Pass | 无选举、健康共识或气候否认主题。 | 跨入相关主题后做事实审查。 |
| ADS-PUB-14 | Pass | 未发现公共议题欺骗性操纵媒体用途；C2PA页面说明凭证不证明事实。 | 生成或编辑公共议题媒体时复核。 |
| ADS-PUB-15 | Pass | 所查内容库存无儿童侵害主题、无用户公开发布能力。 | 新内容持续检查。 |
| ADS-PUB-16 | Pass | 不以活跃危机/敏感事件牟利，网站为通用文件工具。 | 事件专题需单独审查。 |
| ADS-REST-01 | Pass | 无性产品、性娱乐或性建议类页面。 | 新页面复核。 |
| ADS-REST-02 | Pass | 所查主题及代表封面无血腥、猎奇或突出粗口。 | 新视觉素材继续审查。 |
| ADS-REST-03 | Pass | 无武器销售或制作/改进教程。 | 范围变化时复核。 |
| ADS-REST-04 | Pass | 无烟草、毒品及相关制作/使用推广。 | 范围变化时复核。 |
| ADS-REST-05 | Pass | 无酒类销售或不负责任饮酒推广。 | 范围变化时复核。 |
| ADS-REST-06 | Pass | 无真钱博彩或付费机会游戏。 | 范围变化时复核。 |
| ADS-REST-07 | Pass | 无处方药/未批准药品销售或被下架应用推广。 | 范围变化时复核。 |
| ADS-REST-08 | N/A | 无广告单元或视频广告。 | 广告版另查遮挡、控制及自动播放。 |
| ADS-PRIV-01 | Pass | 四语 Privacy 说明当前服务与未来广告，新增 OpenStreetMap 接收方、用途、数据和触发条件。 | 本地生效日期9/18，生产待未来部署。 |
| ADS-PRIV-02 | Pass | 广告段披露Google与第三方Cookie、存储、beacon、IP/标识符。 | 实際广告提供方变更时更新。 |
| ADS-PRIV-03 | Pass | 本轮源代码和本地构建无广告运行代码；合成文件回归无自动地图请求。 | 专项测试拦截第三方脚本，不等于认证真实分析脚本或未来广告行为。 |
| ADS-PRIV-04 | N/A | 当前无Google广告/CMP运行代码，审查对象是申请版。 | 对EEA/英国/瑞士启用广告前验证认证CMP及拒绝/撤回。 |
| ADS-PRIV-05 | Pass | 本地两个地图入口显示坐标/IP披露并关联aria-describedby；四语政策一致；点击前零地图请求，点击导航已拦截验证。 | 仅本地通过；生产仍有9/17记录的披露缺口，未来部署后复验。 |
| ADS-PRIV-06 | N/A | 非儿童定向服务，当前无广告或儿童兴趣定向。 | 受众或投放改变后审查标记。 |
| ADS-PRIV-07 | N/A | 无自定义Google广告/代理代码，无Google域Cookie操作。 | 将来集成保持不篡改。 |
| ADS-PRIV-08 | N/A | 无广告个性化、再营销列表或敏感元数据受众构建。 | 禁止把文件内容转为广告受众。 |
| ADS-PRIV-09 | N/A | 不经营住房、就业或信贷定向广告。 | 营销范围变化后复审。 |
| ADS-PRIV-10 | N/A | 没有个性化广告或受众列表。 | 开启前核对权利、披露与选择入口。 |

完整性：73 个唯一 ID，缺失/重复/额外均为 0。状态：12 Unknown / 16 N/A / 45 Pass。

## Google 官方依据

9 月 18 日重新读取 [页面就绪要求](https://support.google.com/adsense/answer/7299563?hl=en)、[隐私披露要求](https://support.google.com/adsense/answer/1348695?hl=en)、[计划政策](https://support.google.com/adsense/answer/48182?hl=en)。其他资格、发布商政策、受限内容、爬虫及 CMP 依据沿用 9 月 17 日审计已核对的官方页面，链接在原报告中。

没有使用最低文章数、字数、流量门槛、固定等待期或通过概率来代替 Google 审核。无需把未启用广告的运行期条目标为失败，也不能把它们当作投放验证通过。

## 最终构建复验

- 最终 `pnpm build` 成功：Astro 检查 **0 errors / 0 warnings / 3 hints**；100 个可索引页面的 sitemap、canonical、语言替代、robots、JSON-LD 和内部链接检查通过。
- 新增浏览器回归最初触发严格 TypeScript 检查的数组元素可能为空错误；补充真实的非空保护后构建通过，未关闭类型检查。
- 在最终构建上重跑受影响的 **23 项**：三篇最后润色文章的相关检查、六篇 FAQ/JSON-LD、四语地图数据流、更新后的 **100 页 × 3 个宽度** 内容保留，全部通过（54.2 秒）。首轮全部指定套件 180 项通过的记录保留；没有把 23 次复跑算成新增独立覆盖项。
- 最终 `node scripts/check-content-preservation.mjs` 成功；独立 9/17 快照比对成功；依赖三文件 `git diff --quiet` 返回 0；`git diff --check` 通过。
- 已查看 239 px GPS 摘要与 390 px 完整报告截图，说明和链接正常换行。桌面及全部规定宽度的布局断言通过。
- 交付状态：**本地代码与文档已修复并验证；生产尚未更新；未提交审核。** 清单为 **45 Pass / 0 Fail / 12 Unknown / 16 N/A**，其中地图 Pass 仅指本地实现。生产中的对应缺口仍需未来部署后确认关闭。
