**ViewExif AdSense 申请准备度审计 · 2026-09-23**

对象：[线上 ViewExif](https://www.viewexif.com/) 与 `E:/code/sy/metadataview`，本地 HEAD `c42b98a`。这是网站申请准备度判断，不是 Google 后台审批结果。此次未改站点代码、未部署、未提交审核。

**结论：Not ready，建议先修复后申请。** 网站的公开访问、工具功能和内容基础已经具备；本次真正需要先解决的是：点击照片地图时，Ahrefs 自动点击统计也会接收包含精确坐标的链接，而隐私政策明确声称它不接收提取的元数据。另有两项可复现的导航问题。修复后核对账号、素材使用权和当前后台反馈，就可以重新评估提交；无需为审核机械增加文章数量。

**优先问题与具体修复**

**1. High：照片 GPS 进入了未披露的统计用途。** 对应 `ADS-PRIV-05`、`ADS-PRIV-01`。

- 入口：在[首页](https://www.viewexif.com/)选择带 GPS 的合成 JPEG，完成解析后点击 “View on OpenStreetMap”。点击前没有地图请求；点击后除了地图导航，还有发往 `https://analytics.ahrefs.com/api/event` 的统计请求。
- 拦截的事件为 `n=x-link-click`，其 `p` 字段里的 `href` 包含 `mlat=37.775&mlon=-122.41944444444445` 及地图片段。这些是人工构造的样本坐标。地图和 Ahrefs 请求均在浏览器路由层拦截并返回测试响应，未把测试坐标发送给两个目的服务。
- [地图链接源码](E:/code/sy/metadataview/src/components/MetadataReportWorkbench.tsx:170)把坐标放入原生链接；[共享布局](E:/code/sy/metadataview/src/layouts/BaseLayout.astro:96)加载 Ahrefs 脚本。当前第三方脚本自动追踪现有和动态添加的锚点，并发送完整 `href`。`rel=noreferrer` 不会阻止脚本读取链接。
- [英文隐私声明](E:/code/sy/metadataview/src/components/pages/ContentPage.astro:157)及德、法、中文对应段落声称不向 Ahrefs 提供提取元数据；[地图就地提示](E:/code/sy/metadataview/src/i18n/workbench-report.ts:392)只告知 OpenStreetMap 会收到坐标。四种语言的线上政策均已重新读取，问题不是旧缓存推断。
- 修复：优先让统计系统无法读取或发送文件派生数据。最直接的做法是在工具/结果页面停用会自动追踪链接的第三方脚本；如保留统计，改成明确控制的无敏感数据事件，并核验普通点击、键盘激活、中键和动态生成链接。只添加 `noreferrer`、修改隐私措辞或只拦普通点击都不足以证明问题已解决。根据最终实现同步四语说明。
- 验收：有 GPS 和无 GPS 的合成文件分别测试，解析、点击两个地图入口及辅助点击后，所有分析请求均不包含坐标、文件名、哈希、原始字段；确认只在明确点击后发生已披露的地图导航。
- 政策依据：[Google 发布商政策中的隐私与精确位置要求](https://support.google.com/adsense/answer/10502938?hl=en-GB)。位置处理和共享应说明用途及接收方，并取得相应明确同意。本次是申请前的风险判断：照片位置不一定是当前用户位置；不能据此说真实用户历史数据已被泄漏、Google 收到了数据，或 Google 已处罚本站。

复现原始日志：`.tmp/adsense23-map-events.log`。实测 `navigator.webdriver=false`，点击前已移除临时分析测试开关；结论不依赖强制启动原本不执行的代码。第三方脚本快照 SHA-256：`b270afc5f9df7bcd9239c22857fb1511bba1398a28b1c3548272d720cb433c62`。

**2. Medium：20 个清理页面存在无目标的页内操作链接。** 对应 `ADS-UX-01`。

- 全量 HTML 检查发现四语 × 5 个清理路由的 `#metadata-workbench-tool` 没有目标。已在[图片清理页](https://www.viewexif.com/image-metadata-remover/)等待组件加载后确认该 ID 仍不存在，涉及 “Clean one file”“See verification”“Choose a file above”等入口。
- [FormatMetadataGuide.astro:46](E:/code/sy/metadataview/src/components/FormatMetadataGuide.astro:46)写死了查看器锚点，清理工作台没有对应 ID。
- 修复：给清理工作台设置稳定 ID，并让相应指南和操作链接指向该 ID；核验四语及全部格式。它们不是 HTTP 404，但点击不能把用户带到承诺的操作区。证据：`.tmp/adsense23-anchor.log`。
- 官方依据：[AdSense 页面要求中的导航功能性](https://support.google.com/adsense/answer/7299563?hl=zh-Hans)。这是局部功能问题，不认定为蓄意欺骗或单独必拒条件。

**3. Medium：非图片文章的结尾推荐了错误的工具类型。** 对应 `ADS-UX-02`。

- [Word 清理指南](https://www.viewexif.com/blog/remove-metadata-from-word-document/)结尾让用户检查将要分享的文件，却统一链接图片查看器、图片隐私检查器和图片清理器。PDF、MP3、MP4 文章也使用这个模板；正文内正确的对应格式链接仍存在。
- 原因：[BlogToolStrip.astro:7](E:/code/sy/metadataview/src/components/BlogToolStrip.astro:7)固定图片工具，[文章模板](E:/code/sy/metadataview/src/pages/blog/[slug].astro:116)没有传入文章类型。
- 修复：按文章格式传入 document/audio/video/image 对应查看器和清理器，非图片文章不展示仅支持图片的隐私检查入口。
- 官方依据同上，属于内容与导航关联问题，不应描述为不存在的内容或恶意跳转。

**4. Medium / Unknown：27 张旧博客封面的使用权尚缺可核验记录。** 对应 `ADS-PUB-02`。

现在是 28 篇文章及 28 张封面。[9 月 22 日新文章](E:/code/sy/metadataview/src/content/blog/how-to-check-exif-data.md:16)有 Pexels 作者、原始页面和许可记录；另外 27 张未找到逐图来源、原创/生成记录或许可证据。演示图片和 C2PA 样例在 `public/samples/SOURCES.md` 中有来源说明。

这不等于证明侵权。申请前由持有人确认使用权；可保存来源页、作者、适用许可或自制/生成记录，无法确认的素材替换。Google 要求实际拥有相应权利，没有规定必须公开某种固定格式台账。[Google 发布商版权政策](https://support.google.com/adsense/answer/10502938?hl=en-GB)

**内容质量判断**

本次没有发现已证实的空站、转载拼接或内容硬性阻断。站点提供实际可运行的本地工具；28 篇英文文章有具体字段、操作、格式限制和误判说明。完整深读并对照了 8 篇线上文章，包括 Gmail、Discord、Word、XMP、Mac、截图、metadata strategy 和 9/22 新 EXIF 指南；线上开篇、二级标题和更新日期吻合源码。

9/18 修订的六篇平台文章已经说明来源年代和测试边界，不能继续沿用旧报告把它们定性为当前实测造假。仍值得改善的点是：13 篇正文外链全来自 Reddit，平台文章缺当前自有实验，作者统一为 ViewExif。建议选最重要的 2–3 篇补真实样本、版本、传输路线和字段对照，补官方技术来源及运营者愿意公开的稳定署名。以上是质量建议，不是必须公开真名、达到文章数/字数或获得某个流量数字的 Google 硬门槛。[Google 对原创、有用内容的要求](https://support.google.com/adsense/answer/7299563?hl=zh-Hans)

**本轮已通过的检查及边界**

- 当前 sitemap **101/101 页返回 200**，每页一个 H1、自引用 canonical、正确 account meta，无 noindex；102 个去掉片段后的站内目标均可访问（含样例来源说明文件）。人造不存在 URL 返回真实 404。0 空主内容、0 完全重复标题/正文；后者不等于全网查重。
- robots 放行，sitemap 正常；HTTP/裸域单跳归一到 HTTPS www；DNS A/AAAA、TLS 验证正常。三种 Google 相关 UA 探针返回 200，但没有真实 Google IP 的 WAF 日志或后台抓取证据。
- 页面图片目标去重28个，28/28均返回200、图片类型且非空；新文章封面在等待解码后正常显示，初次加载中的空白不记为失效图片。
- 两域 ads.txt 都可读，seller 为 `google.com, pub-7443237558968985, DIRECT, f08c47fec0942fa0`，与 101 页 meta 一致。格式/公开映射正确不等于账号归属或 Google 后台验证已完成。
- 桌面下拉菜单和 390px 手机菜单可以打开、Escape 关闭；9 条代表路由在 320、375、390、430、1440px 共 **45 个组合**无页面横向溢出、无超过 28px 的已测可见文字、无 pageerror。另测带 GPS 结果在这 5 个宽度无溢出。覆盖四语首页、图片清理、C2PA、博客列表/详情和 Privacy；不是所有页面的全交互证明。
- 合成 PNG 的作者字段可读；“继续处理”入口能把当前文件交给清理器重新扫描，未自动清理。明确点击后生成和验证副本，下载确实成功：173 B → 69 B；下载文件中两个合成文本标记消失、PNG 签名保留。页面如实显示仍有残留技术字段。未验证所有格式和极限尺寸。
- 四语 About/Contact/Privacy/Terms 可访问；当前没有 AdSense 广告运行脚本，只有验证 meta。没有广告堆砌、虚假下载或公开 UGC；未发现禁止/受限主题。
- 这是只读审计，没有重新构建或运行全部项目测试；不复用 9/18 的测试数字作为本轮证据。

**后台与投放阶段待核对**

旧文档记录 9/3 曾收到“Needs attention / 低价值内容”，本轮没有新的后台状态。它不能证明当前版本必然拒绝，也不能当作已解除。核对当前 Sites 页面及最新原因、申请入口、所有权验证、publisher ID 与账号主体。年龄、账号唯一性、域名控制权和真实流量来源没有在本轮获得持有人确认；仓库旧记录不是此次独立后台核验。公开搜索结果也不用于推断 Google 索引数量，应看 Search Console。

目前未运行广告，因此“没有 CMP 横幅”不单独判申请失败。以后面向 EEA、英国、瑞士投放个性化广告时，需要符合 Google 认证且接入 IAB TCF 的 CMP；其他广告模式也要根据实际存储和用途落实适用同意要求。[Google CMP 现行要求](https://support.google.com/adsense/answer/13554116?hl=en-GB) 当前 CSP 仅允许自身和 Ahrefs 连接，启用广告/CMP 时需验证必要请求和广告位置，不能直接认为加入脚本即可投放。

**73 项完整检查表**

Pass 仅表示本轮说明的范围有证据；Fail 是已核实缺口；Unknown 是缺少证据，不等于违规；N/A 表示当前版本不适用。严重性按实际影响，局部 CTA 问题记 Medium。隐私两项及总体合规项是同一根因的交叉记录，不能把数量当通过率。

| ID | Status | 证据 | 下一步 |
| --- | --- | --- | --- |
| ADS-ELIG-01 | Unknown | 本轮未取得申请人年龄/资格材料。 | 确认18岁或合资格监护人账号及适用地区资格。 |
| ADS-ELIG-02 | Unknown | 无账号清单或本轮唯一性确认。 | 使用现有合资格账号，核对无重复发布商账号。 |
| ADS-ELIG-03 | Fail | 精确GPS统计用途与隐私承诺存在已证实冲突。 | 关闭发现1并核对其余账号/权利事项；非Google处罚结论。 |
| ADS-ELIG-04 | N/A | 自有域名普通网站，不是Blogger/YouTube托管申请。 | 按网站流程处理。 |
| ADS-OWN-01 | Pass | 可访问Astro共享head源码，线上已有验证meta。 | 保持源代码和发布控制。 |
| ADS-OWN-02 | Unknown | 仓库与meta不能独立证明域名/账号归属。 | 持有人核对域名、Cloudflare及账号控制权。 |
| ADS-OWN-03 | Pass | 线上JS查看、文件接续、清理、下载均实测成功。 | 相关变更后复测。 |
| ADS-SITE-01 | Unknown | 无最新Sites后台；9/3拒审仅为历史记录。 | 核对添加/验证/最新状态；获批后再展示广告。 |
| ADS-SITE-02 | Pass | 101页meta和可读取ads.txt提供验证方式。 | 在当前账号确认后台验证结果。 |
| ADS-TXT-01 | Pass | Google DIRECT seller行格式正确且与meta一致。 | 账号归属另核对PUB-09。 |
| ADS-TXT-02 | Pass | www与裸域均可访问ads.txt。 | 维持公开可抓取。 |
| ADS-CONTENT-01 | Pass | 真实工具加28篇相关指南；8篇深读有具体步骤/字段/限制。 | 补重要文章的真实自有测试，非篇数门槛。 |
| ADS-CONTENT-02 | Pass | 有自有工具和解释增量，非转载/嵌入聚合。 | 保留引用边界；本轮非全互联网版权鉴定。 |
| ADS-CONTENT-03 | Pass | 未选择文件时仍有静态说明；文章有完整正文。 | 投放前避免无内容状态屏幕。 |
| ADS-CONTENT-04 | Pass | 101页成形、工具可用，无建设中/空白占位。 | 保持发布检查。 |
| ADS-CONTENT-05 | Pass | 当前无广告/联盟/赞助内容主导。 | 广告上线后复查占比。 |
| ADS-CONTENT-06 | Pass | 英/德/法/简中有实际正文，均为支持语言。 | 保持翻译完整。 |
| ADS-CONTENT-07 | N/A | 无公开评论/论坛/投稿，文件不公开托管。 | 引入UGC后建立审核。 |
| ADS-CONTENT-08 | Pass | 有相近主题但未证实门页、堆词或大段重复。 | 少铺同义标题，多补差异化案例。 |
| ADS-UX-01 | Fail | 菜单正常，但20个清理页CTA锚点缺失，实测确认代表页。 | 修复发现2，四语及格式复查。 |
| ADS-UX-02 | Fail | 非图片文章末尾统一指向图片工具。 | 按格式修复发现3。 |
| ADS-UX-03 | Pass | 无诱骗广告/假下载，下载生成真实文件；锚点问题非虚构内容。 | 修复导航缺陷，不混淆未来广告与按钮。 |
| ADS-UX-04 | Pass | 已测加载/操作无自动下载、非预期跳转或遮挡弹窗。 | 第三方变化后复查；不等于完整安全审计。 |
| ADS-UX-05 | Pass | 四语16个信任页可达且针对本站，个人运营和联系信息存在。 | 邮箱实际收件未测试；可补稳定署名。 |
| ADS-UX-06 | Pass | 当前无广告式占位/混淆；实看手机结果和桌面页面。 | 广告上线后另测。 |
| ADS-CRAWL-01 | Pass | 101/101页面200，额外站内目标200，虚构路径404。 | 持续检查发布后状态。 |
| ADS-CRAWL-02 | Unknown | 公开请求和robots/3个UA均正常；真实Google IP/WAF日志未读。 | 核对后台抓取错误与安全事件；不把UA模拟当Google通过。 |
| ADS-CRAWL-03 | Pass | GET返回静态正文，不依赖POST载入内容。 | 保持公开内容入口。 |
| ADS-CRAWL-04 | Pass | canonical页直接200，协议/域名入口单跳归一。 | 保持简洁重定向。 |
| ADS-CRAWL-05 | Pass | 101个稳定自引用URL，无会话/用户参数。 | 不把文件数据写入本站URL。 |
| ADS-CRAWL-06 | Pass | 当前DNS、TLS和响应正常。 | 历史可用率、其他地区本轮未证明。 |
| ADS-CRAWL-07 | Pass | sitemap101条与站内入口完整，博客分页可达。 | Search Console实际索引量另查。 |
| ADS-PROG-01 | Unknown | 当前无广告且此次未点广告；历史运营行为未知。 | 核对历史无效流量/自点记录。 |
| ADS-PROG-02 | Pass | 所查内容无奖励或鼓励点击广告文案。 | 广告启用后保持中性描述。 |
| ADS-PROG-03 | N/A | 当前没有广告单元或标签。 | 投放前检查广告和内容区分。 |
| ADS-PROG-04 | Unknown | 无来源日志/推广账户数据。 | 核对无自动浏览、点击交换、垃圾推广。 |
| ADS-PROG-05 | N/A | 无AdSense运行代码或封装。 | 加入后审查代码行为。 |
| ADS-PROG-06 | N/A | 当前没有Google广告展示位置。 | 投放前排除私聊、空内容等不适当屏幕。 |
| ADS-PROG-07 | N/A | 普通网站，无App WebView变现。 | 如做App另审。 |
| ADS-PUB-01 | Pass | 文件工具和教程无非法推广；Terms限定授权使用。 | 具体素材权利见PUB-02。 |
| ADS-PUB-02 | Unknown | 28张封面仅1张来源许可明确，27张未见权利记录。 | 确认来源/使用权或替换；不认定已侵权。 |
| ADS-PUB-03 | Pass | 库存与风险相关正文未见仇恨、威胁、暴力/恐怖主义宣扬。 | 新内容复核。 |
| ADS-PUB-04 | Pass | 无动物虐待或濒危物种产品推广。 | 新主题出现时复核。 |
| ADS-PUB-05 | Unknown | 身份/品牌/文章来源范围合理；GPS隐私功能承诺有已知矛盾，真实主体未核验。 | 修复发现1；保持真实署名/功能说明，非冒名定论。 |
| ADS-PUB-06 | Pass | 无钓鱼、私密凭证收集、致富承诺。 | 不引入误导表单。 |
| ADS-PUB-07 | Pass | 无破解、伪证、学术作弊或隐蔽追踪推广，Terms禁止滥用。 | 保持授权文件用途。 |
| ADS-PUB-08 | Pass | 无有偿性行为、婚介或家庭内容成人化。 | 新内容复核。 |
| ADS-PUB-09 | Unknown | meta/ads.txt一致；账号持有人与注册信息未核验。 | 核对真实publisher ID及主体。 |
| ADS-PUB-10 | N/A | 无广告覆盖或妨碍交互。 | 广告版检查上传/结果/下载区。 |
| ADS-PUB-11 | N/A | 当前不展示Google广告；内容价值单列评估。 | 投放前排除低内容/错误/纯状态页面。 |
| ADS-PUB-12 | N/A | 无背景或屏外广告。 | 添加广告后复核加载时机。 |
| ADS-PUB-13 | Pass | 当前主题不含选举、健康共识或气候误导。 | 新垂类另审。 |
| ADS-PUB-14 | Pass | 未见公共议题欺骗媒体；合成样例有说明。 | 保留样例标识，不把凭证当事实证明。 |
| ADS-PUB-15 | Pass | 无儿童侵害主题，无公开用户文件/评论。 | 新内容保持审查。 |
| ADS-PUB-16 | Pass | 无利用活跃危机/敏感事件牟利内容。 | 事件专题另审。 |
| ADS-REST-01 | Pass | 当前库存无性娱乐、性用品或性建议内容。 | 新内容复核。 |
| ADS-REST-02 | Pass | 所查主题/封面描述无血腥猎奇或突出粗口。 | 新素材复核。 |
| ADS-REST-03 | Pass | 无武器/爆炸物产品及制作指导。 | 新垂类另审。 |
| ADS-REST-04 | Pass | 无烟草/毒品/相关用具推广。 | 新垂类另审。 |
| ADS-REST-05 | Pass | 无酒类销售或不负责任饮酒推广。 | 新垂类另审。 |
| ADS-REST-06 | Pass | 无赌博/付费机会游戏。 | 新业务另审。 |
| ADS-REST-07 | Pass | 无处方药/未批准药品销售或下架App推广。 | 新垂类另审。 |
| ADS-REST-08 | N/A | 无广告或视频广告。 | 启用后检查遮挡、自动播放与控制。 |
| ADS-PRIV-01 | Fail | 四语隐私页有广告预告披露，但不向Ahrefs提供元数据的承诺与实测冲突。 | 修复发现1；不等于Google已收到PII。 |
| ADS-PRIV-02 | Pass | 四语广告段披露第三方Cookie/存储/beacon/IP及Google数据用途链接。 | 投放时按实际服务更新。 |
| ADS-PRIV-03 | N/A | 当前无Google广告或Google Analytics运行请求。 | 加入Google服务时测试PII/文件数据隔离。 |
| ADS-PRIV-04 | N/A | 当前无Google广告同意流程或Google广告存储，meta仅验证。 | 按投放模式实施同意；相关地区个性化广告用认证TCF CMP。 |
| ADS-PRIV-05 | Fail | 点击地图同时触发带精确GPS的Ahrefs统计，未说明/同意统计用途。 | 阻止敏感统计并按发现1验收。 |
| ADS-PRIV-06 | N/A | 非儿童定向产品，当前无广告。 | 受众变化时审查儿童标记/定向限制。 |
| ADS-PRIV-07 | N/A | 无Google域Cookie操作或广告代理代码。 | 未来不篡改Google域Cookie。 |
| ADS-PRIV-08 | N/A | 无Google广告个性化/再营销/敏感受众列表。 | 不将文件元数据用于受众。 |
| ADS-PRIV-09 | N/A | 不经营住房/就业/信贷定向广告。 | 业务变化后审查。 |
| ADS-PRIV-10 | N/A | 没有个性化广告或受众列表。 | 开启前核对数据权利、披露和选择控制。 |

**完整性核验**

参考清单：73 个唯一 ID；报告表格：73 个唯一 ID；缺失、重复、额外 ID 均为 0。状态总数：41 Pass / 5 Fail / 10 Unknown / 17 N/A。最终数字以随附机器核验结果为准。

**政策与证据索引**

本轮重新读取 Google 官方[资格要求](https://support.google.com/adsense/answer/9724?hl=zh-Hans)、[网站所有权](https://support.google.com/adsense/answer/91205?hl=zh-Hans)、[网站管理与验证](https://support.google.com/adsense/answer/12131223?hl=zh-Hans)、[抓取排错](https://support.google.com/adsense/answer/2381908?hl=zh-Hans)、[计划政策](https://support.google.com/adsense/answer/48182?hl=zh-Hans)、[发布商限制](https://support.google.com/adsense/answer/10437795?hl=zh-Hans)、[支持语言](https://support.google.com/adsense/answer/9727?hl=en)，以及上文链接的页面质量、发布商隐私和CMP政策。没有以流量/字数/文章数/固定等待期或通过概率代替审核要求。

持久化核心证据：`docs/adsense-evidence-2026-09-23.json`。本次原始抓取与细分证据在 `.tmp/adsense-live-evidence-20260923.json`、`.tmp/adsense-live-html-20260923/`、`.tmp/adsense-content-review-20260923.md`、`.tmp/adsense-content-inventory-20260923.json`、`.tmp/adsense-content-live-20260923.json`、`.tmp/adsense-privacy-review-20260923.md`、`.tmp/adsense-privacy-live/`、`.tmp/adsense23-browser-check.log`、`.tmp/adsense23-anchor.log`、`.tmp/adsense23-map-events.log`。截图在 `output/playwright/adsense-20260923-*.png`。
