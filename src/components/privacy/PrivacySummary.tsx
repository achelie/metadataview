import { Icon } from '@iconify/react';
import cameraIcon from '@iconify-icons/lucide/camera';
import clockIcon from '@iconify-icons/lucide/clock';
import fileIcon from '@iconify-icons/lucide/file-text';
import historyIcon from '@iconify-icons/lucide/history';
import imageIcon from '@iconify-icons/lucide/image';
import mapIcon from '@iconify-icons/lucide/map-pin';
import userIcon from '@iconify-icons/lucide/user';
import usersIcon from '@iconify-icons/lucide/users';
import type { PrivacyReport } from '../../lib/privacy/types';
import type { Locale } from '../../i18n/core';

export function PrivacySummary({ report, locale = 'en' }: { report: PrivacyReport; locale?: Locale }) {
  const zh = locale === 'zh-CN';
  const has = (...ids: string[]) => report.risks.some((risk) => ids.includes(risk.id));
  const items = [
    { label: zh ? '位置' : 'Location', found: report.summary.hasPreciseLocation || report.summary.hasApproximateLocation, note: report.summary.hasPreciseLocation ? (zh ? '精确坐标' : 'Exact coordinates') : (zh ? '地点名称' : 'Named place'), icon: mapIcon, risk: report.summary.hasPreciseLocation ? 'precise-location' : 'approximate-location' },
    { label: zh ? '设备指纹' : 'Device fingerprint', found: has('device-model', 'device-identifier'), note: report.summary.hasDeviceIdentifier ? (zh ? '唯一标识符' : 'Unique identifier') : (zh ? '品牌或型号' : 'Make or model'), icon: cameraIcon, risk: report.summary.hasDeviceIdentifier ? 'device-identifier' : 'device-model' },
    { label: zh ? '拍摄时间' : 'Capture time', found: report.summary.hasCaptureTime, note: zh ? '内嵌日期，不是文件时间' : 'Embedded date, not file time', icon: clockIcon, risk: 'capture-time' },
    { label: zh ? '作者或联系方式' : 'Author or contact', found: report.summary.hasIdentityInformation, note: zh ? '姓名、所有者或联系方式' : 'Name, owner, or contact', icon: userIcon, risk: has('contact-details') ? 'contact-details' : has('creator-identity') ? 'creator-identity' : 'device-owner' },
    { label: zh ? '人物姓名' : 'Named people', found: report.summary.hasNamedPeople, note: zh ? 'XMP/IPTC 人物标签' : 'XMP/IPTC person labels', icon: usersIcon, risk: 'named-people' },
    { label: zh ? '缩略图或预览' : 'Thumbnail or preview', found: report.summary.hasEmbeddedThumbnail, note: zh ? '独立内嵌图片' : 'Independent embedded image', icon: imageIcon, risk: 'embedded-thumbnail' },
    { label: zh ? '编辑痕迹' : 'Editing trail', found: report.summary.hasEditingHistory, note: zh ? '历史或持久 ID' : 'History or persistent IDs', icon: historyIcon, risk: 'editing-history' },
    { label: zh ? '原始文件名' : 'Original filename', found: report.summary.hasOriginalFileReference, note: zh ? '保留的来源引用' : 'Preserved source reference', icon: fileIcon, risk: 'original-file-reference' },
  ];
  return <section className="privacy-summary" aria-labelledby="privacy-summary-heading">
    <header><span className="section-index">{zh ? '快速读法 / 八类信号' : 'FAST READ / EIGHT SIGNALS'}</span><h2 id="privacy-summary-heading">{zh ? '找到了什么' : 'What turned up'}</h2></header>
    <div>{items.map((item) => item.found ? <a href={`#risk-${item.risk}`} className="is-found" key={item.label}><Icon icon={item.icon} width="19" /><span><strong>{item.label}</strong><small>{item.note}</small></span><b>{zh ? '已发现' : 'Found'}</b></a> : <div key={item.label}><Icon icon={item.icon} width="19" /><span><strong>{item.label}</strong><small>{item.note}</small></span><b>{zh ? '未检测到' : 'Not detected'}</b></div>)}</div>
    <p>{zh ? '“未检测到”只表示当前扫描没有发现受支持的元数据信号，不是匿名保证。' : '“Not detected” means the current scan did not find a supported metadata signal. It is not a promise of anonymity.'}</p>
  </section>;
}
