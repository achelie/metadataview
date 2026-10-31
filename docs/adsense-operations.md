# ViewExif AdSense 申请与运营检查表

这份清单适用于 `viewexif.com` 的申请阶段和获批后的日常运营。每次申请或发布留下检查时间、版本和证据；投放后每月复查。最后修订：2026-09-23。

## 两种 Ready 分开记录

- **Application-readiness: Ready**：当前生产版本通过申请前检查，已知阻塞已解决，可以由运营者提交审核。这是网站准备程度的判断，不代表 Google 批准，不保证申请结果。
- **Google Sites: Ready**：AdSense 私有后台的真实审核状态。只有看到该网站当前状态为 `Ready` 才能如此记录；本地测试、部署成功、meta 和 `ads.txt` 都不能代替它。

审核报告可以在 Google 后台仍为 `Requires review`、`Getting ready` 或状态未读取时，判定网站的 application-readiness 为 Ready。存在历史拒绝时记录其日期和原因，按当前版本和当前后台申请入口处理，不把旧拒绝自动当成永久的内容缺陷。

2026-09-23，运营者已在本次任务中确认：申请者已满 18 岁、没有重复 AdSense 账号、控制本域名和对应 Publisher ID `pub-7443237558968985`。这是持有人声明，不写成已读取身份证明、付款后台或 Google Sites 截图。运营者同时确认原有博客封面来自 Pexels；逐图文件、哈希及能恢复的来源见 [博客图片来源台账](./blog-image-sources.md)。

当前版本维持无广告运行脚本状态，只保留所有权验证 meta 和 `ads.txt`。本检查表不执行后台提交、开启广告或发送联系测试邮件；提交审核和广告上线分别由运营者安排。

本次申请前检查已完成，生产源码为 6384290、部署为 e094c704。完整结果见 [2026-09-23 修复后复核报告](./adsense-remediation-2026-09-23.md)，修复前结论保留在 [同日原始审核](./adsense-audit-2026-09-23.md)。申请准备度为 Ready；4 项无法独立核验的运营/后台事实仍为 Unknown，Google 是否批准单独记录。

## 申请前发布门槛

- [x] 生产环境的每个 HTML 页面恰好包含一个 `google-adsense-account=ca-pub-7443237558968985` meta；没有 `adsbygoogle.js`、广告位、Auto Ads 或 Funding Choices 标签。
- [x] `https://www.viewexif.com/ads.txt` 返回 200 和 `google.com, pub-7443237558968985, DIRECT, f08c47fec0942fa0`；裸域可到达同一内容。公开文件检查与后台 `Authorized` 状态分别记录。
- [x] About、Contact、Privacy、Terms 的英语、德语、法语和简体中文页面均可访问；公开邮箱为 `contact@viewexif.com`。邮箱实际收发测试由运营者自行留证，本轮未代发邮件。
- [x] 2026-09-23 已取得本次申请者的年龄、账号唯一性、域名和 Publisher ID 控制确认；公开 account meta 和 `ads.txt` 使用相同 ID。付款信息和账号任务以运营者后台为准。
- [x] 对当前待发布版本运行相应单元测试、`pnpm build` 和浏览器回归，保存命令、版本 SHA、时间和结果。验证工具真实操作、GPS 外链、清理页 CTA、博客摘要/意图和移动导航；本地通过后仍要检查对应生产版本。
- [x] 抓取当前 sitemap 中所有 URL 及页面引用的图片，核对页面状态、title/H1/canonical、robots、account meta、广告脚本、站内链接及封面响应；数量从当前 sitemap 计算，不沿用旧的 100 页基线。
- [x] 使用 `adsense-site-auditor` 输出完整 73 行 ADS-* 表，并对照技能当前 requirements 实际数量复核。所有 Blocker 解决，High 风险修复或明确接受，适用的 Fail 有具体处置；账号后台暂不可见、尚未投放广告的 N/A 项与网站缺陷分开记录。

源文件封面哈希与 [台账](./blog-image-sources.md) 保持一致；仅补来源记录不重编码或替换现有图片。不要把缺少逐图原始链接直接写成已侵权，也不要把持有人确认写成逐图独立认证。

## Google 后台证据

1. 网站准备完成后，由运营者在 AdSense 的 Sites 中添加或选择 `viewexif.com`，按后台可选方式使用 account meta 或 `ads.txt` 验证所有权，再执行 `Request review`。现有验证方式不需要为了申请预先部署广告运行脚本。
2. 保存当前 Sites 状态、账号待办、Publisher ID 和 `ads.txt` 状态的带日期证据。若后台仍显示旧拒绝，依据其当前入口申请复审；不能把申请已提交写成 Google Sites Ready。
3. 当前未投放广告，未部署 Google 广告 CMP；不能把“没有 CMP”单独判为无广告申请版本的缺陷，也不能写成该站已经完成所有地区的广告同意验证。现有统计、托管和外部链接仍须按实际数据处理进行披露。
4. 后台申请流程可让运营者选择 CMP 方案。选择或生成消息不等于生产页面已经正确运行；实际投放前单独配置、发布和验证。Google 官方支持 meta/ads.txt 验证，并把申请流程中的 CMP 选择列为可选步骤。

