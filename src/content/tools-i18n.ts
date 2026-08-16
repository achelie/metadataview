import { localizePath, type Locale } from '../i18n/core';
import { tools, type FormatGuide, type ToolConfig } from './tools';

export type ToolKey = 'metadata' | 'image' | 'document' | 'video' | 'audio' | 'privacy' | 'remover' | 'imageRemover' | 'videoRemover' | 'audioRemover' | 'documentRemover' | 'c2pa';

const routes: Record<ToolKey, string> = {
  metadata: '/metadata-viewer/', image: '/image-metadata-viewer/', document: '/document-metadata-viewer/', video: '/video-metadata-viewer/', audio: '/audio-metadata-viewer/',
  privacy: '/image-privacy-checker/', remover: '/metadata-remover/', imageRemover: '/image-metadata-remover/', videoRemover: '/video-metadata-remover/',
  audioRemover: '/audio-metadata-remover/', documentRemover: '/document-metadata-remover/', c2pa: '/c2pa-viewer/',
};

export const toolSlugs = Object.fromEntries(Object.entries(routes).map(([key, path]) => [path.split('/').filter(Boolean)[0], key])) as Record<string, ToolKey>;

interface ZhToolCopy {
  title: string; metaTitle: string; eyebrow: string; description: string; shortDescription: string;
  highlights: string[]; limitations: string[]; faqs: Array<{ question: string; answer: string }>;
}

const viewerFaqs = (name: string, formats: string, reads: string) => [
  { question: `文件会上传到服务器吗？`, answer: `不会。${name}在当前浏览器标签页里运行，本地解析器读取文件；文件、文件名、哈希、元数据和报告都不会提交到上传接口。` },
  { question: `支持哪些格式和字段？`, answer: `支持 ${formats}。工具会读取文件里已有的${reads}，并保留能安全显示的原生字段。` },
  { question: `为什么有些字段缺失或互相矛盾？`, answer: '不同设备和软件写入的字段并不统一，损坏的索引、旧标签或格式差异也会造成缺失与冲突。报告展示的是文件当前保存的内容。' },
  { question: `这些元数据能证明文件是真的吗？`, answer: '不能。作者、日期、位置、设备和软件标签都可以修改。把它们当成线索；需要检查签名来源时，再单独验证 C2PA 凭证。' },
  { question: `清除或刷新页面后会怎样？`, answer: '当前任务会停止，临时预览和内存里的报告会被释放。本站不会保存跨页面的文件历史。' },
];

const removerFaqs = (kind: string, formats: string, preserved: string) => [
  { question: '原文件会被上传或替换吗？', answer: '不会。清理和复检都在当前标签页进行，原文件始终不变；工具只会生成一个可下载的新副本。' },
  { question: `可以清理哪些${kind}格式？`, answer: `支持 ${formats}。工具先检查真实文件签名，再选择对应的清理引擎。` },
  { question: '内容会被重新编码吗？', answer: `不会故意转码。清理策略保留${preserved}，只处理可写的描述性元数据；结构检查失败时会阻止下载。` },
  { question: '为什么清理后还能看到部分字段？', answer: '尺寸、色彩、时长、页数或容器寻址等技术字段不能随便删除。复检会把保留项和残留项如实列出。' },
  { question: '清理后就完全匿名了吗？', answer: '不是。画面、声音、正文和输出文件名仍可能暴露人物、地点、账号或其他信息。这个工具只处理元数据。' },
];

