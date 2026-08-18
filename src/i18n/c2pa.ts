import type { C2paValidationEntry } from '../lib/c2pa/types';
import type { Locale } from './core';

const validationCopy: Record<string, [string, string]> = {
  'claimSignature.validated': ['签名匹配', '活动声明的加密签名验证通过。'],
  'claimSignature.insideValidity': ['证书在有效期内', '签名时间位于凭证有效期内。'],
  'signingCredential.trusted': ['发布者可信', '签名凭证可以链接到已配置的信任根。'],
  'signingCredential.untrusted': ['发布者未受信任', '签名凭证无法链接到已配置的信任根。'],
  'signingCredential.ocsp.notRevoked': ['凭证未被吊销', '可用的吊销信息未将该签名凭证标记为已吊销。'],
  'signingCredential.ocsp.revoked': ['凭证已吊销', '吊销服务报告该签名凭证已被吊销。'],
  'signingCredential.ocsp.skipped': ['已跳过吊销检查', '未发起在线吊销查询。'],
  'signingCredential.ocsp.inaccessible': ['吊销服务不可用', '无法访问凭证吊销服务。'],
  'assertion.dataHash.match': ['文件绑定匹配', '签名数据哈希与当前文件匹配。'],
  'assertion.dataHash.mismatch': ['文件绑定不匹配', '签名数据哈希与当前文件不匹配。'],
  'assertion.bmffHash.match': ['媒体绑定匹配', '签名 BMFF 哈希与当前媒体文件匹配。'],
  'assertion.bmffHash.mismatch': ['媒体绑定不匹配', '签名 BMFF 哈希与当前媒体文件不匹配。'],
  'assertion.boxesHash.match': ['容器绑定匹配', '签名容器哈希与当前文件匹配。'],
  'assertion.boxesHash.mismatch': ['容器绑定不匹配', '签名容器哈希与当前文件不匹配。'],
  'assertion.collectionHash.match': ['集合绑定匹配', '签名集合哈希与当前资产匹配。'],
  'assertion.collectionHash.mismatch': ['集合绑定不匹配', '签名集合哈希与当前资产不匹配。'],
};

const validationCopyDe: Record<string, [string, string]> = {
  'claimSignature.validated': ['Signatur stimmt überein', 'Die kryptografische Signatur der aktiven Aussage wurde erfolgreich verifiziert.'],
  'claimSignature.insideValidity': ['Zertifikat war gültig', 'Der Signaturzeitpunkt liegt innerhalb der Gültigkeitsdauer des Credentials.'],
  'signingCredential.trusted': ['Herausgeber vertrauenswürdig', 'Das Signatur-Credential lässt sich mit einem konfigurierten Vertrauensanker verbinden.'],
  'signingCredential.untrusted': ['Herausgeber nicht vertrauenswürdig', 'Das Signatur-Credential lässt sich mit keinem konfigurierten Vertrauensanker verbinden.'],
  'signingCredential.ocsp.notRevoked': ['Credential nicht widerrufen', 'Die verfügbaren Widerrufsdaten markieren das Signatur-Credential nicht als widerrufen.'],
  'signingCredential.ocsp.revoked': ['Credential widerrufen', 'Der Widerrufsdienst meldet das Signatur-Credential als widerrufen.'],
  'signingCredential.ocsp.skipped': ['Widerrufsprüfung übersprungen', 'Es wurde keine Online-Abfrage zum Widerruf durchgeführt.'],
  'signingCredential.ocsp.inaccessible': ['Widerrufsdienst nicht erreichbar', 'Der Dienst zur Prüfung des Zertifikatswiderrufs war nicht erreichbar.'],
  'assertion.dataHash.match': ['Dateibindung stimmt überein', 'Der signierte Daten-Hash passt zur aktuellen Datei.'],
  'assertion.dataHash.mismatch': ['Dateibindung stimmt nicht überein', 'Der signierte Daten-Hash passt nicht zur aktuellen Datei.'],
  'assertion.bmffHash.match': ['Medienbindung stimmt überein', 'Der signierte BMFF-Hash passt zur aktuellen Mediendatei.'],
  'assertion.bmffHash.mismatch': ['Medienbindung stimmt nicht überein', 'Der signierte BMFF-Hash passt nicht zur aktuellen Mediendatei.'],
  'assertion.boxesHash.match': ['Containerbindung stimmt überein', 'Der signierte Container-Hash passt zur aktuellen Datei.'],
  'assertion.boxesHash.mismatch': ['Containerbindung stimmt nicht überein', 'Der signierte Container-Hash passt nicht zur aktuellen Datei.'],
  'assertion.collectionHash.match': ['Sammlungsbindung stimmt überein', 'Der signierte Sammlungs-Hash passt zum aktuellen Asset.'],
  'assertion.collectionHash.mismatch': ['Sammlungsbindung stimmt nicht überein', 'Der signierte Sammlungs-Hash passt nicht zum aktuellen Asset.'],
};

export function localizeC2paValidation(entry: C2paValidationEntry, locale: Locale): Pick<C2paValidationEntry, 'title' | 'explanation'> {
  if (locale === 'en') return entry;
  const copy = (locale === 'zh-CN' ? validationCopy : validationCopyDe)[entry.code];
  return copy ? { title: copy[0], explanation: copy[1] } : entry;
}
