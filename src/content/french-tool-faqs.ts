export interface LinkedFaq {
  question: string;
  before: string;
  linkText: string;
  href: string;
  after: string;
}

export const frenchToolFaqs = {
  home: [
    {
      question: 'Comment retrouver les réglages utilisés pour prendre une photo ?',
      before: 'Ouvrez le fichier d’origine pour ',
      linkText: 'lire les données EXIF',
      href: '/fr/metadata-viewer/',
      after: ' et cherchez les champs ISO, ouverture et temps de pose. Si l’un de ces champs manque, essayez l’original de l’appareil plutôt qu’une copie reçue par messagerie.',
    },
    {
      question: 'Quelle date indique le moment où la photo a été prise ?',
      before: 'Cherchez DateTimeOriginal dans le ',
      linkText: 'lecteur de métadonnées d’image',
      href: '/fr/image-metadata-viewer/',
      after: ' pour lire la date de prise de vue enregistrée par l’appareil. La date de modification du fichier peut correspondre à une retouche ou à un export ultérieur.',
    },
    {
      question: 'Comment savoir si ma photo contient une position GPS avant de la partager ?',
      before: 'Ouvrez la copie que vous allez envoyer dans le ',
      linkText: 'vérificateur de confidentialité des images',
      href: '/fr/image-privacy-checker/',
      after: ' et regardez si le rapport indique une latitude et une longitude. Même sans coordonnées enregistrées, un panneau de rue ou un monument visible peut révéler le lieu.',
    },
  ],
  metadata: [
    {
      question: 'Comment comparer les données EXIF d’un original et d’une copie reçue ?',
      before: 'Ouvrez l’original dans le ',
      linkText: 'lecteur de métadonnées d’image',
      href: '/fr/image-metadata-viewer/',
      after: ' et notez le modèle de l’appareil, la date de prise de vue et les coordonnées présentes. Ouvrez ensuite la copie et cherchez les mêmes champs pour voir lesquels ont été conservés.',
    },
    {
      question: 'Où lire le nom de l’auteur enregistré dans un PDF ?',
      before: 'Ouvrez le PDF dans le ',
      linkText: 'lecteur de métadonnées de documents',
      href: '/fr/document-metadata-viewer/',
      after: ' et cherchez le champ Author dans les propriétés PDF Info. Comparez sa valeur à celle du créateur dans XMP si les deux sont présents. Un nom repris d’un modèle peut y figurer.',
    },
    {
      question: 'Comment retrouver le modèle de l’appareil quand il manque dans le résumé ?',
      before: 'Recherchez Model dans les champs détaillés de votre ',
      linkText: 'rapport EXIF photo',
      href: '/fr/',
      after: ', puis vérifiez le groupe EXIF auquel appartient la valeur. Si la recherche ne donne rien sur une capture d’écran, refaites-la sur la photo d’origine.',
    },
  ],
  remover: [
    {
      question: 'Puis-je effacer les données GPS d’une photo sans l’envoyer sur un serveur ?',
      before: 'Oui. Ouvrez le fichier pour ',
      linkText: 'supprimer les métadonnées d’une image',
      href: '/fr/image-metadata-remover/',
      after: ' directement dans votre navigateur. Téléchargez la copie créée et vérifiez le résultat du contrôle avant de la partager.',
    },
    {
      question: 'Comment retirer le nom de l’auteur d’un PDF avant de l’envoyer ?',
      before: 'Utilisez l’outil pour ',
      linkText: 'supprimer les métadonnées d’un document',
      href: '/fr/document-metadata-remover/',
      after: ', puis examinez les propriétés de la copie obtenue. Si le nom figure aussi sur une page du PDF, il restera lisible dans le texte.',
    },
    {
      question: 'Comment vérifier ce qui reste dans la copie nettoyée ?',
      before: 'Rouvrez le fichier téléchargé pour ',
      linkText: 'consulter les métadonnées du fichier',
      href: '/fr/metadata-viewer/',
      after: ' et cherchez la valeur que vous vouliez effacer, par exemple un nom ou des coordonnées. Des propriétés techniques comme les dimensions peuvent rester nécessaires à l’affichage.',
    },
  ],
} satisfies Record<'home' | 'metadata' | 'remover', LinkedFaq[]>;

export function plainFaq({ question, before, linkText, after }: LinkedFaq) {
  return { question, answer: before + linkText + after };
}