参考：[站点验证与申请流程](https://support.google.com/adsense/answer/12169212?hl=en)、[Google 的发布商 CMP 要求](https://support.google.com/adsense/answer/13554116?hl=en)、[隐私政策 URL 要求](https://support.google.com/adsense/answer/10961370?hl=en)。申请流程及发布商 CMP 文档于 2026-09-23 重新核对。

## 保留修复前与修复后证据

每次生产检查使用新的带日期/时间或版本的目录；不要覆盖此前结果。`scripts/check-production-content.mjs` 能比较基线页面与本地 dist 的 SEO/文章信息，但当前 `docs/content-url-baseline.json` 只有 100 条，未含 2026-09-22 新文章，不能单独代表当前 101 页全量检查。`scripts/check-seo-output.mjs` 检查本地构建，也不能代替生产 GET 和浏览器实测。

可复跑的 [页面审核脚本](../scripts/audit-adsense-pages.mjs) 与 [图片审核脚本](../scripts/audit-adsense-images.mjs) 要求显式传入证据目录，在仓库根目录按顺序运行；示例目录需改为本次尚不存在的名称：

```powershell
node scripts/audit-adsense-pages.mjs --output-dir .tmp/adsense-postfix-YYYYMMDD-HHMM
node scripts/audit-adsense-images.mjs --evidence .tmp/adsense-postfix-YYYYMMDD-HHMM/crawl.json --output-dir .tmp/adsense-postfix-YYYYMMDD-HHMM
```

页面脚本拒绝使用已存在的输出目录，图片脚本可向同次页面审核目录新增 images.json，但拒绝覆盖已有同名证据。第一步保存当前 sitemap 的全部页面、片段锚点和技术探针；第二步从刚保存的 HTML 检查去重图片响应。它们不证明客户端结果交互正确：地图坐标不得在用户明确操作前出现在外链 href 或出站请求，清理页 CTA 要能定位到实际工作区，博客意图调整要检查最终正文与目录，这些仍需浏览器回归。带 Google UA 的探针通过不等于已核验真实 Google 来源 IP；有抓取报错时结合后台与 Cloudflare 事件检查。

## 无效流量红线

- 不点击自己的广告，也不要求家人、朋友、用户或外包人员点击。
- 不购买 paid-to-click 流量，不参与点击交换、流量交换、奖励点击或机器人流量。
- 不用垃圾邮件、误导按钮、强制跳转或伪装下载链接引流。
- 不承诺点击率，不以点击作为用户奖励或合作方结算依据。
- 发现异常时先暂停相关流量来源和广告展示，保存日志，再通过 AdSense 的无效点击联系渠道报告；不要用更多点击“复现”。

## 每月检查（记录月份、执行人和证据链接）

- 流量来源：对比自然搜索、直接访问、引用、社交和付费来源；调查突然出现的国家、来源域、落地页或短时流量峰值。
- 广告异常：检查展示、点击、CTR、CPC 和收益的突变；按页面、设备、国家和来源拆分，并记录处理结论。
- 自动化流量：检查高频重复请求、数据中心 ASN、异常 User-Agent、零交互会话和短周期重复访问；封禁或限速明确的机器人来源。
- PII 网络检查：只选择含合成文件名、邮箱、GPS 和自定义标记的测试文件，完成解析、清理、导出、重选、清除与刷新；不使用用户真实文件。核对出站请求的 URL、查询参数、请求头和请求体，文件名、路径、哈希、邮箱和提取的元数据不得进入统计、性能监测或其他未授权请求。使用自动化时，在发送前拦截敏感标记；拦截到的泄漏仍算失败。确认真实 Ahrefs pageview 和生产 Cloudflare RUM 已发生，不能以脚本未运行或一概禁止 POST 代替检查。
- 地图坐标例外：用户看到就地说明并主动点击或用键盘激活“在 OpenStreetMap 查看”后，允许对应的 `https://www.openstreetmap.org/` 地图导航携带当前坐标；不携带文件名、其他元数据、请求体或来源页 Referrer。操作前不得发送坐标；地图操作也不得把坐标复制到 Ahrefs、Cloudflare RUM 或其他请求。单独保存授权地图导航与统计请求的证据，不把此例外扩展成一般外传许可。
- 合规页面：复查 About、Contact、Privacy、Terms、account meta、`ads.txt`、邮箱和政策外链；实际服务或第三方处理变化时，先更新披露再发布功能。

## Google Sites Ready 后，实际启用广告前

- 单独评审并最小化 CSP 放行范围；不提前加入宽泛的 Google 域名通配规则。
- 排除 About、Contact、Privacy、Terms 以及其他低内容/信任页面的广告加载。
- 按实际投放地区与广告方式配置适用的 CMP。向 EEA、英国和瑞士用户投放个性化广告前，使用 Google 认证并集成 IAB TCF 的 CMP；非个性化/有限广告也要按实际 Cookie、标识符和适用同意要求验证，不能把它们当成通用豁免。
- 本项目计划使用 Google CMP，按实际支持配置四语，首层提供 Consent、Do not consent、Manage options，并保留撤回/重新选择入口。计划不等于已经发布或测试完成；供应商、用途、优化和关闭按钮配置按当时后台逐项记录，不能凭旧文档虚构当前设置。
- 在 EEA、英国、瑞士测试同意、拒绝、管理选项和撤回；在其他地区测试适用消息及广告行为。隐私政策页面保持可访问，并在本项目配置中排除广告与 Funding Choices 运行标签。
- 验证广告不会覆盖导航、下载控件、文件选择器或结果，也不会让内容看起来像广告。
- 重新运行完整 ADS-* 审计，重点把此前因“尚未投放广告”而标为 N/A 的广告位、CMP、内容比和标签项改为实测结论。通过前不启用广告。
