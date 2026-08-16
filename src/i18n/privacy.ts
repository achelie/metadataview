import type { PrivacyCategory, PrivacyRisk, RiskSeverity } from '../lib/privacy/types';
import type { Locale } from './core';

interface RiskTranslation {
  title: string;
  description: string;
  recommendation: string;
}

const categoryRecommendations: Record<PrivacyCategory, string> = {
  location: '分享前删除位置字段，并检查清理后的副本。',
  device: '删除设备型号、序列号和所有者信息，减少跨文件关联。',
  identity: '对外分享前删除姓名、联系方式、作者和路径信息。',
  time: '如果拍摄时间会暴露行程或习惯，分享前删除时间戳。',
  editing: '如果不想暴露制作工具，请在导出时排除软件字段。',
  'document-history': '删除原始文件名、文档 ID 和编辑历史，然后再次扫描。',
  thumbnail: '删除内嵌缩略图，避免旧版画面跟着文件一起外流。',
  other: '删除内部地址、链接或凭据类字段，不要直接打开它们。',
};

const riskCopy: Record<string, Omit<RiskTranslation, 'recommendation'> & { recommendation?: string }> = {
  'precise-location': { title: '精确 GPS 坐标', description: '图片里有精确坐标，可能直接暴露拍摄地点。' },
  'gps-altitude': { title: 'GPS 海拔', description: '海拔不能单独定位，但会补充拍摄地点的环境线索。' },
  'gps-direction': { title: '镜头朝向', description: '文件记录了拍摄时的镜头方向，它本身不是精确位置，但是额外线索。' },
  'approximate-location': { title: '地名或大致位置', description: '即使没有坐标，城市、场馆或景点名称也可能暴露图片来源。' },
  'device-model': { title: '相机或手机型号', description: '图片记录了拍摄设备或镜头型号。通常只是较弱的隐私线索。' },
  'device-identifier': { title: '唯一设备标识', description: '唯一序列号可能把多张图片关联到同一台设备。' },
  'device-owner': { title: '相机所有者姓名', description: '设备所有者字段可能直接指向一个人。' },
  'creator-identity': { title: '作者或创作者姓名', description: '作者或署名字段可能暴露创作者或图片来源。' },
  'contact-details': { title: '邮箱或联系方式', description: '图片里的联系信息可以直接识别或联系到某个人。' },
  'named-people': { title: '人名或人脸区域标签', description: '人物和区域标签可能识别画面中的人，即使我们从不分析像素。' },
  'rights-information': { title: '所有权或版权信息', description: '所有权字段可能暴露创作者或来源。', recommendation: '需要隐私时可删除这些字段；但对外发布前也要考虑保留权利声明的价值。' },
  'capture-time': { title: '原始拍摄时间', description: '拍摄时间戳可能把图片和作息、旅行、会议或具体事件联系起来。' },
  'modification-time': { title: '内嵌修改时间', description: '文件包含内部修改时间。它比原始拍摄时间弱，但仍是线索。' },
  'software-information': { title: '编辑软件', description: '图片记录了用来创建或处理它的软件。' },
  'editing-history': { title: '编辑历史或持久文档 ID', description: '编辑操作、源文档关系或持久 ID 可以暴露制作轨迹，并关联同一资产的不同版本。' },
  'original-file-reference': { title: '原始文件名或来源引用', description: '保留的源文件名可能暴露项目名、命名规则或资产来源。' },
  'embedded-thumbnail': { title: '内嵌缩略图', description: '文件里的缩略图可能保留图片早期版本。' },
  'local-file-path': { title: '本地文件路径', description: '本地路径可能暴露电脑用户名、目录结构、项目名或内部资产位置。' },
  'internal-network-address': { title: '内部地址或携带凭据的 URL', description: '元数据可能包含内网地址、本地资源，甚至访问令牌。检查器不会打开这些链接。' },
  'location-time-combination': { title: '位置 + 拍摄时间', description: '位置和时间合在一起，可能暴露照片在哪里、什么时候拍摄。' },
  'location-device-combination': { title: '位置 + 设备信息', description: '位置和设备细节组合后，更容易把不同文件关联起来。' },
  'identity-contact-combination': { title: '姓名 + 联系方式', description: '人名和联系方式同时出现，会形成直接的身份关联。' },
  'model-serial-combination': { title: '设备型号 + 序列号', description: '型号和序列号组合成的设备指纹，比单独一个字段更强。' },
  'location-identity-time-combination': { title: '位置、身份与时间关联', description: '姓名、精确地点和拍摄时间组合成了高度可识别的事件记录。' },
};

export const privacyCategoryLabels: Record<Locale, Record<PrivacyCategory, string>> = {
  en: { location: 'Location', device: 'Device', identity: 'Identity', time: 'Time', editing: 'Editing', thumbnail: 'Thumbnail', 'document-history': 'Document history', other: 'Other' },
  'zh-CN': { location: '位置', device: '设备', identity: '身份', time: '时间', editing: '编辑', thumbnail: '缩略图', 'document-history': '文档历史', other: '其他' },
};

export const privacySeverityLabels: Record<Locale, Record<RiskSeverity, string>> = {
  en: { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' },
  'zh-CN': { critical: '严重', high: '高', medium: '中', low: '低' },
};

export function localizePrivacyRisk(risk: PrivacyRisk, locale: Locale): RiskTranslation {
  if (locale !== 'zh-CN') return { title: risk.title, description: risk.description, recommendation: risk.recommendation };
  const translated = riskCopy[risk.id];
  if (!translated) return { title: risk.title, description: risk.description, recommendation: risk.recommendation };
  return { ...translated, recommendation: translated.recommendation ?? categoryRecommendations[risk.category] };
}

export function localizePrivacyRiskId(id: string, locale: Locale): string {
  return locale === 'zh-CN' ? riskCopy[id]?.title ?? id : id;
}
