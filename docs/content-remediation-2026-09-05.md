# ViewExif 原链接内容整改记录

日期：2026-09-05。范围：99 个既有可索引 URL；截图保护清单 25 个。没有新增公开文章、实验报告或演示样本，没有删除、合并、重定向或 noindex 页面。以下是代码与编辑审阅记录，不是 Google 批准证据。

## 验收依据

- `docs/content-url-baseline.json`：修改前 99 页 canonical、title、H1、robots 和站内入口；打包 CSS 哈希不属于页面入口。
- `node scripts/check-content-preservation.mjs`：原 URL 与入口保护。
- `tests/e2e/content-preservation.spec.ts`：99 页 × 1440/390/239px，HTTP、H1、canonical、溢出和脚本异常；截图在 `output/playwright/`，不发布到网站。
- 清理事实：`src/components/MetadataRemovalWorkbench.tsx`、`src/workers/metadata-removal.worker.ts`、`src/lib/metadata-removal/policy.ts`；风险评分：`src/lib/privacy/create-privacy-report.ts`；C2PA：`src/lib/c2pa/formats.ts`、`verify.ts`。
- 所有 publishedAt 保留；26 篇正文实质修改，updatedAt 改为本次日期。作者 ViewExif 链接 About。
- 法律页仅修正 Privacy 把所有清理都称为 Canvas 的旧描述。

## 逐页记录

本地通过指基线与三视口页面验收，不表示外部来源全部可访问或 Google 认可。工具条目按该路由格式配置核对；共用解释不替代各格式原有正文。生产状态另见发布验收。

