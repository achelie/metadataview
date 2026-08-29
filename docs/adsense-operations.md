# ViewExif AdSense 申请与运营检查表

这份清单适用于 `viewexif.com` 的申请阶段和获批后的日常运营。它不是“提交后就不管”的文档：每月留一份带日期的检查记录，Google 后台、生产页面和网络证据都以当时的实际状态为准。

## 申请前发布门槛

- [ ] 生产环境的每个 HTML 页面恰好包含一个 `google-adsense-account=ca-pub-7443237558968985` meta；没有 `adsbygoogle.js`、广告位、Auto Ads 或 Funding Choices 标签。
- [ ] `https://www.viewexif.com/ads.txt` 只包含 `google.com, pub-7443237558968985, DIRECT, f08c47fec0942fa0`，AdSense 后台显示 `Authorized`。
- [ ] About、Contact、Privacy、Terms 的英语、德语、法语和简体中文页面均可访问；`contact@viewexif.com` 已完成真实投递与回复测试。
- [ ] AdSense 账号、付款主体、域名控制权、Publisher ID、account meta 和 `ads.txt` 属于同一申请者；申请者已满 18 岁且没有重复账号。
- [ ] 运行 `pnpm test`、`pnpm build` 和法律页 Playwright 验收；保存命令、提交 SHA、时间和结果。
- [ ] 使用 `adsense-site-auditor` 重新输出完整 73 行 ADS-* 表。存在任何 Fail、未接受的 Blocker/High 或漏项时，不提交审核。

## Google 后台证据

1. 在 AdSense 的 Sites 中添加 `viewexif.com`，使用 account meta 或 `ads.txt` 验证所有权并提交审核。
2. 保存 Sites 状态、账号任务完成情况、Publisher ID 和 `ads.txt: Authorized` 的带日期截图。只有 Google 后台显示 `Ready` 才记录为 Ready；代码部署不能替代该状态。
3. 在 Privacy & messaging 使用 Google CMP 和 IAB TCF，启用英语、德语、法语、简体中文，并配置三按钮首层：Consent、Do not consent、Manage options。
4. 关闭 consent optimization 和关闭图标，采用常用广告技术提供商，自有用途选择 `None`，隐私政策 URL 填 `https://www.viewexif.com/privacy/`。保存发布配置截图。
5. 申请阶段不发布 CMP/广告标签。Ready 后准备启用广告时，验证首访三按钮、拒绝路径和撤回后重新选择均有效；隐私政策页面始终排除 AdSense 与 Funding Choices 标签。

参考：[站点验证](https://support.google.com/adsense/answer/12169212?hl=en)、[Google CMP 要求](https://support.google.com/adsense/answer/13554020?hl=en-GB)、[隐私政策 URL 要求](https://support.google.com/adsense/answer/10961370?hl=en)。

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
- PII 网络检查：在浏览器网络面板分别上传含文件名、邮箱、GPS 和自定义元数据的测试文件，完成解析、清理和导出。核对所有出站请求的 URL、查询参数、请求头和请求体均不含文件名、路径、哈希、邮箱、GPS 或提取出的元数据值。
- 合规页面：复查 About、Contact、Privacy、Terms、account meta、`ads.txt`、邮箱和政策外链；实际服务或第三方处理变化时，先更新披露再发布功能。

## Ready 后启用广告前

- 单独评审并最小化 CSP 放行范围；不提前加入宽泛的 Google 域名通配规则。
- 排除 About、Contact、Privacy、Terms 以及其他低内容/信任页面的广告加载。
- 在 EEA、英国、瑞士测试同意、拒绝、管理选项和撤回；在其他地区测试适用的消息与有限广告行为。
- 验证广告不会覆盖导航、下载控件、文件选择器或结果，也不会让内容看起来像广告。
- 重新运行完整 ADS-* 审计，重点把此前因“尚未投放广告”而标为 N/A 的广告位、CMP、内容比和标签项改为实测结论。通过前不启用广告。