const zhCopy: Record<ToolKey, ZhToolCopy> = {
  metadata: {
    title: '元数据查看器', metaTitle: '元数据查看器 — 在线查看文件里的隐藏信息', eyebrow: '通用文件检查台',
    description: '查看 28 种图片、文档、视频和音频格式里的元数据。可搜索字段、复制值并导出完整结果，文件不用上传。',
    shortDescription: '放进一个支持的文件，搜索、复制或导出所有可读元数据字段。',
    highlights: ['不迷信扩展名，先检查真实文件签名。', '同时生成易读摘要和完整原生字段账本。', '读取一次文件并计算 SHA-256 与 MD5。', '可导出安全 JSON 和精简 PDF 报告。'],
    limitations: ['通用工具限制为 100 MB，避免损坏文件拖垮标签页。', '加密 PDF 只会报告状态，不会尝试破解。', '元数据描述文件，但不能保证每个字段都准确。'],
    faqs: viewerFaqs('元数据查看器', '28 种常见图片、视频、音频和文档格式', 'EXIF、XMP、IPTC、GPS、容器、文档属性和技术字段'),
  },
  image: {
    title: '图片元数据查看器', metaTitle: '图片元数据查看器 — 查看 PNG、JPEG、WebP、HEIC、TIFF 和 GIF', eyebrow: '多格式图片证据阅读器',
    description: '查看 PNG、JPEG、WebP、HEIC、TIFF 与 GIF 中的 EXIF、GPS、XMP、IPTC、ICC、注释、动画标记和原生字段。全部在浏览器里完成。',
    shortDescription: '从一张图片里读取相机、GPS、色彩、作者、软件、动画和容器信息。',
    highlights: ['验证 PNG、JPEG、WebP、HEIC、TIFF 或 GIF 的真实签名。', '展示尺寸、动画、相机、GPS、色彩、作者和日期。', '保留 ExifTool 原生路径与未知的可读标签。', '浏览器无法预览 HEIC 或 TIFF 时仍能读取元数据。'],
    limitations: ['部分浏览器不能预览 HEIC 或 TIFF 像素，但元数据检查仍可继续。', '隐私检查器目前只接收 JPEG、PNG 与 WebP。', '可见的人脸和文字属于像素，本工具不会分析。'],
    faqs: viewerFaqs('图片元数据查看器', 'PNG、JPG/JPEG、WebP、HEIC、TIFF 和 GIF，单个不超过 50 MB', 'EXIF、GPS、XMP、IPTC、ICC、注释、动画、容器和内嵌预览'),
  },
  document: {
    title: '文档元数据查看器', metaTitle: '文档元数据查看器 — 查看 PDF、DOCX、PPTX 与 XLSX 属性', eyebrow: '文档属性阅读器',
    description: '在浏览器本地检查 PDF、DOCX、PPTX 与 XLSX 的作者、日期、应用程序、修订、统计、自定义属性和原生元数据。',
    shortDescription: '打开一个 PDF 或 Office 文档，读取包裹在正文周围的属性记录。',
    highlights: ['读取 PDF 字典与 OOXML 核心、应用和自定义属性。', '在文件有记录时显示页数、字数、幻灯片和工作表统计。', '检查真实文档包类型，不只看扩展名。', '报告不会包含正文、单元格、幻灯片、附件或媒体字节。'],
    limitations: ['不会解密或绕过受密码保护的 PDF 与 Office 文件。', '旧版 DOC、PPT、XLS 和启用宏的文件不在支持范围内。', '作者、日期、修订和统计可能缺失、过期或被修改。'],
    faqs: viewerFaqs('文档元数据查看器', 'PDF、DOCX、PPTX 与 XLSX，单个不超过 100 MB', '标题、作者、主题、日期、应用、修订、自定义属性、文档统计与原生字段'),
  },
  video: {
    title: '视频元数据查看器', metaTitle: '视频元数据查看器 — 查看 MP4、MOV、MKV、WebM、AVI 与 FLV', eyebrow: '多格式视频容器阅读器',
    description: '在浏览器本地检查 MP4、M4V、MOV、MKV、WebM、AVI、FLV、3GP 和 3G2 视频的元数据。',
    shortDescription: '读取一个视频的时长、尺寸、编码、轨道、品牌、日期和制作信息。',
    highlights: ['检查 ISO BMFF、EBML、RIFF 与 FLV 容器签名。', '汇总时长、尺寸、编码、帧率和轨道。', '保留 ExifTool 原生路径与格式专用字段。', '不会播放、转写或分析视频画面。'],
    limitations: ['M4V 会按底层 MP4 容器家族报告。', '不会分析画面、语音、人脸、字幕和可见文字。', '这里不提供播放、转码或修复功能。'],
    faqs: viewerFaqs('视频元数据查看器', 'MP4、M4V、MOV、MKV、WebM、AVI、FLV、3GP 与 3G2，单个不超过 100 MB', '时长、尺寸、编码、帧率、码率、轨道、日期、软件和容器字段'),
  },
  audio: {
    title: '音频元数据查看器', metaTitle: '音频元数据查看器 — 查看 MP3、FLAC、OGG、M4A、WAV 与 WMA 标签', eyebrow: '多格式音频标签阅读器',
    description: '在浏览器本地读取 MP3、FLAC、OGG、OPUS、OGA、M4A、AAC、WAV 与 WMA 的标签和技术元数据。',
    shortDescription: '检查曲目标签、署名、编码、时长、码率、采样率、声道、位深和内嵌封面。',
    highlights: ['读取 ID3、Vorbis、Opus、iTunes、RIFF 与 ASF 元数据。', '先检查真实容器，再参考扩展名。', '只汇总内嵌封面，不导出其字节。', '不会播放、转写或为音频生成指纹。'],
    limitations: ['OGA 是偏音频用途的 Ogg 扩展名，报告会尽量识别实际编码。', '封面和其他二进制载荷只做摘要，不渲染或导出。', '不会播放、转写、监听或生成声学指纹。'],
    faqs: viewerFaqs('音频元数据查看器', 'MP3、FLAC、OGG、OPUS、OGA、M4A、AAC、WAV 与 WMA，单个不超过 100 MB', 'ID3、Vorbis、Opus、iTunes、RIFF、ASF 标签和编码技术字段'),
  },
  privacy: {
    title: '图片隐私检查器', metaTitle: '图片隐私检查器 — 查找 EXIF、GPS 和隐藏元数据', eyebrow: '能说清原因的风险扫描',
    description: '不上传图片，检查其中的 GPS、设备标识、时间、作者信息和隐藏元数据。', shortDescription: '检查一张图片里的位置、身份、设备、编辑和缩略图线索。',
    highlights: ['先给出初步结果，再自动完成一次完整扫描。', '每个分数都能追到匹配的元数据字段。', '检查标准标签、内嵌预览和嵌套图片记录。', '生成清理副本，完整复扫并与原图比较。'],
    limitations: ['低分不等于图片一定适合分享。', '不会检查画面里可见的人脸、文字、倒影或地标。', '规则解释常见风险，但不知道你的具体威胁模型。'],
    faqs: [
      { question: '图片会上传或保存吗？', answer: '不会。图片留在当前标签页，由本地 Worker 检查；文件、文件名、坐标、哈希和报告都不会上传或加入历史。' },
      { question: '检查器会找什么？', answer: '它会查找 GPS、姓名、联系方式、设备和镜头标识、原文件名、时间、编辑历史、持久 ID、缩略图、预览和嵌套图片记录。' },
      { question: '0–100 分代表什么？', answer: '这是由公开且设有上限的规则算出的可重复总分。精确坐标比相机型号权重高，同一事实的重复副本不会反复加分。' },
      { question: '它能看出照片的准确位置吗？', answer: '只有在文件里存在有效的 GPS 经纬度时才会显示。没有可用标签时，它不会猜位置，也不会联系在线地图。' },
      { question: '零分就能放心分享吗？', answer: '不能。零分只表示受支持的元数据规则没有发现计分证据；画面中的人脸、地址、车牌、屏幕、倒影和地标仍可能泄密。' },
    ],
  },
  remover: {
    title: '元数据清除器', metaTitle: '元数据清除器 — 清理图片、视频、音频和文档标签', eyebrow: '全格式元数据清理台',
    description: '在本地清除 28 种图片、视频、音频和文档格式中的可写元数据，并在下载前验证生成的副本。',
    shortDescription: '放进一个支持的文件，不重新编码内容，清除描述性标签，再复扫副本。',
    highlights: ['按真实格式选择对应的清理引擎。', '保留媒体和文档内容。', '下载前重新扫描生成的副本。', '把已清除、保留和残留字段分开列出。'],
    limitations: ['删除必要技术字段会损坏文件，因此它们会保留。', '封面、章节、字幕、附件、评论、修订和可见内容会保留。', '验证通过也不会隐藏内容里可见的人物、文字或地点。'],
    faqs: removerFaqs('文件', '六种图片、九种视频、九种音频，以及 PDF、DOCX、PPTX、XLSX', '媒体轨道、文档正文、章节、字幕、封面和附件'),
  },
  imageRemover: {
    title: '图片元数据清除器', metaTitle: '图片元数据清除器 — 清理 PNG、JPEG、WebP、HEIC、TIFF 和 GIF', eyebrow: '图片标签清理台',
    description: '无需重新编码像素，清除 PNG、JPEG、WebP、HEIC、TIFF 与 GIF 中可写的 EXIF、GPS、XMP、IPTC、MakerNote、注释和隐藏预览。',
    shortDescription: '清理六种图片格式，同时保留 ICC 色彩、方向、尺寸和动画。',
    highlights: ['清除可写的身份和位置字段。', '保留压缩像素与动画。', '保留正确显示所需的色彩和方向。', '清理前后执行同等深度的完整扫描。'],
    limitations: ['TIFF 会保留渲染像素所需的结构性 IFD 字段。', 'ICC 色彩与 Orientation 会有意保留。', '清理元数据不能隐藏画面里的人脸、文字、车牌和地标。'],
    faqs: removerFaqs('图片', 'PNG、JPEG、WebP、HEIC、TIFF 与 GIF', '压缩像素、尺寸、方向、色彩和动画'),
  },
  videoRemover: {
    title: '视频元数据清除器', metaTitle: '视频元数据清除器 — 清理 MP4、MOV、MKV、WebM、AVI 与 FLV', eyebrow: '视频容器标签清理台',
    description: '无需转码视频，清除 MP4、M4V、MOV、MKV、WebM、AVI、FLV、3GP 与 3G2 中可写的描述性元数据。',
    shortDescription: '保留轨道、编码、章节、字幕和画面，只清除可写的容器标签。',
    highlights: ['不转码视频或音频轨道。', '按真实容器选择清理引擎。', '保留章节、字幕、封面与附件。', '结构或技术参数变化时阻止输出。'],
    limitations: ['部分容器必须保留轨道日期或处理器标签。', '字幕、章节、附件和可见画面会保留。', '清理不会删除人脸、语音、标志、字幕或可见地点。'],
    faqs: removerFaqs('视频', 'MP4、M4V、MOV、MKV、WebM、AVI、FLV、3GP 与 3G2', '编码轨道、画面、章节、字幕、封面和附件'),
  },
  audioRemover: {
    title: '音频元数据清除器', metaTitle: '音频元数据清除器 — 清理 MP3、FLAC、OGG、M4A、WAV 与 WMA', eyebrow: '音频标签清理台',
    description: '无需重新编码声音，清除九种音频格式里的 ID3、Vorbis、Opus、iTunes、RIFF、BEXT、iXML 和 ASF 描述性元数据。',
    shortDescription: '清除可写的音频标签，同时保留声音、封面、章节、编码和采样属性。',
    highlights: ['在独立 Worker 中本地运行 TagLib WASM。', '按策略保留封面和章节。', '清除广播注释与自定义描述标签。', '验证格式、时长、采样率、声道和编码。'],
    limitations: ['封面与章节会有意保留。', '必要的编码头和技术音频属性会保留。', '不会编辑、响度标准化、转写、识别或监听音频。'],
    faqs: removerFaqs('音频', 'MP3、FLAC、OGG、OPUS、OGA、M4A、AAC、WAV 与 WMA', '编码音频流、封面、章节、编码和采样属性'),
  },
  documentRemover: {
    title: '文档元数据清除器', metaTitle: '文档元数据清除器 — 清理 PDF、DOCX、PPTX 与 XLSX 属性', eyebrow: '文档属性清理台',
    description: '在本地清除 PDF 和 Office 文档的可写属性，同时保留页面、正文、单元格、幻灯片、评论、修订、媒体与附件。',
    shortDescription: '清理 PDF、DOCX、PPTX 与 XLSX 属性记录，再重新打开并验证生成的文档。',
    highlights: ['不读取正文，只重写 Office 属性 XML。', '使用 qpdf 完整重写 PDF，并省略顶层 Info 与 XMP。', '保留文档内容和内嵌对象。', '使数字签名失效前会明确提醒。'],
    limitations: ['PDF 页面内容与内嵌文件可能自带元数据，本工具不会重写它们。', 'Office 评论、修订、隐藏表、宏和内嵌对象会保留。', '修改字节会让现有 PDF 或 OOXML 数字签名失效。'],
    faqs: removerFaqs('文档', 'PDF、DOCX、PPTX 与 XLSX', '页面、正文、单元格、幻灯片、评论、修订、媒体和附件'),
  },
  c2pa: {
    title: 'C2PA 查看器', metaTitle: 'C2PA 查看器 — 验证内容凭证与文件来源', eyebrow: '加密来源检查',
    description: '在 20 种常见图片、视频、音频和文档格式中验证 C2PA 内容凭证。检查签名、文件绑定、操作、素材、断言和安全清单数据，文件无需上传。',
    shortDescription: '放进一个图片、视频、音频或 PDF，查看清晰的凭证结论和背后的证据。',
    highlights: ['在隔离的 Web Worker 中使用官方 @contentauth 浏览器验证器。', '按真实签名检查 20 种常见 C2PA 资源格式。', '把签名有效与发布者可信分开，拒绝含糊的绿色徽章。', '计算 SHA-256，并导出不含源文件字节的安全收据。'],
    limitations: ['没有凭证不代表文件是假的。', '有效签名证明文件绑定和声明完整性，不证明所有说法或画面为真。', '为保护隐私，本页不访问外部信任列表或 OCSP，因此发布者信任和吊销状态可能未检查。'],
    faqs: [
      { question: '“有效”是什么意思？', answer: '清单结构正确、签名验证通过，而且签名内容绑定与当前文件完全匹配。发布者是否可信是另一项结论。' },
      { question: '为什么发布者信任显示“未检查”？', answer: '这个页面不会请求外部信任列表、远程清单或 OCSP。需要最新在线信任结论时，请再使用其他符合规范的验证器。' },
      { question: '“没有内容凭证”是什么意思？', answer: '文件中没有检测到内嵌 C2PA 清单。很多真实文件本来就没有凭证，因此缺失不等于造假。' },
      { question: '支持哪些文件格式？', answer: '支持 JPEG、PNG、WebP、GIF、TIFF、HEIC、HEIF、AVIF、JXL、DNG、ARW、NEF、SVG、MP4、MOV、AVI、MP3、M4A、WAV 与 PDF，并会先检查真实文件签名。' },
      { question: '文件会上传吗？', answer: '不会。官方验证器运行在浏览器 Worker 中，源文件字节、文件名、指纹和清单值都不会提交到服务器或保存进历史。' },
      { question: 'C2PA 能证明内容是真的吗？', answer: '不能。有效结果证明签名凭证仍绑定到这个文件，但不能证明每个说法、声音或可见场景都符合事实。' },
    ],
  },
};

