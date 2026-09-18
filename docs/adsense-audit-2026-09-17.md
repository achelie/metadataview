# ViewExif 全项目 AdSense 审计

审计日期：2026-09-17（北京时间）。对象：[线上网站](https://www.viewexif.com/) 和 `E:/code/sy/metadataview`，本地 HEAD `9b49ba8`。这是审核准备度审计，不是 Google 审批结果。

**结论：Not ready。先解决精确坐标的对外披露缺口，再完成平台行为文章的证据与表述复核。网站具备真实工具和内容基础，没有发现全站抓取、空站、广告堆砌或虚假下载方面的硬伤；当前不能保证再次提交就能通过。**

仓库的 [9 月 5 日审计](adsense-content-audit-2026-09-05.md) 记载 9 月 3 日曾收到“Needs attention／低价值内容”。本次没有取得新的后台状态。历史拒绝不是当前版本必然失败的证明，也不能因为前端改善就宣布拒绝已解除。本次把当前审批状态标为 Unknown，不复用旧报告的通过计数。

## 优先处理的问题

### 1. High：打开地图时会向第三方发送精确坐标，缺少对应披露

- 对应：`ADS-PRIV-05`；状态 Fail，指已核实的披露缺口，不代表已发生数据滥用。
- 证据：[MetadataReportWorkbench.tsx:161](../src/components/MetadataReportWorkbench.tsx#L161) 把纬经度放入 `https://www.openstreetmap.org/?mlat=…&mlon=…`。同一页面的摘要和 GPS 区域有两个打开地图入口（480、506 行），显示文字仅为 Open map。四语隐私政策介绍了本地文件处理、Ahrefs、Cloudflare 和未来 Google 广告，却没有说明 OpenStreetMap 或坐标传送。
- 边界：没有自动打开地图；只有用户主动点击才导航。文件本身没有因此上传，照片坐标也不必然是当前使用者的位置。本次用合成 PNG 验证本地处理，没有向地图服务发送任何私人坐标。
- 修复：两个入口附近统一说明“打开 OpenStreetMap 会向该服务发送此坐标及普通网络请求信息”；让用户在知悉用途后决定是否打开。四语 Privacy 补上接收方、目的、仅点击时发生、第三方隐私政策链接。不要把位置、文件名或标签加进分析/广告事件。
- 官方依据：[Google 发布商政策的设备与位置数据要求](https://support.google.com/adsense/answer/10502938?hl=zh-Hans)。这里按处理或披露可用于推断精确位置的数据做保守审计，不延伸判断其他地区法律。

### 2. High：旧平台观察仍被摘要和表格写成当前结论

- 对应：`ADS-CONTENT-01`、`ADS-PUB-05`。内容质量/事实支撑存在未完成项；不是认定抄袭或蓄意欺骗。
- Instagram：[正文第 38 行](../src/content/blog/does-instagram-remove-exif-data.md#L38) 限定为历史测试；但 description、excerpt、FAQ 和 46–50 行表格仍用通常移除、GPS 已删除等现时表达。本次打开的 [IPTC/Embedded Metadata Initiative 原始测试页](https://www.embeddedmetadata.org/social-media-test-results.php) 显示 Instagram 可下载副本的测试来自 **2013 年**；2015 年条目反而写明无法取回文件。该来源不能直接证明 2026 年的所有相关行为。
- Discord：[第 3、18、44 行](../src/content/blog/does-discord-remove-exif-data.md#L3) 的摘要与 Practical take 写通常移除；正文依据主要是历史社区观察，并明确不是当前保证。要让 description、excerpt、Practical take、FAQ、正文和 FAQ 结构化数据保持同一个证据范围。
- Telegram：[第 38 行](../src/content/blog/does-telegram-remove-exif-data.md#L38) 提到下文讨论的“published study”，但该文实际列出的来源是 Telegram 官方产品公告、隐私政策及 Reddit 讨论，没有对应研究链接。应补上真正支持该句的研究并核对范围，或删除这层来源声称。官方 [HD 图片公告](https://telegram.org/blog/direct-to-channel-trim-voice-and-more) 说明发送模式和清晰度，不构成逐字段删除保证。
- 整体观察：27 篇正文都有内容，按空白分词约 1,050–1,671 词；107 次外部链接引用中 80 次指向 Reddit。正文没有 Markdown 内嵌操作截图（封面另算）。这些数量不是违规标准，但在曾被拒为低价值内容的背景下，应把更多篇幅用于自己核验过的字段、操作条件和结果。
- 修复：先核对这三篇；同步复核 WhatsApp、Reddit、Gmail 同类文章。平台结论写明来源年份、客户端/发送路线及局限；有能力实测时，加入合法合成样本、系统与版本、原文件/接收文件字段对照、实际截图。没做过的测试不能补写成已测试。无需机械增加文章数或凑字数。
- 官方依据：[AdSense 的独特、有用内容要求](https://support.google.com/adsense/answer/7299563?hl=zh-Hans)；[Google 内容自评指引](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) 作为质量诊断补充，不把搜索建议冒充 AdSense 硬性门槛。

### 3. Medium：选题边界、运营者信息和图片授权记录可再加强

- `ADS-CONTENT-08`：`what-is-exif-data`、`exif-metadata-definition-and-how-to-view`、`exif-vs-metadata`、`how-to-check-metadata-of-an-image` 都涉及定义、字段列表、多设备查看和清理。存在主题重叠，但未发现能据此认定门页或自动垃圾内容的证据。建议分别专注“基础概念”“报告字段解读”“标准边界”“具体排错流程”，减少重复解释。不需要为审核贸然删掉原链接。
- `ADS-UX-05`、`ADS-PUB-05`：About 说明个人独立运营并提供邮箱，但“谁”仍只叫 independent operator；全部作者统一 ViewExif。增加真实、可公开的署名或稳定笔名、相关经验、测试方法和更正记录，能让责任更可核验。Google 没有普遍要求必须注册公司、必须放身份证或必须展示真人头像。
- `ADS-PUB-02`：依赖许可有 THIRD_PARTY_NOTICES，但没有找到覆盖 27 张博客封面的逐图来源/许可台账。不能据此认定侵权。保留每张图的原始来源页、作者和适用许可；如果为自制/生成素材，记录相应来源。无需把所有内部授权凭证发布到网页。

### 4. 外部证据缺口与投放前事项

- `ADS-SITE-01`：核对最新 Sites 状态、拒绝原文及上次提交时间；本次未操作私有后台，也未提交审核。
- `ADS-ELIG-01/02`、`ADS-OWN-02`、`ADS-PUB-09`、`ADS-PROG-01/04`：年龄、账号唯一性、真实域名控制权、Publisher ID 与收款主体关系、流量来源及无效流量行为，不能靠公开网页确认。旧报告记载过持有人确认，本次不把二手记录当新验证。
- `ADS-CRAWL-02`：robots 放行，普通请求和三种 Google UA 均可取回首页；这不证明真正 Google 来源 IP 从未被 Cloudflare WAF 拦截。必要时检查 Cloudflare 安全事件和 AdSense 抓取错误。
- `ADS-PRIV-04`：当前不加载广告/CMP 运行代码，因此缺少横幅不是本次申请阶段的失败项。启用面向 EEA、英国、瑞士的广告前，必须验证适用的 Google 认证 CMP、拒绝/管理/撤回流程；Privacy 中的未来计划不等于已实现。[Google CMP 要求](https://support.google.com/adsense/answer/13554116?hl=en)
- 当前 CSP 的 `connect-src` 只允许自身和 Ahrefs。开启广告时需要按真实请求逐项评审；现在不要为“过审”扩大通配放行。广告位置、低内容页排除及同意后请求都要在投放版本另测。
- 本地 `pnpm build` 未通过：缺少可执行的 `astro`，在构建开始前终止。这是当前工作区依赖/环境问题，不能据此说线上网站故障；也不能宣称本次测试或构建已通过。后续修复/发布前恢复依赖并运行构建与已有相关验收。

## 已取得的证据

- 按生产 sitemap 全量 GET **100 个 HTML 页面，100/100 HTTP 200**；每页唯一 H1、自引用 canonical，无 noindex，无 AdSense/Funding Choices 运行标签。
- 100 页全部可沿首页站内链接到达；没有指向 sitemap 之外的站内页面链接，也没有孤页。这里只检查页面链接，不冒充已验证所有锚点和所有交互。
- 27 张页面图片全部返回 200。随机不存在路径返回真实 404。
- robots 返回 200、`Allow: /`；www 和根域 ads.txt 返回同一 Google seller 行，与 100 页 account meta 的数字 ID 一致：`7443237558968985`。实际所属账号仍须后台核对。
- HTTP/根域入口最终进入 `https://www.viewexif.com/`；Mediapartners-Google、AdsBot-Google、Googlebot UA 探针均返回 200。UA 模拟不等同真实 Google 爬虫。
- 桌面下拉菜单和 390px 手机抽屉能打开、关闭；9 个代表路由在 1440/390px 检查 H1、宽度、语言、广告标签和脚本异常（明细见旁附证据）。
- 合成 PNG 在生产首页能读出 Author 和 Comment；生产图片清理器完成创建、复查、下载。输出从 173 B 变为 69 B；直接检查输出字节，两个合成标记已消失；回执 `verified-residual`，格式、尺寸和编码载荷检查均 passed。残留技术字段被如实报告。本次没有验证所有格式、所有输入或大文件性能。
- 检查到 Ahrefs pageview 与 Cloudflare RUM 请求；已读请求体没有合成作者、邮箱或文件名。源码没有向解析服务器上传文件的端点。不能把这个有限样本扩大为对所有未来数据流的保证。
- 全文外链的 89 个独立 URL 自动检查：16 可访问，73 请求失败/超时，未得到 404/410。这 73 个是 Unknown，不是 73 个死链；另通过网页工具成功复核 Telegram 官方公告、Gmail 附件帮助等。没有把链接能打开等同于事实正确。

原始抓取暂存在 `.tmp/adsense-evidence-20260917/`；可长期保留的摘要见 [机器证据](adsense-evidence-2026-09-17.json)。截图位于 `output/playwright/adsense-20260917-*.png`。未修改站点源码、未部署、未发送邮件。

## 完整检查表

状态仅使用 Pass、Fail、Unknown、N/A。Pass 表示在本次明确说明的范围内有证据支持；Unknown 不等于 Fail，也不表示可以跳过。N/A 仅针对当前无广告、无 UGC、无应用 WebView 的版本。

| ID | 状态 | 证据 | 下一步 |
| --- | --- | --- | --- |
| ADS-ELIG-01 | Unknown | 本次无年龄/申请者身份材料。 | 持有人核对成年资格或合法监护账号。 |
| ADS-ELIG-02 | Unknown | 无账号清单权限。 | 核对无重复发布商账号。 |
| ADS-ELIG-03 | Unknown | 当前有坐标披露缺口及内容证据待复核，尚无新审批结果。 | 关闭 High 项并完成后台核对。 |
| ADS-ELIG-04 | N/A | 自有域名静态站，不是 Blogger/YouTube 托管账号流程。 | 使用网站申请流程。 |
| ADS-OWN-01 | Pass | 可读写 Astro 模板，BaseLayout 有 head 验证注入点。 | 保持模板与发布权限。 |
| ADS-OWN-02 | Unknown | 仓库权限不等于 DNS/生产域名所有权证明。 | 核对域名及 Pages 控制权。 |
| ADS-OWN-03 | Pass | 生产 React 工具可处理及清理合成 PNG，JS 正常。 | 后续版本复测相关交互。 |
| ADS-SITE-01 | Unknown | 旧文档记载 9 月 3 日拒绝，本次无最新后台。 | 获取当前 Sites 状态与原因。 |
| ADS-SITE-02 | Pass | 100 页 account meta 和两入口 ads.txt 可读取且一致。 | 后台选择 meta/ads.txt 验证并确认结果。 |
| ADS-TXT-01 | Pass | Google DIRECT seller 行格式正确，与站点 ID 一致。 | 真实账号归属见 ADS-PUB-09。 |
| ADS-TXT-02 | Pass | 已发布 ads.txt，www 与根域可读取。 | 保持可访问与账号一致。 |
| ADS-CONTENT-01 | Unknown | 有真实工具和27篇正文；曾被拒低价值，现平台结论证据范围仍有问题。 | 修复重点文章，补真实独立核验材料，再评估重审。 |
| ADS-CONTENT-02 | Pass | 站点提供本地解析、清理、风险解释及自己的操作指南，非嵌入/转载聚合站。 | 保留引用区分；未做全互联网查重或逐项版权鉴定。 |
| ADS-CONTENT-03 | Pass | 工具页有预渲染说明，文章正文约1050–1671词；列表是分页导航。 | 强化案例，不按固定字数凑内容。 |
| ADS-CONTENT-04 | Pass | 100页公开、工具可运行，未发现建设中/空白占位路由。 | 修复后做生产回归。 |
| ADS-CONTENT-05 | Pass | 当前无广告、无赞助/联盟推广主导内容的布局。 | 广告版另测比例。 |
| ADS-CONTENT-06 | Pass | 英、德、法、简中均为支持语言；翻译页面有正文。 | 保持正文与语言标签一致。 |
| ADS-CONTENT-07 | N/A | 无评论、论坛或用户公开发布；文件仅本地处理。 | 引入公开UGC前制定审核流程。 |
| ADS-CONTENT-08 | Pass | 主题集中且有不同任务页面；未证实门页或关键词垃圾。 | 区分4篇相近概念/查看文章的独立用途。 |
| ADS-UX-01 | Pass | 所有页面链接可达；桌面下拉、手机抽屉及代表视口正常。 | 变更导航后复查。 |
| ADS-UX-02 | Pass | 首页工具、格式入口、博客、相关阅读及页脚信任页构成完整路径。 | 继续清晰标示非英语页面链接至英文指南。 |
| ADS-UX-03 | Pass | 站内无缺失页面链接，清理下载按钮产生真实本地文件。 | 不在上传/下载控件附近放混淆广告。 |
| ADS-UX-04 | Pass | 所测页面无非预期跳转或自动下载；下载由明确点击触发。 | 第三方脚本变化后复测；非完整安全渗透测试。 |
| ADS-UX-05 | Pass | 四语About/Contact/Privacy/Terms共16页均存在且可达。 | 丰富真实署名/方法；邮箱实际收发本次未验证。 |
| ADS-UX-06 | Pass | 无广告占位、遮挡或混淆标签；实看桌面及手机截图。 | 广告启用后再次检查。 |
| ADS-CRAWL-01 | Pass | 100/100正式页200，虚构路径404。 | 维持部署后全量页面检查。 |
| ADS-CRAWL-02 | Unknown | robots放行、公开访问和UA探针成功；无WAF日志。 | 核对真实Google爬虫访问/安全事件。 |
| ADS-CRAWL-03 | Pass | 静态GET即含页面正文，不依赖POST；用户文件结果在本地。 | 保持广告所在页面有可抓取发布商内容。 |
| ADS-CRAWL-04 | Pass | 正式canonical页直接200，HTTP/裸域最终正确，没有会话依赖。 | 保持入口重定向简洁。 |
| ADS-CRAWL-05 | Pass | 稳定路径、100页自引用canonical，无会话/用户ID路由。 | 不把文件数据放进URL。 |
| ADS-CRAWL-06 | Pass | 本次DNS、HTTPS和100页请求正常。 | 持续可用性未知；按现有监控核对历史。 |
| ADS-CRAWL-07 | Pass | sitemap包含100页，全部可从首页沿链接到达。 | Search Console实际收录/抓取时间另行确认。 |
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
| ADS-PUB-05 | Unknown | 品牌不冒充Google/Adobe；平台结论有事实支撑范围差异。 | 统一摘要/FAQ/正文并明确作者方法。 |
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
| ADS-PRIV-01 | Pass | 四语Privacy解释当前分析/托管、未来Google广告及Cookie/IP等；有页脚链接。 | 广告上线前改为准确的当前时态；地图缺口另列05。 |
| ADS-PRIV-02 | Pass | 广告段披露Google与第三方Cookie、存储、beacon、IP/标识符。 | 实際广告提供方变更时更新。 |
| ADS-PRIV-03 | Pass | 无Google广告请求；有限合成样本所查分析请求无文件标记，源码无上传解析端点。 | 加广告后覆盖文件名、GPS、哈希、清理及导出全流程复测。 |
| ADS-PRIV-04 | N/A | 当前无Google广告/CMP运行代码，审查对象是申请版。 | 对EEA/英国/瑞士启用广告前验证认证CMP及拒绝/撤回。 |
| ADS-PRIV-05 | Fail | 点击OSM地图链接会发送精确坐标，入口及Privacy未充分说明这一第三方处理。 | 加即时说明及四语披露，保持用户知情选择。 |
| ADS-PRIV-06 | N/A | 非儿童定向服务，当前无广告或儿童兴趣定向。 | 受众或投放改变后审查标记。 |
| ADS-PRIV-07 | N/A | 无自定义Google广告/代理代码，无Google域Cookie操作。 | 将来集成保持不篡改。 |
| ADS-PRIV-08 | N/A | 无广告个性化、再营销列表或敏感元数据受众构建。 | 禁止把文件内容转为广告受众。 |
| ADS-PRIV-09 | N/A | 不经营住房、就业或信贷定向广告。 | 营销范围变化后复审。 |
| ADS-PRIV-10 | N/A | 没有个性化广告或受众列表。 | 开启前核对权利、披露与选择入口。 |

## 政策依据与完整性

已在线刷新：[资格要求](https://support.google.com/adsense/answer/9724?hl=zh-Hans)、[页面质量](https://support.google.com/adsense/answer/7299563?hl=zh-Hans)、[站点验证及审批](https://support.google.com/adsense/answer/12131223?hl=en)、[计划政策](https://support.google.com/adsense/answer/48182?hl=zh-Hans)、[发布商政策](https://support.google.com/adsense/answer/10502938?hl=zh-Hans)、[受限内容](https://support.google.com/adsense/answer/10437795?hl=zh-Hans)、[抓取问题](https://support.google.com/adsense/answer/2381908?hl=en)、[支持语言](https://support.google.com/adsense/answer/9727?hl=en)、[隐私政策披露](https://support.google.com/adsense/answer/1348695?hl=en)、[CMP要求](https://support.google.com/adsense/answer/13554116?hl=en)。部分英文入口限流时使用可访问的官方中文入口；资格中的源码权限由已读资格页支持，没有伪称全部入口均成功。

没有使用最低文章数、最低字数、最低日流量、固定等待天数或通过概率。Google最终决定以后台为准；本站当前高风险项处理完且外部证据核对后，再决定是否申请复审。

- 参考清单独立要求：73 项（排除文末输出示例的重复 ID）。
- 本报告检查表：73 行。
- 缺失、重复、多余 ID：均为 0。
- 状态：44 Pass / 1 Fail / 12 Unknown / 16 N/A。
- 没有把“未启用广告”“已有旧审计”或“没有后台权限”当成审核通过。
