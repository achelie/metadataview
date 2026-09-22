import type { Locale } from './core';

const messages = {
  next: ['Continue with this file', '继续处理当前文件', 'Mit dieser Datei fortfahren', 'Continuer avec ce fichier'],
  nextOutput: ['Check the processed copy', '继续检查处理后的副本', 'Bearbeitete Kopie prüfen', 'Vérifier la copie traitée'],
  note: ['No need to choose it again. The file stays in this tab’s memory; reloading clears it.', '无需再次选图。文件只在当前标签页内存中接续，刷新后清空。', 'Keine erneute Auswahl. Die Datei bleibt im Speicher dieses Tabs; Neuladen löscht sie.', 'Sans nouvelle sélection. Le fichier reste en mémoire dans cet onglet ; recharger l’efface.'],
  metadata: ['View metadata', '查看元数据', 'Metadaten ansehen', 'Voir les métadonnées'],
  privacy: ['Check privacy', '检查隐私', 'Datenschutz prüfen', 'Vérifier la confidentialité'],
  remove: ['Remove metadata', '清理元数据', 'Metadaten entfernen', 'Supprimer les métadonnées'],
  c2pa: ['Verify C2PA', '验证 C2PA', 'C2PA prüfen', 'Vérifier C2PA'],
  loading: ['Opening the next tool…', '正在打开下一个工具…', 'Nächstes Werkzeug wird geöffnet…', 'Ouverture de l’outil suivant…'],
  error: ['The tool could not open. Your file is still here; try again.', '工具未能打开，文件仍在这里，可以重试。', 'Das Werkzeug konnte nicht geöffnet werden. Deine Datei ist noch hier; versuche es erneut.', 'Impossible d’ouvrir l’outil. Votre fichier est toujours ici ; réessayez.'],
} as const;

export function toolHandoffText(locale: Locale, key: keyof typeof messages): string {
  return messages[key][locale === 'zh-CN' ? 1 : locale === 'de' ? 2 : locale === 'fr' ? 3 : 0];
}
