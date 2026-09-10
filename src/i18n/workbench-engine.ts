import type { Locale } from './core';
const engineMessages: Record<string, Record<string, Record<Locale, string>>> = {
  "full": {
    "idle": {
      "en": "The browser-only report is ready. The full image scan has not started.",
      "de": "Der Browser-Schnellbericht ist fertig. Der vollständige Bildscan wurde noch nicht gestartet.",
      "fr": "Le rapport initial est prêt. L’analyse complète n’a pas encore commencé.",
      "zh-CN": "浏览器初步报告已经就绪，完整图片扫描尚未开始。"
    },
    "loading": {
      "en": "Scanning every metadata field, embedded preview, and nested image record locally.",
      "de": "Alle Metadatenfelder, eingebetteten Vorschauen und verschachtelten Bilddatensätze werden lokal geprüft.",
      "fr": "Analyse locale de tous les champs, aperçus intégrés et images imbriquées.",
      "zh-CN": "正在本地扫描所有元数据字段、内嵌预览和嵌套图片记录。"
    },
    "extracting": {
      "en": "Scanning every metadata field, embedded preview, and nested image record locally.",
      "de": "Alle Metadatenfelder, eingebetteten Vorschauen und verschachtelten Bilddatensätze werden lokal geprüft.",
      "fr": "Analyse locale de tous les champs, aperçus intégrés et images imbriquées.",
      "zh-CN": "正在本地扫描所有元数据字段、内嵌预览和嵌套图片记录。"
    },
    "building": {
      "en": "Scanning every metadata field, embedded preview, and nested image record locally.",
      "de": "Alle Metadatenfelder, eingebetteten Vorschauen und verschachtelten Bilddatensätze werden lokal geprüft.",
      "fr": "Analyse locale de tous les champs, aperçus intégrés et images imbriquées.",
      "zh-CN": "正在本地扫描所有元数据字段、内嵌预览和嵌套图片记录。"
    },
    "complete": {
      "en": "The full image scan is complete. Every safe ExifTool result is now searchable below.",
      "de": "Der vollständige Bildscan ist fertig. Alle sicheren ExifTool-Ergebnisse sind unten durchsuchbar.",
      "fr": "L’analyse complète est terminée. Tous les résultats ExifTool sûrs sont recherchables ci-dessous.",
      "zh-CN": "完整图片扫描已完成，所有安全的 ExifTool 结果都可以在下方搜索。"
    },
    "failed": {
      "en": "The full scan stopped. The browser-only report is intact and can be exported or retried.",
      "de": "Der vollständige Scan wurde gestoppt. Der Browser-Schnellbericht bleibt erhalten und kann exportiert oder erneut geprüft werden.",
      "fr": "L’analyse complète s’est arrêtée. Le rapport initial reste intact, exportable et peut être relancé.",
      "zh-CN": "完整扫描已停止，浏览器初步报告仍可使用、导出或重试。"
    },
    "canceled": {
      "en": "The full scan was canceled. The browser-only report is still usable.",
      "de": "Der vollständige Scan wurde abgebrochen. Der Browser-Schnellbericht bleibt nutzbar.",
      "fr": "L’analyse complète a été annulée. Le rapport initial reste utilisable.",
      "zh-CN": "完整扫描已取消，浏览器初步报告仍然可用。"
    }
  },
  "embedded": {
    "idle": {
      "en": "The fast report is ready. The deep engine has not started.",
      "de": "Der Schnellbericht ist fertig. Die Tiefen-Engine wurde noch nicht gestartet.",
      "fr": "Le rapport rapide est prêt. Le moteur approfondi n’a pas encore démarré.",
      "zh-CN": "快速报告已经就绪，深度引擎尚未启动。"
    },
    "loading": {
      "en": "Loading the ExifTool engine from this site. Nothing from the file leaves this tab.",
      "de": "ExifTool wird von dieser Website geladen. Nichts aus der Datei verlässt diesen Tab.",
      "fr": "Chargement d’ExifTool depuis ce site. Rien du fichier ne quitte cet onglet.",
      "zh-CN": "正在从本站加载 ExifTool 引擎，文件内容不会离开当前标签页。"
    },
    "extracting": {
      "en": "Walking tags and embedded documents locally. This is the slow pass.",
      "de": "Tags und eingebettete Dokumente werden lokal durchsucht. Dieser Durchlauf dauert länger.",
      "fr": "Lecture locale des balises et documents intégrés. C’est le passage le plus lent.",
      "zh-CN": "正在本地遍历标签和内嵌文档，这一步会慢一些。"
    },
    "building": {
      "en": "Turning native tags into searchable report rows.",
      "de": "Native Tags werden in durchsuchbare Berichtszeilen umgewandelt.",
      "fr": "Transformation des balises natives en lignes de rapport consultables.",
      "zh-CN": "正在把原生标签整理成可搜索的报告行。"
    },
    "complete": {
      "en": "Standard tags and embedded documents are in the report.",
      "de": "Standard-Tags und eingebettete Dokumente stehen im Bericht.",
      "fr": "Les balises standard et documents intégrés figurent dans le rapport.",
      "zh-CN": "标准标签和内嵌文档已加入报告。"
    },
    "failed": {
      "en": "The fast report is intact. ExifTool can be retried without choosing the file again.",
      "de": "Der Schnellbericht bleibt erhalten. ExifTool kann ohne erneute Dateiauswahl gestartet werden.",
      "fr": "Le rapport rapide reste intact. ExifTool peut être relancé sans sélectionner le fichier à nouveau.",
      "zh-CN": "快速报告仍然完整，不用重新选择文件即可重试 ExifTool。"
    },
    "canceled": {
      "en": "Deep inspection stopped. The fast browser report is still usable.",
      "de": "Die Tiefenprüfung wurde gestoppt. Der Browser-Schnellbericht bleibt nutzbar.",
      "fr": "L’inspection approfondie est arrêtée. Le rapport rapide reste utilisable.",
      "zh-CN": "深度检查已停止，快速浏览器报告仍可使用。"
    }
  },
  "standard": {
    "idle": {
      "en": "The fast report is ready. The deep engine has not started.",
      "de": "Der Schnellbericht ist fertig. Die Tiefen-Engine wurde noch nicht gestartet.",
      "fr": "Le rapport rapide est prêt. Le moteur approfondi n’a pas encore démarré.",
      "zh-CN": "快速报告已经就绪，深度引擎尚未启动。"
    },
    "loading": {
      "en": "Loading the ExifTool engine from this site. Nothing from the file leaves this tab.",
      "de": "ExifTool wird von dieser Website geladen. Nichts aus der Datei verlässt diesen Tab.",
      "fr": "Chargement d’ExifTool depuis ce site. Rien du fichier ne quitte cet onglet.",
      "zh-CN": "正在从本站加载 ExifTool 引擎，文件内容不会离开当前标签页。"
    },
    "extracting": {
      "en": "Reading every standard tag locally, including unknown and duplicate instances.",
      "de": "Alle Standard-Tags werden lokal gelesen, auch unbekannte und doppelte Instanzen.",
      "fr": "Lecture locale de toutes les balises standard, y compris les instances inconnues et dupliquées.",
      "zh-CN": "正在本地读取所有标准标签，包括未知和重复实例。"
    },
    "building": {
      "en": "Turning native tags into searchable report rows.",
      "de": "Native Tags werden in durchsuchbare Berichtszeilen umgewandelt.",
      "fr": "Transformation des balises natives en lignes de rapport consultables.",
      "zh-CN": "正在把原生标签整理成可搜索的报告行。"
    },
    "complete": {
      "en": "The full standard ExifTool field set is in the report.",
      "de": "Der vollständige ExifTool-Standardsatz steht im Bericht.",
      "fr": "Tous les champs ExifTool standard figurent dans le rapport.",
      "zh-CN": "完整标准 ExifTool 字段已经加入报告。"
    },
    "failed": {
      "en": "The fast report is intact. ExifTool can be retried without choosing the file again.",
      "de": "Der Schnellbericht bleibt erhalten. ExifTool kann ohne erneute Dateiauswahl gestartet werden.",
      "fr": "Le rapport rapide reste intact. ExifTool peut être relancé sans sélectionner le fichier à nouveau.",
      "zh-CN": "快速报告仍然完整，不用重新选择文件即可重试 ExifTool。"
    },
    "canceled": {
      "en": "Deep inspection stopped. The fast browser report is still usable.",
      "de": "Die Tiefenprüfung wurde gestoppt. Der Browser-Schnellbericht bleibt nutzbar.",
      "fr": "L’inspection approfondie est arrêtée. Le rapport rapide reste utilisable.",
      "zh-CN": "深度检查已停止，快速浏览器报告仍可使用。"
    }
  }
};
export function engineMessage(status: string, mode: string, fullImageScan: boolean, locale: Locale): string {
 const messages = engineMessages[fullImageScan ? 'full' : mode]!;
 return (messages[status] ?? messages.idle)![locale];
}
