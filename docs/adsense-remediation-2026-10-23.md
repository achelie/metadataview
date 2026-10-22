# ViewExif：AdSense 报告核对、整改与复检

日期：2026-10-23（香港）。目标：https://www.viewexif.com/ 。

结论：报告中的隐私披露缺失、广告已投放、博客只有个位数与当前公开输出不符。本次按报告定向整改，不把旧报告的 73 项状态当作重新完成的全站审计。网站是否获 Google 批准仍需查 AdSense 后台；本地改动、构建成功和发布商标识都不能证明过审。

## 先纠正会影响整改方向的检测结果

| 报告判断 | 当前证据 | 处理 |
| --- | --- | --- |
| ADS-PRIV-01/02：没有 Cookie / 第三方广告披露 | 线上 `/privacy/` 原第 6、7 节已写 Cookie、Google、第三方、网络信标、IP、以前访问记录与 Ads Settings。四语源码也已有这些说明。 | 属于检测遗漏。本次增强标题、广告开关边界、第三方退出入口，不声称从零补齐。 |
| 检测到发布商 ID，所以已经接广告 | `BaseLayout.astro` 只有 `google-adsense-account` 验证 meta；生产浏览器看到 Ahrefs 和 Cloudflare 脚本，未见 AdSense loader 或广告单元。 | 验证标识与实际广告请求分别判断。当前按未投放版本处理。 |
| 只有个位数博客，需要先冲到 30+ | 生产 sitemap 为 104 URL，其中 31 个博客文章 URL；仓库也是 31 篇。正文去 frontmatter 粗计约 1,000–1,670 英文词。 | 保留已有足量内容，新增有独立用途的字段深读。 |
| 相同字数证明低质机翻 | 导航重复会污染全文计数；字数本身不能证明翻译质量。四语工具说明已有对应字段、情境和例图。 | 做逐页语言校审；没有具体问题前不批量 noindex。 |
| 博客没有署名和更新时间 | 原模板已有 ViewExif 署名、About 链接、可见 Last edited，以及 BlogPosting 的发布日期和更新日期。 | 增加可见发布日期、方法与编辑规则入口；不编造真人作者或履历。 |

生产取证保存在 [公开页面与文件证据](./adsense-remediation-live-2026-10-23.json)。它记录的是本地改动前的线上状态，不代表此次整改已经部署。