const guideNames: Record<ToolKey, string> = {
  metadata: '文件', image: '图片', document: '文档', video: '视频', audio: '音频', privacy: '图片', remover: '文件', imageRemover: '图片', videoRemover: '视频', audioRemover: '音频', documentRemover: '文档', c2pa: '文件',
};

function localizedGuide(key: ToolKey, base?: FormatGuide): FormatGuide | undefined {
  if (!base) return undefined;
  const name = guideNames[key];
  const cleaning = key.endsWith('Remover') || key === 'remover';
  const benefits = cleaning ? [
    { kicker: '只动元数据', title: '清标签，不动内容', description: `清除可写的身份、位置、软件、日期和自定义字段，不故意转码${name}内容。`, action: '清理一个文件' },
    { kicker: '清理后再验', title: '相信复检，不靠想象', description: '生成的副本会按同等深度再次解析，已清除、保留和残留字段分别展示。', action: '查看验证结果' },
    { kicker: '原件不动', title: '副本和收据一起拿走', description: '原文件始终不变。下载清理副本，并保存一份不含源文件内容的 JSON 记录。', action: '先查看元数据' },
  ] : [
    { kicker: '隐私线索', title: '先发现不该外带的信息', description: `在分享${name}前找出位置、身份、设备、时间和制作历史等隐藏线索。`, action: `检查${name}` },
    { kicker: '技术事实', title: '把文件结构读明白', description: `查看${name}的格式、技术参数、原生字段路径、哈希和解析证据。`, action: '读取本地字段' },
    { kicker: '更干净地分享', title: '需要时做个清理副本', description: '元数据可编辑也可能泄密。检查后可进入对应清理工具，并复扫生成的副本。', action: '打开相关工具' },
  ];
  return {
    valueEyebrow: cleaning ? '为什么要清理' : '为什么值得看',
    valueTitle: cleaning ? `为什么要清除${name}元数据？` : `为什么要检查${name}？`,
    valueDescription: cleaning ? `${name}可能在可见内容之外保留身份、位置、软件、日期和制作历史。` : `${name}里的元数据能补充技术背景，也可能在你没注意时暴露隐私。`,
    benefits: base.benefits.map((item, index) => ({ ...item, href: localizePath(item.href, 'zh-CN'), ...(benefits[index] ?? benefits[0]!) })),
    processTitle: cleaning ? `${name}清理怎么工作` : `${name}扫描怎么工作`,
    processDescription: cleaning ? `文件在当前标签页里清理，原件和生成的副本都不会上传。` : `浏览器在当前标签页读取${name}，不会把文件上传到分析服务器。`,
    steps: [
      { title: `选择一个${name}`, description: '选择一个支持的文件。文件字节只留在当前浏览器标签页。' },
      { title: '检查真实格式', description: '先验证文件签名、容器标记和大小，不只相信扩展名。' },
      { title: cleaning ? '在本地清除元数据' : '在本地读取元数据', description: cleaning ? '格式专用引擎处理描述性标签，同时保留内容。' : '本地解析器与按需加载的 ExifTool WASM 读取可用字段。' },
      { title: cleaning ? '复检生成的副本' : '整理成可搜索报告', description: cleaning ? '重新打开副本，比较结构并再次扫描，通过后才允许下载。' : '字段按用途分组，可搜索、复制，并保留原生路径。' },
      { title: '结束后释放', description: '清除、替换或刷新页面会停止 Worker，并释放当前标签页中的临时对象。' },
    ],
    ctaLead: `${name}准备好了？`, ctaLabel: '在上面选择文件',
  };
}

function localizedRelated(config: ToolConfig) {
  const titles: Record<string, [string, string]> = {
    '/image-privacy-checker/': ['图片隐私检查器', '把隐藏元数据换成说得清的风险分数。'],
    '/metadata-remover/': ['元数据清除器', '清除可写标签，不重新编码文件内容。'],
    '/metadata-viewer/': ['元数据查看器', '先把完整文件记录看清楚。'],
    '/c2pa-viewer/': ['C2PA 查看器', '把签名来源和普通元数据分开检查。'],
  };
  return config.related.map((item) => ({ href: localizePath(item.href, 'zh-CN'), title: titles[item.href]?.[0] ?? item.title, note: titles[item.href]?.[1] ?? item.note }));
}

export function getTool(key: ToolKey, locale: Locale = 'en'): ToolConfig {
  const base = tools[key];
  if (!base) throw new Error(`Unknown tool key: ${key}`);
  if (locale === 'en') return base;
  const copy = zhCopy[key];
  return {
    ...base, ...copy,
    path: localizePath(base.path, locale),
    formatGuide: localizedGuide(key, base.formatGuide),
    related: localizedRelated(base),
    formats: key === 'remover' ? '图片 · 视频 · 音频 · 文档' : base.formats,
  };
}
