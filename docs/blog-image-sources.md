# 博客封面来源与文件台账

记录日期：2026-09-23。范围为当前 28 篇博客使用的 28 张本地 WebP 封面；它们也用于对应文章卡片。此次只补记录，全部图片沿用原文件，没有替换、重编码或重新裁剪。表中 SHA-256 对应源码中的 WebP 字节，不是构建后的文件名散列。

## 依据与证据等级

运营者在 2026-09-23 本次任务中明确确认：原有博客封面均来自 Pexels，并要求保留现有封面。以下 27 张旧封面的来源记录采用 `owner attested 2026-09-23`；这表示持有人来源声明，不代表审计者逐张独立确认了原图页面、下载过程或所有第三方权利。9 月 22 日新增封面另有作者、照片页和许可注释。

本轮检索当前内容、文档、脚本、可用临时材料和 Git 中包含 Pexels 的历史改动，恢复了截图文章的旧 coverCredit。因此 28 张中，2 张有具体 Pexels 原页/作者记录，26 张只有持有人来源声明，原页与作者记为“未恢复”；没有按画面猜作者、编造 URL 或进行无止境反向搜图。

通用许可依据为 [Pexels License][pexels-license]，本轮于 2026-09-23 阅读官方页面：允许在网站/博客中免费使用并修改照片，不强制署名；不得暗示人物或品牌背书，也不得用于许可禁止的转售、图库再分发等用途。本项目把照片作为文章配图，不把图库照片称为作者自摄、产品实测画面或品牌合作证明。具体使用仍应遵循许可及适用的第三方权利；来源声明不是独立法律认证。

可恢复的具体记录：

- `how-to-check-exif-data`：当前文章第 16–18 行记载 Athena Sandrini、Pexels #2962087、2026-09-22 下载和本地 1600 × 900 WebP 裁剪。本轮官方照片页显示该作者及许可入口。
- `do-screenshots-have-metadata`：`e8ae48b` 中的文章 `coverCredit` 记载 ready made、Pexels #3850268；该字段在 `61cde3a` 中被删除，当次没有替换图片。该图片自 `e8ae48b` 以来未变，当前 Git blob 与最初提交一致。本轮读取的官方页面也显示 ready made；检索工具使用的页面缓存时间不是下载日期，旧图实际下载日期没有恢复。

## 28 张封面逐项记录