`ADS-*` 是检测清单的内部编号，不是 Google 官方审核编号。Google 要求内容独特、有用，导航清晰易用；官方页面没有把 800 词、30 篇、三项导航或首屏 300px 定为统一过审门槛。下文把这些作为本次可执行的编辑与体验目标。[页面准备要求](https://support.google.com/adsense/answer/7299563?hl=en)

## Blocker：先排除真实政策阻断

### ADS-PRIV-01：四语隐私披露

实际文件：`src/components/pages/ContentPage.astro`、`src/config/site.ts`。

四个地址：`/privacy/`、`/de/privacy/`、`/fr/privacy/`、`/zh-cn/privacy/`。

已将广告小标题明确为 Cookie、标识符与 Google 广告；说明当前无广告请求，发布商 meta 和 ads.txt 仅用于验证；新增未来同意机制的边界、第三方退出链接，以及显式工具接续只在内存短暂传递文件的说明。生效日期对应此次实质改动，设为 2026-10-23。

英文成品已写进页面，核心段落如下：

> The current website version does not load the Google AdSense script, request Google ads, or create Google advertising cookies. The published AdSense account identifier and ads.txt entry are used only to verify site ownership and seller authorization; they do not show whether Google has approved the site.

> If ads are enabled later, Google and its third-party advertising technology partners may place or read cookies and local storage, use web beacons, receive IP addresses or other device identifiers, and process page information and ad interactions. Those signals can be used to serve ads, control frequency, measure performance, prevent fraud, and provide personalized or non-personalized advertising.

后续启用广告时，必须把条件式文案改成实际运行情况，核对服务商、用途、同意方式与退出入口；只增加一段模板不等于同意机制已生效。[Google 隐私披露政策](https://support.google.com/publisherpolicies/answer/10437794?hl=en)

### ADS-PRIV-04：CMP 是启用相关广告前的待办

当前没有广告请求，因此“未检测到 CMP”不能单独证明当前已违反广告同意要求。不要为了消除 Unknown 随便装一个自制 Cookie 横幅，也不要把“非个性化广告”理解成无需同意。

准备投放时按顺序完成：

1. 在 AdSense 的“隐私权和消息 / Privacy & messaging”中，为本站配置并发布适用的欧洲法规消息，或接入当前 Google 认证列表中的 CMP。
2. 按后台提供的接入方式配置，不预先锁死报告中的旧 TCF 版本号；为 EEA、英国、瑞士用户提供清楚的接受、拒绝、管理和撤回入口。
3. 用对应地区的真实测试环境检查：未作选择、接受、拒绝、撤回、刷新后保留选择。检查同意信号、Cookie/本地存储和实际广告请求，而非只看横幅。
4. 同步更新四语隐私政策与 CSP。当前 `public/_headers` 的 `connect-src` 只放行本站和 Ahrefs，新增 CMP/广告网络需要按实际供应商精确配置和实测，不应直接放开 `*`。
5. 完成后才开启相应广告模式。暂时不投放不需要伪造一个无功能的“管理 Cookie”按钮。

Google 认证且集成 TCF 的 CMP 要求适用于向 EEA、英国、瑞士用户投放个性化广告；其他模式仍须遵守适用的 Cookie/存储和数据使用同意要求。[当前 CMP 要求](https://support.google.com/adsense/answer/13554116?hl=en)、[欧盟用户同意政策](https://www.google.com/about/company/user-consent-policy/)

## High：导航、第三方披露与内容价值

### ADS-UX-01：紧凑且只有一份的主导航

实际文件：`src/components/Header.astro`、`src/styles/global.css`、`src/components/pages/HomePage.astro`、`src/i18n/home.ts`。

主导航改为 Tools / Blog / About（四语）。Tools 内继续提供图片、视频、音频、文档查看与清除，以及隐私检查和 C2PA。桌面与移动端共享导航 DOM，语言选项只渲染一次；删除重复的可见 Navigation / Language 标题和重复 CTA。保留可读的无障碍名称、Escape、焦点返回和软导航后重绑。

首页首屏说明缩成一句，文件大小限制保留，原详细介绍移到工具后。移除装饰标签预留的空列和对应旧响应式定位。四语首页在 320/375/390/430px 下，上传容器顶点约 184–262px，均进入首屏前 300px，且没有横向溢出；这是本次体验目标，不是 Google 的固定政策数值。

复检重点是：关闭时子菜单不进入键盘顺序、打开时所有工具可达、320/375/390/430px 无横向溢出、操作目标至少 44px、文本不超过设计字号 28px。全文提取可能仍包含折叠菜单的文字，这不等于用户首屏真的看到全部菜单。

### ADS-PRIV-02 / ADS-PRIV-10：广告商与选择权

同一隐私内容源继续明确 Google 及第三方可根据用户在本站或其他网站的既往访问提供个性化广告；保留 Google 数据用途、Ads Settings，增加参与第三方的 DAA 退出链接，并说明退出个性化不等于停止所有广告。[AdSense 隐私政策必需内容](https://support.google.com/adsense/answer/1348695?hl=en)

### ADS-CONTENT-01/02/03/08：扩写做深 + 成型内容页

当前 31 篇英文博客已超过本次约定的 800 词下限，不做机械加长。本次新增：

| 成稿 | 用途与结构 | 文件 |
| --- | --- | --- |
| EXIF time zones / OffsetTimeOriginal（正文约 1,115 词） | 捕获时间、时区偏移、UTC 换算、跨设备比较、相机时钟错误与无法判断的边界 | `src/content/blog/exif-timezone-offsettimeoriginal.md` |
| EXIF orientation values（正文约 1,061 词） | 八种方向值、镜像与旋转、像素尺寸、浏览器显示、清理后检查 | `src/content/blog/exif-orientation-values.md` |

两篇正文按 800–1,500 英文词成稿，使用结构化小标题、具体值和判断流程，引用技术一手资料，不冒充平台实测。工具模板 `src/components/ToolEditorialSections.astro` 按文件类型和任务提供 2–3 篇相关深读，非英语工具页标明链接通向英文指南。

整改单完成后为 33 篇博客；增加一页博客分页和两页规则页后，构建输出为 109 个可索引 canonical URL。新增文章字数按浏览器渲染的正文计，不把导航、页脚或 FAQ 计入。

后续内容按需求逐篇完成，不先生成 40–60 个套模板字段页：

1. 下一批字段可选 GPSLatitude/GPSLongitude、IPTC By-line、XMP creator。每篇 800–1,500 英文词，写明来源组、示例值、冲突、隐私影响和可操作检查步骤；已有相同意图的文章优先更新。
2. 平台实测必须先保留样本来源、合成测试值、测试日期、客户端/系统版本、原件与下载件哈希、流程截图和逐字段对照。没有这些记录就明确写文档解读，不写“亲测发现”。现有平台文章不能仅凭通用结论升级成实测报告。
3. 多语言按核心查看、清除、GPS、C2PA 流程先校审，逐条检查术语、句子、示例、FAQ、错误提示与导航。发现具体误译先修；只有低价值/重复意图的实际证据时，才决定合并或 noindex，并同步 sitemap/hreflang。
4. 法律/取证长文需要核验适用地区的一手规范或真实判例。不能把 EXIF 值当成真实性证明，也不为补文章数编造法律结论。

## Medium：透明度、互动和未来广告位置

### 署名、日期与方法

新增 `/editorial-policy/`、`/how-we-test/`，由 `src/components/pages/EditorialPage.astro` 提供正文。博客模板 `src/pages/blog/[slug].astro` 展示发布日期、更新时间、品牌署名及方法入口。页脚 `src/components/Footer.astro` 增加两页链接，四语标签说明英文目标。

编辑页说明资料来源、示例与实测的区别、更新与纠错规则；测试页按实际仓库的单元测试、浏览器流程、合成夹具和隐私网络检查描述覆盖与局限。品牌责任人与 About 的“一位独立运营者”保持一致，不编造姓名、团队、从业年限或设备亲测。

### UGC

当前不开放评论，无需为了“用户信号”添加评论系统。以后如开放，先实现审核后发布、垃圾内容过滤、举报和管理员处理，再允许公开索引和广告。

### ADS-PROG-03/06 与广告位置

当前没有广告单元，无需增加空广告位。启用时先在 AdSense 预览里检查 Auto Ads 和手动广告的全部位置：排除文件预览、敏感结果、操作菜单、清理下载区、404 和空结果屏；在移动和桌面验证广告不遮挡正文或导航，不贴近选择文件、样例和下载按钮。自建广告外框需要标签时用 `Advertisement`，保留 Google 自带标识。

“纯功能工具页一律不能投放”不是准确的普遍规则；关键是页面是否有实用的自有内容、是否低价值、广告是否与操作混淆。本站工具页的说明和功能应共同评估。[广告位置建议](https://support.google.com/adsense/answer/1282097?hl=en)、[AdSense 计划政策](https://support.google.com/adsense/answer/48182?hl=en)

## 原报告 17 个 Unknown：逐项确认

状态是本次定向核对结果；`N/A` 仅表示当前无广告的实现暂不涉及，启用后必须重查。

| ID | 当前判断 | 怎么确认、保留什么证据 |
| --- | --- | --- |
| ADS-ELIG-01 | Pass（保存的站长确认） | 已保存成年确认，无需再次提供生日/证件。若实际申请主体改变，自己核对付款资料主体符合资格；不要把证件写进仓库。 |
| ADS-ELIG-02 | Pass（保存的站长确认） | 已确认沿用现有账号。到账号信息核对发布商 ID 为 `pub-7443237558968985`；加网站走 Sites，不为新域名重开个人账号。 |
| ADS-OWN-01 | Pass（源码权限） | `BaseLayout.astro` 可编辑 `<head>`，已输出验证 meta。部署后查看网页源码，确认内容与后台给出的账号一致。 |
| ADS-OWN-02 | Unknown | 登录域名注册商/Cloudflare，确认 `viewexif.com` 的 DNS 和续费/管理权限；核对部署项目绑定。不需要公开账户资料。 |
| ADS-SITE-01 | Unknown | AdSense → Sites → 本站，保存当前状态及具体问题。只有 Google 显示 Ready 才代表可投放；验证完成/审核中不等于获批。 |
| ADS-SITE-02 | Pass（公开实现） | 线上已有账号 meta 和正确 ads.txt；在后台选择它实际提供的验证方式并执行验证，记录结果。不是必须同时安装三种验证。 |
| ADS-PROG-01 | Pass（保存的站长声明） | 已保存从未自点/刷展示点击声明；继续避免测试或邀请别人点击广告。正常查看自己网站允许，避免过度刷新；未知外部异常另查日志。[官方无效流量答疑](https://support.google.com/adsense/answer/1348754?hl=en) |
| ADS-PROG-03 | N/A（未投放） | 投放后在 Auto Ads 预览和真实桌面/手机页面核对标签、间距、覆盖与误触；同时查手动广告，保留位置截图。 |
| ADS-PROG-04 | Unknown（本站当前流量） | 已保存无购买/激励流量声明。仍需核对本站近 28 天来源、引荐域名、国家、落地页、推广支出与日志异常峰值；无 PTC、互点、自动冲浪或垃圾邮件导流。 |
| ADS-PROG-06 | N/A（未投放） | 启用时核对所有模板和后台排除项，广告仅出现在有实用内容的合适页面；不投弹窗、邮件、私人结果屏或空页。 |
| ADS-PRIV-03 | N/A（当前无 Google 广告请求） | 上线广告前用合成文件，不用私人文件，检查 Network 的 URL、Referrer、请求体、dataLayer，确保文件名、作者、邮箱、电话、GPS、路径和哈希不进入广告/统计请求。统计链路也要单独验证。[PII 检查方法](https://support.google.com/adsense/answer/6156630?hl=en) |
| ADS-PRIV-04 | N/A（广告 CMP 当前未启用）；投放前待办 | EEA/英国/瑞士实际环境验证 CMP 接受、拒绝、撤回和信号，核查 Cookie/存储与广告请求；按前述步骤做，截图不能代替运行证据。 |
| ADS-PRIV-05 | N/A（无浏览器定位采集） | `Permissions-Policy` 禁止 geolocation；代码不请求浏览器定位。照片 GPS 在本地读取，只有用户主动打开 OpenStreetMap 才进入外链，四语说明已披露；未来新增上传/定位再评估。 |
| ADS-PRIV-07 | N/A（无广告代理或 Cookie 改写） | 新增广告代码时搜索 Cookie 写入和代理/注入代码，确认不设置、截获、修改或删除 Google 域 Cookie；浏览器限制不能代替代码审查。 |
| ADS-PRIV-08 | N/A（无广告受众功能） | 未来检查 Google/第三方受众设置、事件和数据层，不能用上传文件的健康、宗教、政治、性取向等敏感内容建立或定向受众。 |
| ADS-PRIV-09 | N/A（当前无相关定向） | 若以后涉及美国/加拿大住房、就业、信贷广告或受众策略，核对相关产品的受众和地域设置，避免按受限制的人口属性/邮编定向；不是简单看网站是否卖房就结束。 |
| ADS-PRIV-10 | N/A（未用个性化广告） | 启用前核对数据来源与使用权、CMP 供应商及用途、广告选择与撤回入口；页面写了 IBA 披露不等于已经取得同意。 |

保存的个人声明来自当前自有站适用的审计技能资料；源码与生产页面证据、个人声明、私有后台状态分别记录，不互相替代。

## 整改后复检清单

### 本地与部署输出

- [ ] 四语隐私页能 GET 返回 200；Cookie、第三方、Google、标识符、用途、退出与同意边界完整；日期为 2026-10-23。
- [ ] 页脚 About / Contact / Privacy / Terms / Editorial policy / How we test 均可达；没有死链或无功能的同意按钮。
- [ ] 主导航四语可用；工具入口齐全；语言菜单只保留一份；关闭、Escape、焦点返回和软导航重绑正常。
- [ ] 320、375、390、430px 首页、工具、博客和菜单无横向溢出；可见文字设计字号不超过 28px，主要操作至少 44px。
- [ ] 两篇新深读各有 800–1,500 英文词正文、具体例子、结构化小标题、一手来源与 2–3 篇有效相关阅读。
- [ ] 既有 31 篇博客保留；新增内容没有伪造测试、作者履历或平台版本。
- [ ] 博客的发布/更新日期可见且与结构化数据一致；编辑规则与测试方法可读。
- [ ] 每个工具页推荐 2–3 篇相关指南；非英语页面明确标注英文指南。
- [ ] sitemap 包含新页面，只列可索引 canonical；robots 放行，Google/AdSense 抓取不受登录墙或 WAF 挑战。
- [ ] `ads.txt` seller 行和 `<head>` 账号 meta 与实际账号相符。
- [ ] 当前未投放版本无 AdSense 广告请求；隐私声明与生产运行一致。
- [ ] 单元、构建/SEO/资源、法律页、博客、导航与本地文件隐私回归通过。
- [ ] 正式部署后重新抓取四语隐私、首页、两篇新博客、两篇规则页；核对 HTTP、canonical、正文和 sitemap，确认实际部署的内容。

### 站长后台与投放前

- [ ] 域名管理权与 AdSense Sites 验证已核对；把 Ready、审核中或待处理问题如实记录。
- [ ] 最近 28 天本站来源与异常峰值已复核；无激励点击/展示或垃圾导流。
- [ ] 多语言核心页面经逐页语言校审，修复真实误译，不仅检查字数。
- [ ] 若启用广告，认证 CMP 已发布并在 EEA/英国/瑞士验证接受、拒绝和撤回；隐私政策/CSP同步更新。
- [ ] 若启用广告，Auto Ads 与手动位置均已检查；敏感文件结果和操作区已排除，广告标识中性、无误触遮挡。
- [ ] 若启用广告，合成文件的敏感值没有进入广告/统计 URL、Referrer、事件或请求体，受众规则符合要求。

## 本次验证与范围

- `pnpm test`：27 个文件、287 项单元测试通过。
- 最终 `pnpm build`：Astro check 0 errors / 0 warnings（5 个既有 hints）；110 个页面输出、109 个可索引 canonical URL。sitemap、内链、语言 alternate、robots、JSON-LD 与资源检查通过。构建仍提示既有浏览器依赖外部化、大包体和 WASM 接近单文件限制，未阻断构建。
- 法律页与博客原 146 项 Chromium 回归首轮 143 项通过。两项旧文章数/分页和导航选择器预期已按 33 篇、6 页、共享导航更新并通过复测；另一个 239px 页面读取失败在稳定构建上复测通过。
- 首页操作和两条真实 Ahrefs 统计隐私链路通过；覆盖选择、地图鼠标/键盘动作、重选、清除、刷新及查看器→隐私→清理→再检查，没有测试文件敏感值外传。
- 导航、语言和软导航文件接续相关 9 项回归通过；`navigation-readiness.spec.ts` 的 57 项原场景及修正旧选择器后的 8 项手机场景均通过，共覆盖 65 项。
- 首页文案与布局调整后的 i18n/blog 定向单元回归 14 项通过。
- 新四页在 320/375/390/430/1440px 的 20 组检查均无溢出或超 28px 字号，16 个正文内链均为 200；FAQ 可见答案与 JSON-LD 一致，运行错误为 0。见 [新页面证据](./adsense-remediation-pages-2026-10-23.json)。
- 四语首页的 16 组手机宽度检查无溢出，工具顶点均低于 300px。见 [首屏证据](./adsense-remediation-home-2026-10-23.json)。
- 原报告 Unknown 核对表：17 行、17 个唯一 ID，无遗漏或重复；`git diff --check` 通过。

代码整改未自动提交、推送、部署，也没有修改 AdSense 私有后台；未读取的后台事实继续保留待确认。没有在此宣布 Google 已通过审核，或把未执行的全量 73 项审计记作已完成。
