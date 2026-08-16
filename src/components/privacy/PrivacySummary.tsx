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
  const de = locale === 'de';
  const t = (en: string, zhText: string, deText: string) => zh ? zhText : de ? deText : en;
  const has = (...ids: string[]) => report.risks.some((risk) => ids.includes(risk.id));
  const items = [
    { label: t('Location', '位置', 'Standort'), found: report.summary.hasPreciseLocation || report.summary.hasApproximateLocation, note: report.summary.hasPreciseLocation ? t('Exact coordinates', '精确坐标', 'Genaue Koordinaten') : t('Named place', '地点名称', 'Benannter Ort'), icon: mapIcon, risk: report.summary.hasPreciseLocation ? 'precise-location' : 'approximate-location' },
    { label: t('Device fingerprint', '设备指纹', 'Gerätefingerabdruck'), found: has('device-model', 'device-identifier'), note: report.summary.hasDeviceIdentifier ? t('Unique identifier', '唯一标识符', 'Eindeutige Kennung') : t('Make or model', '品牌或型号', 'Hersteller oder Modell'), icon: cameraIcon, risk: report.summary.hasDeviceIdentifier ? 'device-identifier' : 'device-model' },
    { label: t('Capture time', '拍摄时间', 'Aufnahmezeit'), found: report.summary.hasCaptureTime, note: t('Embedded date, not file time', '内嵌日期，不是文件时间', 'Eingebettetes Datum, nicht Dateizeit'), icon: clockIcon, risk: 'capture-time' },
    { label: t('Author or contact', '作者或联系方式', 'Autor oder Kontakt'), found: report.summary.hasIdentityInformation, note: t('Name, owner, or contact', '姓名、所有者或联系方式', 'Name, Eigentümer oder Kontakt'), icon: userIcon, risk: has('contact-details') ? 'contact-details' : has('creator-identity') ? 'creator-identity' : 'device-owner' },
    { label: t('Named people', '人物姓名', 'Benannte Personen'), found: report.summary.hasNamedPeople, note: t('XMP/IPTC person labels', 'XMP/IPTC 人物标签', 'XMP/IPTC-Personen-Tags'), icon: usersIcon, risk: 'named-people' },
    { label: t('Thumbnail or preview', '缩略图或预览', 'Vorschaubild'), found: report.summary.hasEmbeddedThumbnail, note: t('Independent embedded image', '独立内嵌图片', 'Eigenständiges eingebettetes Bild'), icon: imageIcon, risk: 'embedded-thumbnail' },
    { label: t('Editing trail', '编辑痕迹', 'Bearbeitungsspur'), found: report.summary.hasEditingHistory, note: t('History or persistent IDs', '历史或持久 ID', 'Verlauf oder dauerhafte IDs'), icon: historyIcon, risk: 'editing-history' },
    { label: t('Original filename', '原始文件名', 'Ursprünglicher Dateiname'), found: report.summary.hasOriginalFileReference, note: t('Preserved source reference', '保留的来源引用', 'Erhaltener Quellverweis'), icon: fileIcon, risk: 'original-file-reference' },
  ];
  return <section className="privacy-summary" aria-labelledby="privacy-summary-heading">
    <header><span className="section-index">{t('FAST READ / EIGHT SIGNALS', '快速读法 / 八类信号', 'SCHNELLBLICK / ACHT SIGNALE')}</span><h2 id="privacy-summary-heading">{t('What turned up', '找到了什么', 'Was gefunden wurde')}</h2></header>
    <div>{items.map((item) => item.found ? <a href={`#risk-${item.risk}`} className="is-found" key={item.label}><Icon icon={item.icon} width="19" /><span><strong>{item.label}</strong><small>{item.note}</small></span><b>{t('Found', '已发现', 'Gefunden')}</b></a> : <div key={item.label}><Icon icon={item.icon} width="19" /><span><strong>{item.label}</strong><small>{item.note}</small></span><b>{t('Not detected', '未检测到', 'Nicht erkannt')}</b></div>)}</div>
    <p>{t('“Not detected” means the current scan did not find a supported metadata signal. It is not a promise of anonymity.', '“未检测到”只表示当前扫描没有发现受支持的元数据信号，不是匿名保证。', '„Nicht erkannt“ bedeutet nur, dass der aktuelle Scan kein unterstütztes Metadatensignal fand. Das ist keine Anonymitätsgarantie.')}</p>
  </section>;
}
