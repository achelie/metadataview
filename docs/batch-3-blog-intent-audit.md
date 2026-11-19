# ViewExif 英文 how-to 搜索意图盘点

2026-11-19，改动前。逐个读取线上 sitemap 中的 39 个博客 URL，包括 33 篇有文章正文的页面。下表收录全部 33 篇，覆盖以操作为主的文章，以及含有操作步骤的定义、故障排查和平台问答。Title 和 H1 取自实际 HTML。「正文主词」是按读者要完成的任务归纳的英文短语，不代表实测排名或搜索量。

## 需要选主页面的重叠组

| 重叠程度 | 文章 | 共同任务与边界 |
|---|---|---|
| 高 | check EXIF data ↔ check metadata of an image | 两篇都从选择照片开始，介绍浏览器、系统查看器、常用字段及缺失原因。前者集中在相机 EXIF，后者还覆盖 XMP、IPTC 等图像元数据。 |
| 高 | EXIF metadata definition and how to view it ↔ what is EXIF data | 两篇都解释 EXIF、列出字段并教读者查看。定义文章的浏览器段落还与两篇通用检查文重合。EXIF vs metadata 更侧重术语边界。 |
| 中 | remove metadata from a photo ↔ remove GPS data from photos before sharing | 两篇都涉及分享前生成副本并复检。GPS 文的终点是确认副本没有位置标签，通用清理文还涉及身份等其他字段。 |
| 局部 | tell when a photo was taken ↔ EXIF time zone | 两篇都讲 DateTimeOriginal 和时间差异。前者找日期，后者解决偏移和跨日换算。 |
| 局部 | 两篇通用检查文 ↔ 四篇系统指南 ↔ 相机设置、拍摄地点、拍摄日期三篇 | 都要打开照片并读字段。系统指南依赖各自界面，专题指南各回答一个具体问题。 |
| 局部 | 各清理文 ↔ verify metadata removal | 都有复检步骤。专门的核验文从已有输出副本开始，解释删除、保留、残留和未验证状态。 |
| 相邻 | 查看 PDF ↔ 清理 PDF；六篇平台问答；C2PA ↔ EXIF | 查看 PDF 与清理 PDF 的交付结果不同。平台文共享比较副本的方法，但发送路径不同。C2PA 验证签名，和读取可编辑 EXIF 的目标不同。 |

以上判断来自页面内容。主页面归属留待站长决定。

## 文章清单

