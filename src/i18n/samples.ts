import type { Locale } from './core';

interface SampleMessages {
  lead: string; trySample: string; loading: string; cancel: string; retry: string; error: string;
  badge: string; metadataNote: string; c2paNote: string; source: string;
}

const messages: Record<Locale, SampleMessages> = {
  en: {
    lead: 'No image handy? Try a sample.', trySample: 'Try sample', loading: 'Loading sample…', cancel: 'Cancel', retry: 'Retry sample',
    error: 'The sample could not load. Try again or choose your own image.', badge: 'Sample image',
    metadataNote: 'The metadata and landmark coordinates were added for this demo.',
    c2paNote: 'A signed Adobe test image. This is a demonstration, not proof that the scene is true.', source: 'Source and license',
  },
  'zh-CN': {
    lead: '没有图片？先试试样例', trySample: '测试案例', loading: '正在加载样例…', cancel: '取消', retry: '重试样例',
    error: '样例加载失败，请重试或选择自己的图片。', badge: '示例图片',
    metadataNote: 'metadata 和公共地标坐标均为演示设置。',
    c2paNote: 'Adobe 带签名的测试图片，仅用于演示，不代表画面内容真实。', source: '来源与许可',
  },
  de: {
    lead: 'Kein Bild zur Hand? Teste ein Beispiel.', trySample: 'Beispiel testen', loading: 'Beispiel wird geladen…', cancel: 'Abbrechen', retry: 'Erneut versuchen',
    error: 'Das Beispiel konnte nicht geladen werden. Versuche es erneut oder wähle ein eigenes Bild.', badge: 'Beispielbild',
    metadataNote: 'Metadaten und Koordinaten einer Sehenswürdigkeit wurden für diese Demo hinzugefügt.',
    c2paNote: 'Ein signiertes Adobe-Testbild. Die Demo beweist nicht, dass der Bildinhalt wahr ist.', source: 'Quelle und Lizenz',
  },
  fr: {
    lead: 'Pas d’image ? Essayez un exemple.', trySample: 'Tester un exemple', loading: 'Chargement de l’exemple…', cancel: 'Annuler', retry: 'Réessayer',
    error: 'Impossible de charger l’exemple. Réessayez ou choisissez votre propre image.', badge: 'Image d’exemple',
    metadataNote: 'Les métadonnées et les coordonnées d’un monument ont été ajoutées pour cette démonstration.',
    c2paNote: 'Image de test Adobe signée. Cette démonstration ne prouve pas que la scène est réelle.', source: 'Source et licence',
  },
};

export const sampleMessages = (locale: Locale): SampleMessages => messages[locale];
