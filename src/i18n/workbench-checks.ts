import type { Locale } from './core';
import type { MetadataOutputCheck } from '../lib/metadata-removal/types';

const messages = {
  structure: { en: 'Structure check', 'zh-CN': '结构检查', de: 'Strukturprüfung', fr: 'Contrôle de structure' },
  content: { en: 'Content consistency', 'zh-CN': '内容一致性', de: 'Inhaltsvergleich', fr: 'Cohérence du contenu' },
  passed: { en: 'Structure check passed. This alone does not prove content is unchanged.', 'zh-CN': '结构检查通过，这一项不能单独证明内容没有变化。', de: 'Strukturprüfung bestanden. Dies allein beweist keine unveränderten Inhalte.', fr: 'Structure vérifiée. Ce seul contrôle ne prouve pas que le contenu est inchangé.' },
  failed: { en: 'The output changed unexpectedly. Download is blocked.', 'zh-CN': '输出出现了预期之外的变化，下载已阻止。', de: 'Die Ausgabe hat sich unerwartet geändert. Der Download ist gesperrt.', fr: 'La sortie a changé de façon inattendue. Le téléchargement est bloqué.' },
  unverified: { en: 'Only structure was checked. Content consistency has not been verified for this format.', 'zh-CN': '仅完成结构检查，尚未验证这种格式的内容一致性。', de: 'Nur die Struktur wurde geprüft. Der Inhalt wurde für dieses Format nicht verglichen.', fr: 'Seule la structure a été vérifiée. Le contenu de ce format n’a pas été comparé.' },
  payload: { en: 'Encoded image/audio/video payloads match. Rendering, ancillary data and track interpretation are not certified by this check.', 'zh-CN': '编码载荷哈希一致；这不保证渲染效果、附属数据或轨道解释一致。', de: 'Die kodierten Nutzdaten stimmen überein. Darstellung, Zusatzdaten und Spurinterpretation sind damit nicht bestätigt.', fr: 'Les données encodées correspondent. Le rendu, les données annexes et l’interprétation des pistes ne sont pas certifiés.' },
  office: { en: 'Every package file outside the three rewritten property files matches its original SHA-256 hash.', 'zh-CN': '除三个重写的属性文件外，包内每个文件的 SHA-256 都与原件一致。', de: 'Alle Paketdateien außer den drei neu geschriebenen Eigenschaftsdateien stimmen mit ihrem ursprünglichen SHA-256 überein.', fr: 'Chaque fichier du paquet, hormis les trois fichiers de propriétés réécrits, conserve son SHA-256 d’origine.' },
} satisfies Record<string, Record<Locale, string>>;

export function outputCheckText(check: MetadataOutputCheck, locale: Locale) {
  const content = check.id === 'office-content' || check.id === 'content-payload';
  return {
    label: content ? messages.content[locale] : messages.structure[locale],
    message: check.status === 'failed' ? messages.failed[locale] : check.status === 'warning' ? messages.unverified[locale]
      : check.id === 'office-content' ? messages.office[locale] : check.id === 'content-payload' ? messages.payload[locale] : messages.passed[locale],
  };
}