| 文章 URL | 实际 Title | 实际 H1 | 正文主词 | 意图组与操作 |
|---|---|---|---|---|
| /blog/how-to-check-exif-data/ | How to Check EXIF Data: Camera Settings, Dates & GPS \| ViewExif | How to Check EXIF Data in a Photo | check EXIF data in a photo | 查看照片。读相机、曝光、拍摄时间和 GPS 的字段值。 |
| /blog/how-to-check-metadata-of-an-image/ | How to Check Metadata of an Image: EXIF, GPS, and More \| ViewExif | How to Check Metadata of an Image | check image metadata | 查看照片。检查整个图像文件，范围包括 EXIF、XMP、IPTC 和文件属性。 |
| /blog/exif-metadata-definition-and-how-to-view/ | EXIF Metadata Definition and How to View It \| ViewExif | EXIF Metadata Definition and How to View It | EXIF metadata definition and how to view it | 查看照片／概念。先解释 EXIF，再用浏览器找到实例字段。 |
| /blog/what-is-exif-data/ | What Is EXIF Data? GPS, Camera Info & Photo Metadata Explained \| ViewExif | What Is EXIF Data? | what is EXIF data | 概念。解释相机写入哪些数据，以及如何理解和查看它们。 |
| /blog/exif-vs-metadata/ | EXIF vs Metadata: What Is the Difference? \| ViewExif | EXIF vs Metadata: What Is the Difference? | EXIF vs metadata | 概念。区分 EXIF、其他嵌入字段和文件系统属性。 |
| /blog/what-is-xmp-metadata/ | What Is XMP Metadata? Sidecars, Editing Data, and Privacy \| ViewExif | What Is XMP Metadata? | what is XMP metadata | 概念。定位嵌入或随附的 XMP，理解两份记录的差异。 |
| /blog/how-to-view-exif-data-on-iphone/ | How to View EXIF Data on iPhone: Photos, GPS & Camera Info \| ViewExif | How to View EXIF Data on iPhone | view EXIF data on iPhone | 设备查看。在 Apple Photos 打开信息面板，再查原文件。 |
| /blog/how-to-view-exif-data-on-android/ | How to View EXIF Data on Android: Photos, GPS, and Camera Info \| ViewExif | How to View EXIF Data on Android | view EXIF data on Android | 设备查看。在 Google Photos 或 Samsung Gallery 查看详情。 |
| /blog/how-to-view-exif-data-on-windows-11/ | How to View EXIF Data on Windows 11: Camera Info & GPS \| ViewExif | How to View EXIF Data on Windows 11 | view EXIF data on Windows 11 | 设备查看。使用资源管理器的属性、详细信息和 Microsoft Photos。 |
| /blog/how-to-view-photo-metadata-on-mac/ | How to View Photo Metadata on Mac: EXIF, GPS & Dates \| ViewExif | How to View Photo Metadata on Mac | view photo metadata on Mac | 设备查看。在 Finder、Preview 和 Photos 中选择合适的视图。 |
| /blog/how-to-find-camera-settings-from-a-photo/ | How to Find Camera Settings From a Photo: EXIF Guide \| ViewExif | How to Find Camera Settings From a Photo | find camera settings from a photo | 单字段查看。查看 ISO、快门、光圈和镜头。 |
| /blog/how-to-find-where-a-photo-was-taken/ | How to Find Where a Photo Was Taken Using EXIF Data \| ViewExif | How to Find Where a Photo Was Taken | find where a photo was taken | 单字段查看。提取 GPS 坐标，并判断文件是否记录了位置。 |
| /blog/how-to-tell-when-a-photo-was-taken/ | How to Tell When a Photo Was Taken Using EXIF Dates \| ViewExif | How to Tell When a Photo Was Taken | tell when a photo was taken | 单字段查看。用拍摄日期与文件日期区分原件和副本。 |
| /blog/exif-timezone-offsettimeoriginal/ | EXIF Time Zones and OffsetTimeOriginal: Fix Photo Date Confusion \| ViewExif | EXIF Time Zones: Read OffsetTimeOriginal Without Guessing | EXIF time zone and OffsetTimeOriginal | 单字段查看。用时区偏移解释拍摄时间，识别缺失或冲突。 |
| /blog/exif-orientation-values/ | EXIF Orientation Values 1–8: Rotation, Mirroring, and Safe Cleanup \| ViewExif | EXIF Orientation Values: Why a Photo Turns Sideways | EXIF orientation values | 单字段查看。从方向标签判断旋转、镜像和显示尺寸。 |
| /blog/how-to-remove-metadata-from-a-photo/ | How to Remove Metadata From a Photo Before Sharing \| ViewExif | How to Remove Metadata From a Photo | remove metadata from a photo | 照片清理。生成清理副本，检查移除和保留的字段。 |
| /blog/how-to-remove-gps-data-from-photos-before-sharing/ | How to Remove GPS Data from Photos Before Sharing \| ViewExif | How to Remove GPS Data from Photos Before Sharing | remove GPS data from photos before sharing | 照片清理。分享前移除地理位置，检查输出中是否仍有坐标。 |
| /blog/verify-metadata-removal/ | Verify Metadata Removal: Check the Actual Cleaned Copy \| ViewExif | How to Verify Metadata Removal Before Sharing | verify metadata removal | 清理核验。检查清理状态、残留值、文件可用性和收据。 |
| /blog/how-to-view-pdf-metadata/ | How to View PDF Metadata: Author, Dates, and Software \| ViewExif | How to View PDF Metadata | view PDF metadata | 文档属性。查看作者和日期，分辨 PDF Info 与 XMP。 |
| /blog/remove-metadata-from-pdf/ | How to Remove Metadata From PDF Safely \| ViewExif | How to Remove Metadata From PDF | remove metadata from PDF | 文档属性。清理 PDF 属性并核对新副本和签名影响。 |
| /blog/remove-metadata-from-word-document/ | How to Remove Metadata From a Word Document \| ViewExif | How to Remove Metadata From a Word Document | remove metadata from a Word document | 文档属性。检查 DOCX 属性，并区分批注、修订和正文。 |
| /blog/remove-metadata-from-mp3/ | How to Remove Metadata From MP3 Without Losing Audio Quality \| ViewExif | How to Remove Metadata From MP3 | remove metadata from MP3 | 音视频清理。清除 ID3 描述标签，核对音频和封面。 |
| /blog/remove-metadata-from-mp4/ | How to Remove Metadata From MP4 Without Re-encoding \| ViewExif | How to Remove Metadata From MP4 | remove metadata from MP4 | 音视频清理。清除视频容器标签，区分定位标签与定时遥测。 |
| /blog/how-to-read-c2pa-results/ | Read C2PA Results: Valid, Missing, Invalid and Trust Checks \| ViewExif | How to Read C2PA Results Without Overclaiming | read C2PA verification results | 来源验证。分别解读签名、文件绑定及未找到凭证。 |
| /blog/why-metadata-is-missing/ | Why Metadata Is Missing: Empty Fields, Hidden Tags and Scan Limits \| ViewExif | Why Metadata Is Missing and What to Check Next | why metadata is missing | 缺失排查。比较源文件与副本，区分缺字段、读失败和外部目录记录。 |
| /blog/what-is-a-metadata-strategy/ | What Is a Metadata Strategy? A Practical Guide for Your Files \| ViewExif | What Is a Metadata Strategy? | create a metadata strategy | 整理流程。制定字段、命名、维护和分享规则。 |
| /blog/do-screenshots-have-metadata/ | Do Screenshots Have Metadata? What iPhone, Android, Windows, and Mac Save \| ViewExif | Do Screenshots Have Metadata? What iPhone, Android, Windows, and Mac Save | do screenshots have metadata | 分享副本。检查截图自身的标签和画面中可见的位置信息。 |
| /blog/does-discord-remove-exif-data/ | Does Discord Remove EXIF Data? Photos, Videos, and GPS Explained \| ViewExif | Does Discord Remove EXIF Data? Photos, Videos, and GPS Explained | does discord remove EXIF data | 分享副本。比较下载图片与视频，核查实际传输的文件。 |
| /blog/does-gmail-remove-exif-data/ | Does Gmail Remove EXIF Data? What Photo Attachments Keep \| ViewExif | Does Gmail Remove EXIF Data? What Photo Attachments Keep | does gmail remove EXIF data | 分享副本。区分附件、内嵌图片和下载副本。 |
| /blog/does-instagram-remove-exif-data/ | Does Instagram Remove EXIF Data? What Photos Still Reveal \| ViewExif | Does Instagram Remove EXIF Data? What Photos Still Reveal | does instagram remove EXIF data | 分享副本。检查公开下载副本，并区分上传原件与平台副本。 |
| /blog/does-reddit-remove-exif-data/ | Does Reddit Remove EXIF Data? Photos, GPS, and Upload Privacy \| ViewExif | Does Reddit Remove EXIF Data? Photos, GPS, and Upload Privacy | does reddit remove EXIF data | 分享副本。区分原生上传、外部图像链接和预览图。 |
| /blog/does-telegram-remove-exif-data/ | Does Telegram Remove EXIF Data? Photos, Files, and GPS Explained \| ViewExif | Does Telegram Remove EXIF Data? Photos, Files, and GPS Explained | does telegram remove EXIF data | 分享副本。对比发送照片和发送文件两种路径。 |
| /blog/does-whatsapp-remove-exif-data/ | Does WhatsApp Remove EXIF Data? Photos, Dates, and GPS Explained \| ViewExif | Does WhatsApp Remove EXIF Data? Photos, Dates, and GPS Explained | does whatsapp remove EXIF data | 分享副本。比较普通照片、高清照片及文档发送模式。 |