| 关联文章 | 本地封面 | 字节 | SHA-256 | Pexels 原页 / 作者 | 许可 | 记录依据 |
| --- | --- | ---: | --- | --- | --- | --- |
| [do-screenshots-have-metadata](../src/content/blog/do-screenshots-have-metadata.md) | [WebP](../src/assets/blog/do-screenshots-have-metadata.webp) | 169054 | `d9ab3d832fc685ba6c3982b87500d4652752ca3437269bb09ff7537d00ad945d` | [3850268](https://www.pexels.com/photo/crop-person-touching-smartphone-screen-while-using-application-3850268/) / ready made | [Pexels License][pexels-license] | 历史 e8ae48b coverCredit；该封面 Git blob 沿用至今；本轮查看官方页；owner attested 2026-09-23 |
| [does-discord-remove-exif-data](../src/content/blog/does-discord-remove-exif-data.md) | [WebP](../src/assets/blog/does-discord-remove-exif-data.webp) | 49954 | `2ee788dd3a657dca569a3dbea438cc64330bde44e870f1602e8c1a92abe29913` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [does-gmail-remove-exif-data](../src/content/blog/does-gmail-remove-exif-data.md) | [WebP](../src/assets/blog/does-gmail-remove-exif-data.webp) | 21490 | `b674c56f6aaa54efe2088c774b3fa0c26e60e144f6aa358ad8cfed006d852dcf` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [does-instagram-remove-exif-data](../src/content/blog/does-instagram-remove-exif-data.md) | [WebP](../src/assets/blog/does-instagram-remove-exif-data.webp) | 49638 | `d3c5c631b143136bb4689546ab2c12f66885612c2ab2b1524fbc352c173100ca` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [does-reddit-remove-exif-data](../src/content/blog/does-reddit-remove-exif-data.md) | [WebP](../src/assets/blog/does-reddit-remove-exif-data.webp) | 51278 | `568f658156a6860fcc26ed3531460914c40ac8134cfd32df5999442c00242e38` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [does-telegram-remove-exif-data](../src/content/blog/does-telegram-remove-exif-data.md) | [WebP](../src/assets/blog/does-telegram-remove-exif-data.webp) | 137418 | `04ee996247bb6bde970a4c376f884f75744ff37ca3af111638b74037bae2ab87` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [does-whatsapp-remove-exif-data](../src/content/blog/does-whatsapp-remove-exif-data.md) | [WebP](../src/assets/blog/does-whatsapp-remove-exif-data.webp) | 108518 | `6860c74400b953e4ccdcb2b0c65f4ea81f891f69c2c534b138b1f600febf5b64` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [exif-metadata-definition-and-how-to-view](../src/content/blog/exif-metadata-definition-and-how-to-view.md) | [WebP](../src/assets/blog/exif-metadata-definition-and-how-to-view.webp) | 80988 | `d869a9f3865b1fffebfb3395391ad2fd1cb2d19cee9baf1584a5ea4b62b77230` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [exif-vs-metadata](../src/content/blog/exif-vs-metadata.md) | [WebP](../src/assets/blog/exif-vs-metadata.webp) | 48450 | `fabd03a61eb364b2895fb1d1320b574e6b109ce1c29b71251993b4cc835710d9` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [how-to-check-exif-data](../src/content/blog/how-to-check-exif-data.md) | [WebP](../src/assets/blog/how-to-check-exif-data.webp) | 89572 | `208ab5af116555e3f2bc2606975880ea1fa35e1a1e9c521e4d8809c33d4aae0a` | [2962087](https://www.pexels.com/photo/turned-on-laptop-computer-2962087/) / Athena Sandrini | [Pexels License][pexels-license] | 当前文章来源注释；下载日 2026-09-22；本轮官方照片页核对；源码来源已记录 |
| [how-to-check-metadata-of-an-image](../src/content/blog/how-to-check-metadata-of-an-image.md) | [WebP](../src/assets/blog/how-to-check-metadata-of-an-image.webp) | 85634 | `48c773114c41b541e73d4da27b23c0a2e8d5d4d2110a823e86b16805e0415008` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [how-to-find-camera-settings-from-a-photo](../src/content/blog/how-to-find-camera-settings-from-a-photo.md) | [WebP](../src/assets/blog/how-to-find-camera-settings-from-a-photo.webp) | 135382 | `53d46cc49917aa82804f2628c2a706edce3ee09264b7c93be9f5e2c6793de309` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [how-to-find-where-a-photo-was-taken](../src/content/blog/how-to-find-where-a-photo-was-taken.md) | [WebP](../src/assets/blog/how-to-find-where-a-photo-was-taken.webp) | 345076 | `766257d3726609eafbff06329eda562894fcc1235dc80e8d94b9fb1ac965cebb` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [how-to-remove-gps-data-from-photos-before-sharing](../src/content/blog/how-to-remove-gps-data-from-photos-before-sharing.md) | [WebP](../src/assets/blog/how-to-remove-gps-data-from-photos-before-sharing.webp) | 439342 | `9b477394f5e04b4884b55209689de86f22d777f701fc53819f6a5fb8ee75e151` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [how-to-remove-metadata-from-a-photo](../src/content/blog/how-to-remove-metadata-from-a-photo.md) | [WebP](../src/assets/blog/how-to-remove-metadata-from-a-photo.webp) | 53062 | `1e3aad39dcf1d8599c35a65bf2897ac51c27f5c139aab82a686d2fb0caaa9640` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [how-to-tell-when-a-photo-was-taken](../src/content/blog/how-to-tell-when-a-photo-was-taken.md) | [WebP](../src/assets/blog/how-to-tell-when-a-photo-was-taken.webp) | 160696 | `1cd243fdbd7298eb419f913a47526226be80adfd96f671fef4d9d65babf0a7c9` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [how-to-view-exif-data-on-android](../src/content/blog/how-to-view-exif-data-on-android.md) | [WebP](../src/assets/blog/how-to-view-exif-data-on-android.webp) | 63284 | `316b836e9635a2f54f56e83a1e2eebe76ecf91f79b7067c0d713ea4077434fa2` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [how-to-view-exif-data-on-iphone](../src/content/blog/how-to-view-exif-data-on-iphone.md) | [WebP](../src/assets/blog/how-to-view-exif-data-on-iphone.webp) | 101252 | `2450aea8ab7b1f0e59774772444050d0f406d800db8fed528ed747d9c2a65028` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [how-to-view-exif-data-on-windows-11](../src/content/blog/how-to-view-exif-data-on-windows-11.md) | [WebP](../src/assets/blog/how-to-view-exif-data-on-windows-11.webp) | 53138 | `be00ace989dde966b3db23ca18fb591b869953984ead6502c20a3175a4691bc3` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [how-to-view-pdf-metadata](../src/content/blog/how-to-view-pdf-metadata.md) | [WebP](../src/assets/blog/how-to-view-pdf-metadata.webp) | 48158 | `b238170862d5065de2fe5953343a7769e4b9509c6411b8b9f54b7507785d5743` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [how-to-view-photo-metadata-on-mac](../src/content/blog/how-to-view-photo-metadata-on-mac.md) | [WebP](../src/assets/blog/how-to-view-photo-metadata-on-mac.webp) | 98470 | `988ec26ed45623b71a80c2facca32e89d4c5e814e5440a641d1da55bd44bbb28` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [remove-metadata-from-mp3](../src/content/blog/remove-metadata-from-mp3.md) | [WebP](../src/assets/blog/remove-metadata-from-mp3.webp) | 55082 | `2b67ca3556ad640464c63143acc43500036ef35499af2f9455e2302b5b8d57c0` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [remove-metadata-from-mp4](../src/content/blog/remove-metadata-from-mp4.md) | [WebP](../src/assets/blog/remove-metadata-from-mp4.webp) | 82478 | `8dddcfa52379b26f17c83b1a452f27e21a7b3de4bcca1872b4456994d46e93be` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [remove-metadata-from-pdf](../src/content/blog/remove-metadata-from-pdf.md) | [WebP](../src/assets/blog/remove-metadata-from-pdf.webp) | 108992 | `b678998cb23c4c26a875784b14544f96e98df93691f20fe2cf9f2377051917ab` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [remove-metadata-from-word-document](../src/content/blog/remove-metadata-from-word-document.md) | [WebP](../src/assets/blog/remove-metadata-from-word-document.webp) | 161054 | `3b4a06128da4e2d283d6b84bb994a666c6fd8c8c9f8316381ad511e57e8eefea` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [what-is-a-metadata-strategy](../src/content/blog/what-is-a-metadata-strategy.md) | [WebP](../src/assets/blog/what-is-a-metadata-strategy.webp) | 54170 | `d281e0f3835765b3989250b6ca515f0c40d26e0f99d441e49c901ce199cb4f72` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [what-is-exif-data](../src/content/blog/what-is-exif-data.md) | [WebP](../src/assets/blog/what-is-exif-data.webp) | 53536 | `7c7ccb93aef1b68f848fc6b19e8119b8baef4d3e26aac64ed6017acbe138c0fa` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |
| [what-is-xmp-metadata](../src/content/blog/what-is-xmp-metadata.md) | [WebP](../src/assets/blog/what-is-xmp-metadata.webp) | 69612 | `053ffcbdd3442c9b7bdb4f6abd991d0e20799ed260f8a58cd6b0b9c84175674b` | 原页未恢复 / 作者未恢复 | [Pexels License][pexels-license] | owner attested 2026-09-23 |

## 后续维护

- 新增封面时，在文章源码注释与本台账保存原照片页、作者、下载日期、许可链接、处理方式和文件 SHA-256。构建生成的带散列文件名可以变化，不替代源文件哈希。
- 如果运营者以后找到旧图的下载记录或原页，就补充对应行及依据日期；不要为了补齐表格猜来源，也不因暂未恢复 URL 自动替换已确认来自 Pexels 的图片。
- 图片替换或重编码时更新哈希、来源与日期；保留历史记录，使旧审核使用的字节仍可追溯。此表不覆盖演示文件，演示样例另见 [public/samples/SOURCES.md](../public/samples/SOURCES.md)。

[pexels-license]: https://www.pexels.com/license/