| URL | 截图保护 | 具体问题与修改 | 依据 | 验收 |
| --- | --- | --- | --- | --- |
| / | 是 | 首屏工具保留；紧接工具补结果解读；增加地点、日期、截图、清理指南入口，非英语标明指南为英语。 | HomePage、ReadingRoutes | 本地通过 |
| /about/ | — | 核对个人运营、邮箱及功能；无需扩写，保持原内容。 | ContentPage、site identity | 本地通过 |
| /audio-metadata-remover/ | 是 | 音频：标签与声流分开，封面/声音仍可识别人；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /audio-metadata-viewer/ | 是 | 音频标题/艺人与采样率/声道；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /blog/ | 是 | 增加按任务阅读入口，保持卡片和分页。 | blog/index、blog/page/[page] | 本地通过 |
| /blog/do-screenshots-have-metadata/ | 是 | 补足问题专属判断：Which screenshot details travel with the file?；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/does-discord-remove-exif-data/ | — | 补足问题专属判断：How much can the historical reports tell you?；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/does-gmail-remove-exif-data/ | 是 | 补足问题专属判断：Attachment privacy and message privacy are separate；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/does-instagram-remove-exif-data/ | 是 | 补足问题专属判断：What the public-copy claim does and does not cover；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/does-reddit-remove-exif-data/ | — | 补足问题专属判断：Check the destination behind a Reddit preview；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/does-telegram-remove-exif-data/ | — | 补足问题专属判断：Distinguish a quality option from a metadata choice；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/does-whatsapp-remove-exif-data/ | 是 | 补足问题专属判断：Choose the send mode for the information you need to preserve；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/exif-metadata-definition-and-how-to-view/ | — | 补足问题专属判断：A short vocabulary for reading the report；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/exif-vs-metadata/ | — | 补足问题专属判断：One concept can exist in more than one family；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/how-to-check-metadata-of-an-image/ | 是 | 补足问题专属判断：A report that is empty, incomplete or contradictory；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/how-to-find-camera-settings-from-a-photo/ | — | 补足问题专属判断：Compare equivalent settings before treating them as a mismatch；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/how-to-find-where-a-photo-was-taken/ | 是 | 补足问题专属判断：How do you avoid putting the map pin in the wrong place?；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/how-to-remove-gps-data-from-photos-before-sharing/ | — | 补足问题专属判断：GPS-only removal or broader privacy cleanup?；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/how-to-remove-metadata-from-a-photo/ | — | 补足问题专属判断：Read the cleanup result before choosing the attachment；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/how-to-tell-when-a-photo-was-taken/ | 是 | 补足问题专属判断：How do you resolve conflicting time fields?；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/how-to-view-exif-data-on-android/ | — | 补足问题专属判断：When Gallery, Google Photos and the file disagree；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/how-to-view-exif-data-on-iphone/ | 是 | 补足问题专属判断：Which file should you choose in the browser?；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/how-to-view-exif-data-on-windows-11/ | — | 补足问题专属判断：Do not confuse the General and Details tabs；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/how-to-view-pdf-metadata/ | — | 补足问题专属判断：Read conflicting PDF properties without choosing a winner；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/how-to-view-photo-metadata-on-mac/ | — | 补足问题专属判断：Keep library edits separate from the exported file；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/page/2/ | — | 保留分页、文章顺序与全部入口，不新建分类页。 | blog/index、blog/page/[page] | 本地通过 |
| /blog/page/3/ | — | 保留分页、文章顺序与全部入口，不新建分类页。 | blog/index、blog/page/[page] | 本地通过 |
| /blog/page/4/ | — | 保留分页、文章顺序与全部入口，不新建分类页。 | blog/index、blog/page/[page] | 本地通过 |
| /blog/page/5/ | — | 保留分页、文章顺序与全部入口，不新建分类页。 | blog/index、blog/page/[page] | 本地通过 |
| /blog/remove-metadata-from-mp3/ | — | 补足问题专属判断：Choose privacy cleanup or music-library editing；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/remove-metadata-from-mp4/ | — | 补足问题专属判断：Single location tags and timed telemetry need different checks；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/remove-metadata-from-pdf/ | — | 补足问题专属判断：Define what a successful PDF cleanup covers；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/remove-metadata-from-word-document/ | — | 补足问题专属判断：Use the right order before the final send；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/what-is-exif-data/ | — | 补足问题专属判断：Why orientation and color are different from a private note；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /blog/what-is-xmp-metadata/ | — | 补足问题专属判断：Which XMP copy are you changing?；正文实质编辑并保留原主题。 | 正文来源、字段语义及对应工具实现 | 本地通过 |
| /c2pa-viewer/ | 是 | 区分签名绑定、信任未检查、无凭证与失败；保留20格式范围。 | c2pa/formats.ts、verify.ts | 本地通过 |
| /contact/ | — | 核对个人运营、邮箱及功能；无需扩写，保持原内容。 | ContentPage、site identity | 本地通过 |
| /de/ | 是 | 首屏工具保留；紧接工具补结果解读；增加地点、日期、截图、清理指南入口，非英语标明指南为英语。 | HomePage、ReadingRoutes | 本地通过 |
| /de/about/ | — | 核对个人运营、邮箱及功能；无需扩写，保持原内容。 | ContentPage、site identity | 本地通过 |
| /de/audio-metadata-remover/ | 是 | 音频：标签与声流分开，封面/声音仍可识别人；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /de/audio-metadata-viewer/ | — | 音频标题/艺人与采样率/声道；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /de/c2pa-viewer/ | — | 区分签名绑定、信任未检查、无凭证与失败；保留20格式范围。 | c2pa/formats.ts、verify.ts | 本地通过 |
| /de/contact/ | — | 核对个人运营、邮箱及功能；无需扩写，保持原内容。 | ContentPage、site identity | 本地通过 |
| /de/document-metadata-remover/ | — | 文档：Info/XMP与Office属性，正文/批注不脱敏；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /de/document-metadata-viewer/ | — | PDF Info/XMP与Office属性；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /de/image-metadata-remover/ | — | 图片：方向/色彩与可写字段；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /de/image-metadata-viewer/ | — | EXIF/XMP/IPTC与必要色彩方向；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /de/image-privacy-checker/ | — | 补充评分阈值、评分不是概率、扫描覆盖与画面排除。 | create-privacy-report.ts；PrivacyCheckerSeo | 本地通过 |
| /de/metadata-remover/ | — | 通用：维持格式选择，不承诺清空所有字段；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /de/metadata-viewer/ | — | 完整字段与摘要；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /de/privacy/ | — | 修正格式专用清理与Canvas工作流边界。 | ContentPage、site identity | 本地通过 |
| /de/terms/ | — | 核对个人运营、邮箱及功能；无需扩写，保持原内容。 | ContentPage、site identity | 本地通过 |
| /de/video-metadata-remover/ | — | 视频：容器时间、字幕与媒体轨道保留；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /de/video-metadata-viewer/ | — | 视频容器日期与播放结构；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /document-metadata-remover/ | — | 文档：Info/XMP与Office属性，正文/批注不脱敏；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /document-metadata-viewer/ | 是 | PDF Info/XMP与Office属性；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /fr/ | 是 | 首屏工具保留；紧接工具补结果解读；增加地点、日期、截图、清理指南入口，非英语标明指南为英语。 | HomePage、ReadingRoutes | 本地通过 |
| /fr/about/ | — | 核对个人运营、邮箱及功能；无需扩写，保持原内容。 | ContentPage、site identity | 本地通过 |
| /fr/audio-metadata-remover/ | — | 音频：标签与声流分开，封面/声音仍可识别人；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /fr/audio-metadata-viewer/ | — | 音频标题/艺人与采样率/声道；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /fr/c2pa-viewer/ | — | 区分签名绑定、信任未检查、无凭证与失败；保留20格式范围。 | c2pa/formats.ts、verify.ts | 本地通过 |
| /fr/contact/ | — | 核对个人运营、邮箱及功能；无需扩写，保持原内容。 | ContentPage、site identity | 本地通过 |
| /fr/document-metadata-remover/ | — | 文档：Info/XMP与Office属性，正文/批注不脱敏；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /fr/document-metadata-viewer/ | 是 | PDF Info/XMP与Office属性；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /fr/image-metadata-remover/ | — | 图片：方向/色彩与可写字段；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /fr/image-metadata-viewer/ | — | EXIF/XMP/IPTC与必要色彩方向；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /fr/image-privacy-checker/ | — | 补充评分阈值、评分不是概率、扫描覆盖与画面排除。 | create-privacy-report.ts；PrivacyCheckerSeo | 本地通过 |
| /fr/metadata-remover/ | — | 通用：维持格式选择，不承诺清空所有字段；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /fr/metadata-viewer/ | — | 完整字段与摘要；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /fr/privacy/ | — | 修正格式专用清理与Canvas工作流边界。 | ContentPage、site identity | 本地通过 |
| /fr/terms/ | — | 核对个人运营、邮箱及功能；无需扩写，保持原内容。 | ContentPage、site identity | 本地通过 |
| /fr/video-metadata-remover/ | — | 视频：容器时间、字幕与媒体轨道保留；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /fr/video-metadata-viewer/ | — | 视频容器日期与播放结构；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /image-metadata-remover/ | 是 | 图片：方向/色彩与可写字段；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /image-metadata-viewer/ | 是 | EXIF/XMP/IPTC与必要色彩方向；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /image-privacy-checker/ | 是 | 补充评分阈值、评分不是概率、扫描覆盖与画面排除。 | create-privacy-report.ts；PrivacyCheckerSeo | 本地通过 |
| /metadata-remover/ | 是 | 通用：维持格式选择，不承诺清空所有字段；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /metadata-viewer/ | — | 完整字段与摘要；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /privacy/ | — | 修正格式专用清理与Canvas工作流边界。 | ContentPage、site identity | 本地通过 |
| /terms/ | — | 核对个人运营、邮箱及功能；无需扩写，保持原内容。 | ContentPage、site identity | 本地通过 |
| /video-metadata-remover/ | 是 | 视频：容器时间、字幕与媒体轨道保留；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /video-metadata-viewer/ | 是 | 视频容器日期与播放结构；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /zh-cn/ | 是 | 首屏工具保留；紧接工具补结果解读；增加地点、日期、截图、清理指南入口，非英语标明指南为英语。 | HomePage、ReadingRoutes | 本地通过 |
| /zh-cn/about/ | — | 核对个人运营、邮箱及功能；无需扩写，保持原内容。 | ContentPage、site identity | 本地通过 |
| /zh-cn/audio-metadata-remover/ | — | 音频：标签与声流分开，封面/声音仍可识别人；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /zh-cn/audio-metadata-viewer/ | — | 音频标题/艺人与采样率/声道；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /zh-cn/c2pa-viewer/ | — | 区分签名绑定、信任未检查、无凭证与失败；保留20格式范围。 | c2pa/formats.ts、verify.ts | 本地通过 |
| /zh-cn/contact/ | — | 核对个人运营、邮箱及功能；无需扩写，保持原内容。 | ContentPage、site identity | 本地通过 |
| /zh-cn/document-metadata-remover/ | — | 文档：Info/XMP与Office属性，正文/批注不脱敏；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /zh-cn/document-metadata-viewer/ | — | PDF Info/XMP与Office属性；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /zh-cn/image-metadata-remover/ | — | 图片：方向/色彩与可写字段；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /zh-cn/image-metadata-viewer/ | — | EXIF/XMP/IPTC与必要色彩方向；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /zh-cn/image-privacy-checker/ | — | 补充评分阈值、评分不是概率、扫描覆盖与画面排除。 | create-privacy-report.ts；PrivacyCheckerSeo | 本地通过 |
| /zh-cn/metadata-remover/ | — | 通用：维持格式选择，不承诺清空所有字段；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /zh-cn/metadata-viewer/ | — | 完整字段与摘要；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |
| /zh-cn/privacy/ | — | 修正格式专用清理与Canvas工作流边界。 | ContentPage、site identity | 本地通过 |
| /zh-cn/terms/ | — | 核对个人运营、邮箱及功能；无需扩写，保持原内容。 | ContentPage、site identity | 本地通过 |
| /zh-cn/video-metadata-remover/ | — | 视频：容器时间、字幕与媒体轨道保留；新增 Removed/Preserved/Residual 和不完整结果操作说明。 | tools.ts、metadata-removal/policy.ts、worker | 本地通过 |
| /zh-cn/video-metadata-viewer/ | — | 视频容器日期与播放结构；新增缺失、不完整、存在但可编辑的区别。 | tools.ts、metadata-report及对应解析器 | 本地通过 |

## 来源边界与剩余步骤

外链抓取见 `docs/editorial-link-check-2026-09-05.json`。403、超时不能当作来源不存在，也不能当作已经核验。ExifTool 三条引用改为官方 GitHub 文档；Google Photos、Gmail、Telegram 官方说明通过独立网页读取补核。Reddit 只作历史用户场景，不作为现行平台隐私保证。没有增加或声称本站实测。

用户提供的 2026-09-03 截图为低价值内容拒绝；本次发布不会清除该事实。重新提交前核对后台是否允许申请，并核实历史 CMP 缺口。没有规定文章数、字数、流量或等待天数门槛。所有广告仍关闭。