## 三篇重点文章的改前读数

| 文章 | 正文编号步骤 | 正文工具与链接 |
|---|---|---|
| how-to-check-exif-data | 浏览器操作 4 步 | 已明确写出 ViewExif，Image Metadata Viewer 指向 /image-metadata-viewer/。 |
| exif-metadata-definition-and-how-to-view | 浏览器操作以段落呈现，缺少编号 | 已有 Image Metadata Viewer 工具名与目标链接。 |
| how-to-view-exif-data-on-iphone | Photos 查看 5 步，分享设置另有 4 步 | 已有 Image Metadata Viewer 工具名与目标链接。 |

## 三篇重点文章的构建验收

| 文章 | 本批处理 | 正文内链 |
|---|---|---|
| how-to-check-exif-data | 已满足，保留原有 4 个浏览器操作步骤。 | Image Metadata Viewer → /image-metadata-viewer/，1 条。 |
| exif-metadata-definition-and-how-to-view | 将原有浏览器说明整理为 3 个动作，依次选择原图、查看相机摘要、按字段名搜索；末次编辑日期同步为 2026-11-19。 | ViewExif’s Image Metadata Viewer → /image-metadata-viewer/，1 条。 |
| how-to-view-exif-data-on-iphone | 已满足，保留 Photos 查看 5 步和分享设置 4 步。 | Image Metadata Viewer → /image-metadata-viewer/，1 条。 |

链接数与步骤均取自渲染后的文章正文。三篇的 Title、H1 和 URL 与改前一致。
