import type { ToolEditorialLocaleCopy, ToolEditorialSection } from './tool-editorial-types';

const section = (id: string, title: string, paragraphs: string[], fields?: ToolEditorialSection['fields'], figure?: ToolEditorialSection['figure']): ToolEditorialSection => ({ id, title, paragraphs, ...(fields ? { fields } : {}), ...(figure ? { figure } : {}) });

export const toolEditorialFr: ToolEditorialLocaleCopy = {
  home: [],
  metadata: [
    section('different-records', 'Un fichier contient plusieurs sortes de traces', [
      'Une photo, un morceau et un document peuvent tous porter un titre. Ce mot désigne pourtant des enregistrements différents. Le lecteur commun choisit le moteur adapté au vrai format, puis rassemble les valeurs dans un rapport lisible. Il ne transforme pas une propriété Word en EXIF : le chemin du champ permet toujours de retrouver son origine.',
      'Commencez par une question concrète. Vous voulez retrouver un appareil, préparer une pièce jointe ou vérifier le format livré par un prestataire ? La réponse utile ne sera pas la même. Les dimensions décrivent le contenu technique. Le nom d’auteur décrit une étiquette enregistrée. Un identifiant persistant peut relier plusieurs copies, sans prouver qui les a créées.',
    ], [
      { name: 'EXIF / XMP / IPTC', meaning: 'Réglages de prise de vue, descriptions et crédits dans les images.', caveat: 'Un export peut supprimer un groupe tout en conservant un autre.' },
      { name: 'ID3 / Vorbis / iTunes', meaning: 'Titre, artiste, album et commentaires dans les fichiers audio.', caveat: 'Ces étiquettes restent modifiables et ne prouvent pas les droits.' },
      { name: 'Info / Core / Custom', meaning: 'Propriétés enregistrées dans les PDF et documents Office.', caveat: 'Les commentaires et le texte du document appartiennent à une autre couche.' },
      { name: 'Durée / codec / pistes', meaning: 'Structure nécessaire pour lire un fichier multimédia.', caveat: 'Une donnée technique peut rester après un nettoyage volontaire.' },
    ]),
    section('where-tags-come-from', 'Qui remplit ces champs ?', [
      'L’appareil écrit souvent les premiers réglages. Un logiciel de montage ajoute son nom ou une nouvelle date. Un gestionnaire musical récupère parfois les crédits d’un catalogue. Une suite bureautique reprend les propriétés d’un modèle. Ces sources se succèdent : le rapport peut montrer une histoire partielle, avec des noms anciens qui n’appartiennent pas à l’utilisateur actuel.',
      'Pour comprendre une contradiction, comparez le groupe, le chemin et la valeur brute. Deux dates identiques à l’écran peuvent utiliser des fuseaux différents. Deux champs Author peuvent venir d’un PDF et de son paquet XMP. Garder les deux évite de choisir arbitrairement la version qui semble la plus convaincante.',
    ]),
    section('read-completion', 'Absent, illisible ou pas encore lu ?', [
      'Le premier aperçu arrive avant la fin de l’analyse approfondie. Attendez son état final avant de conclure qu’un champ manque. Une section vide signifie seulement que le lecteur n’a pas exposé de valeur dans cette section. Un avertissement, une limite de taille ou un format refusé réduit la portée de cette observation.',
      'Si un fichier semble incomplet, reprenez l’original depuis votre appareil. Renommer un fichier ne change pas sa structure. Une capture d’écran, un téléchargement ou un export peut produire un autre fichier avec un autre jeu de propriétés. Notez cette étape avant de comparer les résultats ; le lecteur ne peut pas reconstruire une étiquette disparue.',
    ]),
    section('compare-a-real-copy', 'Comparer l’original et la copie qui partira', [
      'L’exemple illustré utilise une image générée par IA avec des étiquettes ajoutées volontairement : ce n’est pas une capture d’un véritable appareil. Il montre comment lire une sortie, pas ce que tous les appareils écrivent. Faites ensuite le même exercice avec deux copies que vous contrôlez : l’original et la pièce jointe réellement destinée au partage.',
      'Pour une demande administrative par courriel, vérifiez aussi le nom du fichier et le contenu visible. Le rapport n’inspecte ni les phrases d’un PDF ni les personnes dans une image. Exportez seulement les champs utiles si vous devez expliquer une différence à un collègue. Un rapport peut contenir les informations privées que vous cherchez justement à retirer.',
      'Si vous souhaitez poursuivre avec le même fichier, utilisez l’entrée explicite vers l’outil adapté. Un passage vers le nettoyeur ne lance aucune suppression. Gardez l’original à part et relisez la copie produite avant de l’envoyer ; son format et les valeurs conservées comptent autant que le nombre de champs retirés.',
    ], undefined, { src: '/editorial/image-sample.png', alt: 'Rapport du lecteur pour une image de démonstration', caption: 'Exemple contrôlé : un rapport d’image. Les champs disponibles dépendent du fichier choisi.' }),
  ],
  image: [
    section('photo-field-map', 'Les champs à lire ensemble', [
      'Une image n’a pas une seule fiche cachée. EXIF contient surtout des réglages de prise de vue. XMP transporte des descriptions et une partie de l’historique. IPTC peut porter des crédits ou un contact. Un PNG peut aussi contenir des blocs de texte. Cherchez le renseignement qui vous intéresse dans plusieurs groupes, sans confondre des champs qui portent un nom voisin.',
      'Le résumé photo aide à commencer, mais le chemin natif explique la provenance d’une valeur. Pour une photographie destinée à une annonce, examinez la position, l’auteur et les identifiants d’appareil. Pour un problème de rendu, regardez plutôt l’orientation et le profil couleur. Ces deux usages demandent des lectures différentes du même fichier.',
    ], [
      { name: 'DateTimeOriginal', meaning: 'Date de prise de vue déclarée par l’appareil ou le logiciel.', caveat: 'Sans décalage horaire, elle ne donne pas un instant universel certain.' },
      { name: 'GPSLatitude / GPSLongitude', meaning: 'Coordonnées enregistrées dans le fichier.', caveat: 'Ce n’est pas la position actuelle de votre navigateur.' },
      { name: 'Artist / Creator / OwnerName', meaning: 'Noms et crédits issus de l’appareil ou de l’édition.', caveat: 'Un nom hérité ne prouve pas l’identité du photographe.' },
      { name: 'Orientation / ICC', meaning: 'Indications pour afficher correctement l’image et ses couleurs.', caveat: 'Les retirer sans précaution peut changer le rendu.' },
    ]),
    section('photo-writers', 'Appareil, retouche et export laissent des traces différentes', [
      'Un appareil photo inscrit généralement le modèle, l’objectif et l’exposition. Une application peut ajouter une description ou recopier des valeurs après une retouche. Le champ Software indique donc souvent un outil de passage, pas nécessairement celui qui a capturé la scène. Les numéros de série demandent aussi un examen prudent : leur présence varie selon le fabricant et le format.',
      'Pour une image HEIC reçue d’un téléphone, comparez le fichier initial et le JPEG exporté. La conversion peut déplacer les champs, changer le profil ou abandonner certaines données. Le lecteur montre la copie que vous choisissez ; il ne peut pas retrouver le contenu exact d’un original absent. Préservez les deux si cette différence est importante.',
    ]),
    section('photo-missing-fields', 'Pourquoi une date ou une position manque', [
      'Le GPS peut avoir été désactivé lors de la prise de vue, supprimé pendant un export ou jamais écrit. Une capture d’écran n’hérite pas nécessairement des données de l’image qu’elle montre. Une section vide ne prouve donc ni un nettoyage volontaire, ni une image fausse. Attendez la fin de l’analyse approfondie et lisez les avertissements avant de décider.',
      'Si une date semble incompatible avec le souvenir de la scène, comparez DateTimeOriginal, CreateDate et ModifyDate. Un logiciel peut enregistrer une date d’export alors que l’appareil conserve une date de capture. Le décalage de fuseau et une horloge mal réglée compliquent encore la lecture. Évitez de choisir automatiquement la plus ancienne comme preuve.',
    ]),
    section('photo-sample-and-sharing', 'Une lecture utile avant de partager', [
      'L’image de démonstration ci-dessous a été générée par IA et ses étiquettes ajoutées volontairement. Elle sert à repérer les familles de champs et les étapes du rapport. Elle ne représente ni une vraie prise de vue ni une enquête sur un appareil. Ouvrez ensuite votre image, cherchez les mêmes familles et comparez les valeurs présentes.',
      'Pour une photo envoyée comme pièce jointe ou ajoutée à une galerie, contrôlez la copie exacte qui partira. Une messagerie peut proposer plusieurs routes d’envoi ; ne supposez pas qu’elles conservent ou effacent les mêmes informations. Si vous testez ces routes, notez le format obtenu et relisez chaque fichier téléchargé. Inspectez aussi les visages, adresses et reflets dans les pixels.',
      'Une position mérite votre attention ? Passez au contrôle de confidentialité. Vous voulez retirer des étiquettes modifiables ? Utilisez le nettoyeur d’images puis vérifiez la copie. Les signatures C2PA relèvent d’un examen séparé. Aucune de ces étapes ne remplace votre jugement sur ce que la photographie montre.',
    ], undefined, { src: '/editorial/image-sample.png', alt: 'Exemple de lecture des métadonnées d’une image de démonstration', caption: 'Fichier de démonstration : l’exemple explique la lecture du rapport, sans représenter une photo privée.' }),
  ],
  document: [
    section('document-property-map', 'Les propriétés ne sont pas le texte du document', [
      'Le lecteur examine la fiche descriptive d’un PDF, DOCX, PPTX ou XLSX. Un titre, un auteur ou une entreprise peut y rester même si aucune page ne le montre. Ces propriétés aident à comprendre un export ou à préparer un partage. Elles ne remplacent pas la lecture du contrat, des cellules ou des diapositives : cet outil n’en extrait pas le contenu.',
      'Office conserve des propriétés communes, des statistiques enregistrées par l’application et des champs personnalisés. Un PDF peut cumuler une ancienne fiche Info et une fiche XMP. Comparez ces sources lorsque deux auteurs ou deux dates apparaissent. Le chemin du champ évite d’attribuer à la même couche des valeurs venues de parties différentes.',
    ], [
      { name: 'Author / creator / lastModifiedBy', meaning: 'Noms déclarés à la création ou à la dernière sauvegarde.', caveat: 'Un modèle ou un compte partagé peut fournir ces noms.' },
      { name: 'Creator / Producer', meaning: 'Logiciel qui crée le document ou le convertit en PDF.', caveat: 'Ce ne sont pas deux preuves indépendantes d’auteur.' },
      { name: 'Company / Manager / Custom', meaning: 'Organisation et propriétés définies par l’utilisateur.', caveat: 'Ces champs peuvent survivre à un changement de propriétaire.' },
      { name: 'Pages / Words / Slides', meaning: 'Comptages disponibles dans la structure ou les propriétés.', caveat: 'Un compteur sauvegardé n’est pas une nouvelle analyse du texte.' },
    ]),
    section('document-template-history', 'Un modèle peut raconter une ancienne histoire', [
      'Un CV créé depuis un modèle peut reprendre le nom de la personne qui a enregistré ce modèle. Un tableur collectif peut afficher le compte qui a effectué la dernière sauvegarde. Une imprimante PDF ajoute parfois son propre nom dans Producer. Ces étiquettes expliquent une étape technique ; elles ne permettent pas, seules, d’accuser quelqu’un de plagiat ou de falsification.',
      'Dans une équipe, cherchez plutôt un ensemble cohérent : application, dates enregistrées, numéro de révision et propriétés personnalisées. Comparez avec un historique de versions que vous possédez déjà. Le lecteur ne connaît pas les comptes de l’organisation et ne peut pas vérifier que le nom d’un champ correspond à une personne réelle.',
    ]),
    section('document-reading-limits', 'Fichier protégé ou lecture partielle : gardez la nuance', [
      'Un document chiffré ne devient pas lisible en changeant son extension. Le lecteur ne contourne pas les mots de passe. Les anciens formats DOC, XLS ou PPT et les paquets Office à macros ne suivent pas le même parcours que DOCX, XLSX et PPTX. Un refus indique une limite de prise en charge, pas l’absence de propriétés privées.',
      'Attendez la fin de l’analyse avant de comparer deux sorties. Si le rapport contient un avertissement, précisez-le dans votre conclusion. « Auteur non trouvé dans les propriétés lues » reste exact ; « aucun nom dans ce document » serait trop large. Les commentaires, révisions, feuilles cachées et pièces jointes peuvent contenir d’autres informations que ce lecteur ne présente pas.',
    ]),
    section('document-before-submission', 'Relire la pièce jointe d’un dossier', [
      'Le DOCX de démonstration porte le titre Synthetic review copy, l’auteur Ada Example, la société Example Studio et la propriété personnalisée Review status avec la valeur Draft. Ces valeurs sont synthétiques. Comparez les propriétés communes et personnalisées avant de choisir une copie non sensible de votre document : elles ne vivent pas dans la même partie du paquet.',
      'Comparez le DOCX de travail avec le PDF réellement envoyé. Un export peut modifier la fiche descriptive sans supprimer un commentaire déjà visible. Vérifiez donc le document dans son application habituelle et contrôlez la pièce jointe finale, pas seulement le modèle de départ. Évitez aussi de publier un rapport complet contenant les noms que vous souhaitez protéger.',
      'Le nettoyeur documentaire peut ensuite traiter les propriétés prises en charge. Il conserve le contenu et les objets incorporés ; ne le prenez pas pour un outil de caviardage. Si une signature électronique importe, gardez le document signé original et demandez une nouvelle copie appropriée avant de le modifier.',
    ], undefined, { src: '/editorial/document-sample.png', alt: 'Propriétés du DOCX synthétique Synthetic review copy', caption: 'DOCX contrôlé : Ada Example et Example Studio sont des étiquettes fictives. Le lecteur ne lit pas le texte des pages.' }),
  ],
  video: [
    section('video-container-map', 'Le conteneur raconte comment lire la vidéo', [
      'MP4 et MOV rangent les pistes, la durée et d’autres données dans des blocs. Le bloc moov décrit l’organisation du film ; certains champs descriptifs se trouvent dans des zones comme udta ou meta. MKV et WebM utilisent une autre structure. Le rapport rassemble ces informations sans lire les scènes, les sous-titres ou les conversations du clip.',
      'Une extension ne suffit pas à expliquer le contenu. Un MP4 peut porter une piste vidéo, plusieurs pistes audio ou d’autres éléments. Le codec décrit la façon dont une piste a été encodée. Le conteneur décrit son emballage. Pour résoudre un problème de livraison, commencez par cette distinction avant d’interpréter le nom du logiciel ou les dates.',
    ], [
      { name: 'Duration / Track', meaning: 'Durée et description des pistes présentes.', caveat: 'Une durée technique ne décrit pas les événements filmés.' },
      { name: 'Codec / dimensions', meaning: 'Encodage et taille de la piste vidéo.', caveat: 'Une rotation peut modifier la présentation sans inverser ces dimensions.' },
      { name: 'CreateDate / MediaCreateDate', meaning: 'Dates enregistrées au niveau du film ou des pistes.', caveat: 'Le logiciel d’export peut les réécrire ; le fuseau peut manquer.' },
      { name: 'Location / Encoder / Comment', meaning: 'Lieu, logiciel et descriptions laissés dans le conteneur.', caveat: 'Leur présence dépend de l’appareil et du parcours d’export.' },
    ]),
    section('video-camera-to-editor', 'Une caméra et un export n’écrivent pas la même chose', [
      'Le téléphone peut inscrire une position et une date. Le logiciel de montage peut ajouter un nom d’encodeur, un titre ou une nouvelle date. Une application de transfert peut encore refaire le conteneur. La chaîne visible dans le rapport reflète les traces disponibles dans la copie choisie, sans garantir une liste complète des étapes.',
      'Pour un clip vertical, examinez la rotation en plus des dimensions. Un fichier qui annonce une largeur supérieure à sa hauteur peut contenir une instruction d’affichage vertical. Modifier une description et supprimer cette instruction sont deux opérations différentes. Gardez les informations de lecture à part lorsque votre objectif consiste seulement à limiter les renseignements personnels.',
    ]),
    section('video-partial-read', 'Un champ vide n’établit pas l’origine du clip', [
      'Une vidéo sans champ Location peut ne jamais avoir reçu de coordonnées. Une copie issue d’une messagerie peut aussi différer de l’original. Le lecteur ne déduit pas la position à partir des bâtiments ou des voix. Si vous cherchez le lieu de tournage, séparez les coordonnées stockées des indices visibles que vous examinez vous-même.',
      'Attendez l’analyse approfondie et lisez ses avertissements. Un bloc endommagé, un format différent ou un fichier trop volumineux peut empêcher une lecture complète. « Rien trouvé dans les champs lus » ne signifie pas « rien n’existe ailleurs ». Le lecteur n’est pas un réparateur de vidéo et ne rétablit pas les informations perdues lors d’un ancien export.',
    ]),
    section('video-delivery-check', 'Vérifier la copie remise à un client', [
      'L’exemple utilise un conteneur MP4 synthétique : son en-tête déclare une seconde avec une échelle de temps de 1 000, mais il ne contient aucune piste multimédia réelle et ne peut pas être joué. Le rapport illustre une lecture de conteneur, pas une vidéo complète. Cette limite montre pourquoi une durée lisible ne suffit pas à prouver qu’un fichier est exploitable.',
      'Un exercice utile consiste à exporter un même court extrait avec deux profils que vous utilisez déjà. Notez le format, la rotation et les informations descriptives de chaque copie. Vous obtenez une comparaison de vos propres réglages, pas une règle générale sur tous les logiciels. Ne concluez pas qu’un encodeur absent prouve l’absence de montage.',
      'Si des étiquettes privées restent, poursuivez dans le nettoyeur vidéo puis ouvrez la copie dans votre lecteur habituel. Si la question porte sur une provenance signée, vérifiez C2PA séparément. Une date de conteneur, même très précise, n’authentifie ni un témoignage ni ce qui apparaît à l’écran.',
    ], undefined, { src: '/editorial/video-sample.png', alt: 'Lecture d’un conteneur MP4 synthétique sans pistes multimédia', caption: 'Conteneur de démonstration uniquement : durée déclarée de 1 s, aucune piste réelle, fichier non lisible comme vidéo.' }),
  ],
  audio: [
    section('audio-tag-map', 'Les crédits et le son occupent des couches différentes', [
      'Un titre de chanson ne vit pas au même endroit selon le format. Un MP3 emploie souvent des cadres ID3. FLAC et Ogg peuvent utiliser des commentaires Vorbis. M4A peut ranger des étiquettes iTunes dans son conteneur. Le lecteur affiche les valeurs disponibles et garde leur chemin pour que vous puissiez comprendre un doublon ou une différence entre deux copies.',
      'Le codec, la fréquence d’échantillonnage et les canaux décrivent le fichier sonore. Le titre, l’artiste et le commentaire décrivent sa présentation. Ces deux groupes répondent à des questions différentes. Une fréquence élevée ne prouve pas la qualité de la source ; un nom d’artiste ne prouve ni la licence ni l’identité de la voix enregistrée.',
    ], [
      { name: 'TIT2 / Title', meaning: 'Titre enregistré dans les étiquettes du morceau.', caveat: 'Le titre peut venir d’un catalogue, d’un éditeur ou d’une saisie manuelle.' },
      { name: 'TPE1 / Artist', meaning: 'Artiste ou interprète déclaré.', caveat: 'Une personne peut modifier ce texte sans modifier le son.' },
      { name: 'COMM / Comment', meaning: 'Commentaire enregistré dans un cadre ou un champ.', caveat: 'Il peut contenir un nom de projet ou une note personnelle.' },
      { name: 'APIC / Picture', meaning: 'Présence d’une illustration incorporée.', caveat: 'Une pochette peut rester un contenu identifiable, même sans étiquettes.' },
    ]),
    section('audio-writers', 'Un fichier peut reprendre les noms d’un autre projet', [
      'Un logiciel d’enregistrement peut écrire une date ou un nom d’application. Un gestionnaire musical ajoute les crédits. Un studio peut conserver une référence de session dans des champs WAV BEXT ou iXML. Une copie de démonstration réutilisée pour un nouveau projet peut donc garder une ancienne note, même lorsque le titre affiché semble correct.',
      'Pour un podcast, cherchez les noms de personnes, les commentaires et les champs de contact avant la diffusion. Regardez aussi les informations techniques demandées par la plateforme de livraison. Le lecteur ne joue pas le son et ne transcrit pas la parole : il ne peut pas repérer un nom prononcé dans l’enregistrement ou identifier un locuteur.',
    ]),
    section('audio-empty-and-incomplete', 'Pas d’étiquettes et pas de lecture complète sont deux résultats', [
      'Un AAC brut peut présenter peu de descriptions tout en contenant un son valide. Un export peut aussi oublier des étiquettes que le fichier de départ possédait. Avant de comparer, confirmez le format détecté et attendez l’analyse approfondie. Une extension renommée ou un fichier interrompu ne constitue pas une base fiable pour annoncer que tout a disparu.',
      'Un résumé d’illustration signale un contenu binaire sans recopier toute l’image dans le rapport. Il ne signifie pas que la pochette est vide. Les champs techniques nécessaires à la lecture peuvent aussi apparaître quand aucun titre n’existe. Si le rapport avertit d’une lecture partielle, gardez cette réserve dans vos notes et reprenez une copie intacte.',
    ]),
    section('audio-delivery-example', 'Préparer une démo ou une émission', [
      'Le WAV synthétique porte le titre Synthetic silence et l’artiste Ada Example. Sa structure annonce une seconde de PCM mono à 8 kHz sur 16 bits. Le rapport contient aussi un avertissement du lecteur audio : Data chunk size exceeds file size. La lecture approfondie expose des champs, mais cet avertissement reste une limite réelle ; l’exemple n’est pas une validation sans réserve.',
      'Comparez ensuite la version de travail et celle prête à partir. Un changement de conteneur peut déplacer les noms de champs sans effacer leur sens. Conservez le format, le logiciel et le parcours d’export dans votre compte rendu. Si vous envoyez un morceau à plusieurs interlocuteurs, vérifiez chaque version plutôt que de supposer qu’un réglage couvre toutes les copies.',
      'Passez au nettoyeur audio si vous devez retirer les descriptions prises en charge. Il préserve certains éléments comme les illustrations et chapitres : inspectez-les aussi lorsque la confidentialité compte. Les droits d’utilisation du son demandent vos documents de licence ; le rapport de métadonnées ne peut pas vous les donner.',
    ], undefined, { src: '/editorial/audio-sample.png', alt: 'Rapport du WAV Synthetic silence avec une limite du lecteur audio', caption: 'WAV synthétique : étiquettes fictives et avertissement de lecture visible. Le lecteur ne joue pas le son.' }),
  ],
  privacy: [
    section('privacy-evidence-map', 'Lire le risque par indice, pas seulement par score', [
      'Le score augmente lorsque les règles prises en charge trouvent des indices de confidentialité. Un nombre plus haut demande davantage d’attention. La bonne première question reste : quel champ a déclenché le résultat ? Une coordonnée précise, un nom et une date n’exposent pas la même chose. La fiche de chaque risque permet de revenir à sa valeur et à sa provenance.',
      'Une photo destinée à une annonce immobilière demande une attention particulière à la position et aux informations visibles. Une image professionnelle peut surtout poser une question de crédit ou d’identifiant d’appareil. Le score aide à organiser la lecture ; il ne mesure pas les conséquences personnelles d’un partage et ne connaît pas votre relation avec les destinataires.',
    ], [
      { name: 'Coordonnées GPS', meaning: 'Position précise enregistrée dans les propriétés.', caveat: 'Elle peut concerner la scène ou une autre étape ; elle reste sensible à vérifier.' },
      { name: 'Nom / contact', meaning: 'Auteur, propriétaire, adresse ou autre identité écrite.', caveat: 'Une ancienne valeur héritée peut encore identifier quelqu’un.' },
      { name: 'Numéro de série / ID', meaning: 'Identifiant susceptible de relier des fichiers entre eux.', caveat: 'Il ne désigne pas automatiquement une personne connue.' },
      { name: 'Aperçu / historique', meaning: 'Image incorporée ou traces d’édition supplémentaires.', caveat: 'Leur présence mérite un examen distinct des pixels principaux.' },
    ]),
    section('privacy-reading-depth', 'Attendre le scan complet change la conclusion', [
      'Le contrôle rapide et l’analyse approfondie ne parcourent pas toujours les mêmes enregistrements. Des champs supplémentaires peuvent apparaître lorsque le moteur local termine. Attendez la fin avant de préparer une copie à partager. Si une partie de la lecture échoue, le résultat doit rester assorti de cette limite ; un score faible n’efface pas un avertissement.',
      'Un score nul signifie que les règles disponibles n’ont trouvé aucun indice noté dans ce qu’elles ont lu. Il ne signifie pas que l’image est anonyme. L’outil n’examine pas les visages, plaques, adresses, documents posés sur une table ou reflets. Il ne découvre pas non plus une propriété que le format ou le moteur ne permet pas de lire.',
    ]),
    section('privacy-controlled-exercise', 'Faire un contrôle avant une publication', [
      'Le rapport illustré provient d’une image générée par IA avec des champs ajoutés pour la démonstration. Ses coordonnées représentent un lieu public d’exemple, pas une prise de vue réelle. Pour reproduire la démarche, choisissez votre fichier dans ce contrôleur, attendez le scan complet et recherchez les catégories de risques. L’exemple ne certifie pas vos propres images.',
      'Pour une annonce ou une photo envoyée à un groupe, inspectez la copie finale et l’image elle-même. Si vous testez une messagerie, comparez l’envoi comme photo et comme pièce jointe avec des fichiers non sensibles. Les résultats dépendent du parcours et de la version utilisés ; nous ne promettons pas qu’un service précis efface toujours les coordonnées.',
    ], undefined, { src: '/editorial/image-sample.png', alt: 'Métadonnées d’une image de démonstration servant à expliquer les indices de confidentialité', caption: 'Rapport du lecteur d’images sur un exemple contrôlé ; le contrôle de confidentialité examine ensuite les indices pris en charge.' }),
    section('privacy-next-choice', 'Choisir une action qui correspond au problème', [
      'Une position doit disparaître ? Créez une copie dans l’outil approprié, puis rescanez-la. Un nom doit rester pour respecter un crédit ? Conservez votre original et vérifiez ce que le nettoyage retire avant de publier. Une inquiétude porte sur un visage ou une adresse visible ? Il faut modifier les pixels dans un éditeur : retirer EXIF ne masque pas la scène.',
      'N’ouvrez une carte que si vous acceptez d’envoyer les coordonnées à OpenStreetMap. Le bouton explique cet envoi et le déclenche seulement après votre action. Le contrôle local ne demande pas votre position actuelle. Pour discuter du résultat avec quelqu’un, préférez une capture masquée ou les noms de champs ; un export détaillé peut révéler les données que vous vouliez protéger.',
      'Après le nettoyage, vérifiez les données restantes et les contrôles de sortie. Une validation incomplète ou des résidus méritent une réserve claire. Vous pouvez réduire certains indices tout en conservant d’autres ; aucune étape ne justifie de décrire automatiquement la copie comme sans risque.',
    ]),
  ],
  remover: [
    section('cleanup-policy-map', 'Supprimer une description, conserver un fichier utilisable', [
      'Le nettoyeur commun ne traite pas tous les formats avec la même opération. Une image possède des blocs de métadonnées, un morceau des étiquettes, une vidéo des descriptions de conteneur et un document des propriétés. Le moteur choisit le parcours adapté après la détection du vrai format. Une extension seule ne lui dit pas quoi supprimer.',
      'Le but consiste à produire une nouvelle copie dont les champs descriptifs pris en charge ont été retirés, tout en conservant le contenu prévu par la politique du format. Cela demande de distinguer un nom d’auteur d’une dimension, ou un commentaire d’une table qui permet de lire une piste. Tout champ restant n’est donc pas automatiquement un échec.',
    ], [
      { name: 'Retiré', meaning: 'Champ présent avant traitement et absent dans la lecture de sortie.', caveat: 'La conclusion porte sur les couches et les lecteurs contrôlés.' },
      { name: 'Conservé', meaning: 'Élément gardé volontairement pour le contenu ou le rendu.', caveat: 'Un élément conservé peut encore avoir un intérêt de confidentialité.' },
      { name: 'Résiduel', meaning: 'Information descriptive encore observée après le traitement.', caveat: 'Examinez sa valeur ; ne l’annoncez pas comme supprimée.' },
      { name: 'Contrôle incomplet', meaning: 'Une étape de vérification n’a pas fourni le résultat attendu.', caveat: 'Cela ne permet pas de garantir un nettoyage complet.' },
    ]),
    section('cleanup-content-boundary', 'Les limites varient selon ce que vous partagez', [
      'Une image peut encore montrer une adresse dans ses pixels. Une piste audio peut prononcer un nom. Une vidéo peut afficher un écran. Un document peut garder un commentaire, une révision ou une pièce jointe. Ces éléments font partie du contenu que ce nettoyeur préserve. Le retrait de propriétés n’est ni du caviardage ni une analyse du contenu visible ou audible.',
      'Des signatures numériques posent une autre question. Modifier les octets peut rompre leur lien avec le fichier. Le nettoyeur demande une confirmation lorsqu’il détecte une signature probable. Gardez une copie originale si elle doit servir de référence. Une version nettoyée ne peut pas prétendre conserver automatiquement la même preuve signée.',
    ]),
    section('cleanup-checks-first', 'Lire la vérification avant le téléchargement', [
      'La copie produite est rouverte et relue avant que vous décidiez de la télécharger. Regardez le statut général, les contrôles structurels, les avertissements et les éventuels résidus. Une baisse de taille ne constitue pas une vérification : un fichier peut perdre des octets pour plusieurs raisons, dont un dommage. Le rapport de sortie apporte une lecture plus utile.',
      'Si le format refuse le traitement, ne cherchez pas à le faire accepter en renommant le fichier. Reprenez une copie valide dans l’application d’origine. Si le résultat signale des résidus, comparez leurs chemins avec ceux de l’original. Vous pourrez alors distinguer une propriété personnelle encore présente d’une information technique nécessaire au contenu.',
    ]),
    section('cleanup-controlled-comparison', 'Un essai contrôlé avant un envoi important', [
      'L’exemple utilise un PNG synthétique de 320 × 180 pixels portant Ada Example et le commentaire Synthetic metadata cleanup sample. La sortie indique 15 champs retirés, 27 conservés et 29 résiduels. Le statut annonce une vérification avec résidus, pas une image anonyme. Ces nombres décrivent cet essai seulement ; ils ne prédisent pas le résultat de vos fichiers.',
      'Relisez ensuite la copie dans le lecteur adapté. Cherchez les propriétés que vous vouliez retirer et ouvrez le fichier dans son application habituelle. Pour un dossier envoyé à un client, contrôlez aussi le nom de la pièce jointe et son contenu. N’envoyez pas l’original par erreur simplement parce que les deux fichiers se trouvent dans le même dossier.',
      'Le reçu résume les contrôles effectués ; il ne certifie ni l’anonymat ni la vérité du document. Il peut lui-même contenir des noms de fichiers. Partagez seulement ce qui aide votre destinataire, et utilisez le passage explicite entre outils si vous devez poursuivre l’examen sans refaire votre sélection.',
    ], undefined, { src: '/editorial/cleanup-sample.png', alt: 'Nettoyage d’un PNG synthétique avec 29 champs résiduels', caption: 'PNG contrôlé : 15 champs retirés, 27 conservés, 29 résiduels. La vérification ne signifie pas anonymat.' }),
  ],
  imageRemover: [
    section('image-cleanup-records', 'EXIF n’est pas le seul endroit où chercher', [
      'Le GPS peut figurer dans EXIF, mais une description XMP peut aussi contenir un lieu. Les crédits IPTC, commentaires, noms d’auteur et données de fabricant peuvent laisser d’autres indices. Le nettoyeur vise les enregistrements descriptifs modifiables du format. Vérifiez le rapport complet : supprimer un seul champ affiché dans le résumé ne suffirait pas à décrire toutes ces couches.',
      'JPEG, PNG, WebP, HEIC, TIFF et GIF n’organisent pas leurs données de la même manière. Le parcours choisi dépend du vrai fichier. Cet outil de nettoyage des métadonnées conserve les données d’image plutôt que de réencoder les pixels. La vérification contrôle aussi des éléments de rendu comme les dimensions, l’orientation, la couleur et l’animation lorsque cela s’applique.',
    ], [
      { name: 'EXIF / GPS', meaning: 'Date, position, appareil et réglages de photographie.', caveat: 'Les champs ciblés varient selon leur présence et leur possibilité de modification.' },
      { name: 'XMP / IPTC', meaning: 'Descriptions, crédits, contacts et historique enregistré.', caveat: 'Vérifiez les éventuels résidus au lieu de supposer une suppression uniforme.' },
      { name: 'MakerNote / aperçu', meaning: 'Données spécifiques au fabricant et images incorporées.', caveat: 'Les enregistrements inconnus peuvent demander une réserve de lecture.' },
      { name: 'ICC / orientation', meaning: 'Indications importantes pour afficher la copie.', caveat: 'Les informations conservées volontairement ne sont pas des champs oubliés.' },
    ]),
    section('image-cleanup-writers', 'La retouche ajoute parfois une deuxième fiche', [
      'L’appareil écrit les premiers champs, puis un éditeur peut ajouter ses propres descriptions. Une exportation vers JPEG peut reprendre des crédits et transformer certaines valeurs. Pour une photographie issue de plusieurs applications, cherchez donc le nom ou le lieu dans les chemins natifs avant et après le traitement. Le nombre de champs supprimés n’explique pas à lui seul cette histoire.',
      'Les noms de fabricant et les réglages de prise de vue peuvent présenter moins de sensibilité qu’une coordonnée précise, mais cette appréciation dépend de votre contexte. Ne choisissez pas une copie uniquement parce qu’elle semble plus petite. Lisez ce qui reste et vérifiez si un identifiant, un crédit ou une date permet encore de relier cette image à d’autres.',
    ]),
    section('image-cleanup-verdicts', 'Une copie vérifiée peut encore demander votre attention', [
      'Le moteur rescane l’image produite et sépare les informations retirées, conservées et résiduelles. « Conservé » signifie que la politique garde un élément ; « résiduel » signale une information encore observée. Si la validation n’aboutit pas, gardez la conclusion incomplète. Aucun de ces états ne doit devenir une promesse que tous les renseignements personnels ont disparu.',
      'Une signature C2PA peut devenir invalide après un changement de métadonnées. Préservez l’original signé avant d’accepter cette modification. Le nettoyage ne masque pas les visages, plaques, documents ou reflets dans la photo. Pour ces détails, utilisez un éditeur d’image et vérifiez sa nouvelle sortie, car l’édition peut écrire de nouvelles propriétés.',
    ]),
    section('image-cleanup-sharing-example', 'Contrôler la photo qui sera vraiment publiée', [
      'L’exemple de nettoyage utilise un PNG synthétique de 320 × 180 pixels. Le résultat montre 15 champs retirés, 27 conservés et 29 résiduels, avec une conclusion qui mentionne ces résidus. Il ne garantit pas le même résultat pour un JPEG ou une autre image. Pour votre copie, examinez les propriétés d’origine puis lancez explicitement la création ; le passage depuis le lecteur ne supprime rien.',
      'Après vérification, relisez la copie et ouvrez-la à la taille où elle sera publiée. Comparez l’orientation, les couleurs et le cadrage attendu. Pour tester une messagerie, utilisez une image non sensible et récupérez la version réellement reçue. Les différents modes d’envoi peuvent produire des fichiers différents ; nous ne présumons pas leurs résultats.',
      'Gardez les noms des deux copies faciles à distinguer. Si vous avez besoin d’un contrôle de risque, poursuivez avec la copie nettoyée dans le contrôleur de confidentialité. Un score inférieur indique moins d’indices détectés, pas une image automatiquement sûre. Le dernier examen concerne toujours le fichier et les pixels que vous allez partager.',
    ], undefined, { src: '/editorial/cleanup-sample.png', alt: 'Résultat de nettoyage du PNG synthétique avec résidus', caption: 'PNG de démonstration : le résultat conserve un avertissement sur 29 résidus, sans promettre une image sans risque.' }),
  ],
  videoRemover: [
    section('video-cleanup-container', 'Nettoyer les étiquettes sans réencoder les pistes', [
      'Une vidéo combine des descriptions et une structure qui permet de lire ses pistes. Dans MP4 ou MOV, les blocs qui décrivent la durée et l’emplacement des données ne jouent pas le même rôle qu’un titre ou une position. Le nettoyeur vise les champs descriptifs pris en charge. Il préserve les pistes encodées au lieu de refaire les images et le son.',
      'Cette distinction compte pour une livraison professionnelle. Le nom d’un ancien projet peut devoir disparaître alors que la rotation du clip doit rester. Un fichier vertical peut dépendre d’une indication d’affichage enregistrée dans le conteneur. Retirer aveuglément tous les nombres ne rendrait pas la vidéo plus confidentielle ; cela pourrait simplement la rendre inutilisable.',
    ], [
      { name: 'Titre / auteur / commentaire', meaning: 'Descriptions laissées par la caméra ou le montage.', caveat: 'Les champs modifiables dépendent du conteneur réel.' },
      { name: 'Position / dates / logiciel', meaning: 'Indices de lieu, de chronologie et de parcours d’export.', caveat: 'Certains champs techniques ont un rôle différent des étiquettes libres.' },
      { name: 'Codec / piste / durée', meaning: 'Informations nécessaires à la lecture des médias.', caveat: 'Leur maintien ne signifie pas que le nettoyage a oublié un titre.' },
      { name: 'Rotation / structure', meaning: 'Organisation et présentation attendues de la vidéo.', caveat: 'La copie doit passer les contrôles avant votre téléchargement.' },
    ]),
    section('video-cleanup-capture-history', 'Le GPS du fichier ne résume pas ce qu’on voit', [
      'Un téléphone peut écrire une position ; un éditeur peut ajouter un encodeur, une date ou un commentaire de projet. Nettoyer ces propriétés réduit certaines traces du parcours de travail. Cela n’enlève pas une adresse visible sur un mur, un nom prononcé ou une carte filmée. La confidentialité du conteneur et celle des scènes exigent deux examens.',
      'Pour un extrait remis à un client, commencez par noter les propriétés que vous voulez retirer. Gardez le fichier de travail séparé et choisissez la copie finale de livraison. Le nettoyeur n’analyse ni les sous-titres ni les voix et ne décide pas quels éléments visibles doivent être masqués. Il ne remplace donc pas votre étape de montage.',
    ]),
    section('video-cleanup-validation', 'Des champs restants peuvent avoir des raisons différentes', [
      'Après le traitement, l’outil rouvre le fichier et compare les éléments contrôlés. Les étiquettes retirées, les informations volontairement conservées et les résidus apparaissent séparément. Une valeur structurelle peut rester pour la lecture. Une description personnelle résiduelle mérite une attention différente. Consultez son chemin et son explication avant de présenter la copie comme prête.',
      'Si une vérification échoue ou reste incomplète, reprenez un original intact et examinez l’avertissement. Renommer un conteneur ne change pas son organisation. Pour un fichier portant une preuve C2PA, une modification peut invalider la signature ; gardez l’original si cette preuve compte. Une taille plus faible ne prouve jamais, seule, que le nettoyage a réussi.',
    ]),
    section('video-cleanup-delivery-test', 'Un protocole court pour votre propre export', [
      'Le rapport illustré lit un conteneur MP4 synthétique sans piste multimédia réelle. Son en-tête déclare une seconde, mais le fichier n’est pas une vidéo jouable et ne montre aucun résultat de nettoyage vidéo. Pour votre propre essai, choisissez un extrait valide et non sensible. Notez une description connue, la durée et les pistes avant de comparer la copie nettoyée.',
      'Ouvrez la copie dans un lecteur vidéo et contrôlez le début, la fin, la rotation et les pistes dont vous avez besoin. Ce contrôle pratique complète les tests structurels sans transformer l’outil en lecteur de scènes. Si vous comparez plusieurs profils d’export, gardez leur version et leurs réglages : vos résultats décrivent ce protocole précis, pas tous les usages du logiciel.',
      'Avant l’envoi, vérifiez le nom du fichier et les renseignements encore présents. Vous pouvez conserver le reçu pour comprendre le traitement, mais il ne certifie pas l’anonymat. Pour une provenance signée, faites un examen séparé sur l’original. Pour un nom audible ou une adresse visible, retournez dans votre éditeur.',
    ], undefined, { src: '/editorial/video-sample.png', alt: 'Lecture initiale d’un MP4 synthétique sans pistes ni lecture vidéo', caption: 'Lecture de conteneur uniquement : aucune piste réelle et aucune preuve de nettoyage vidéo.' }),
  ],
  audioRemover: [
    section('audio-cleanup-tag-policy', 'Retirer les étiquettes sans refaire le son', [
      'Le nettoyeur audio traite les descriptions prises en charge du fichier : titre, artiste, album, commentaires et autres champs modifiables. Les formats ne les rangent pas tous au même endroit. Les cadres ID3 d’un MP3 diffèrent des commentaires Vorbis d’un FLAC ou des étiquettes d’un M4A. Le moteur détecte la structure avant de choisir son opération.',
      'La politique conserve les données sonores et les informations nécessaires à leur lecture. Elle préserve aussi les illustrations incorporées et les marqueurs de chapitres pris en charge. Ces choix évitent de détruire la présentation d’une émission, mais ils demandent votre attention si une pochette ou un chapitre contient un nom que vous ne souhaitez pas partager.',
    ], [
      { name: 'ID3 / Vorbis / iTunes', meaning: 'Descriptions du morceau et crédits enregistrés.', caveat: 'La suppression dépend des champs modifiables du vrai format.' },
      { name: 'RIFF INFO / BEXT / iXML', meaning: 'Descriptions et informations de production dans certains WAV.', caveat: 'Leur contenu peut aller au-delà du seul titre affiché.' },
      { name: 'Pochette / chapitres', meaning: 'Éléments de présentation conservés par la politique.', caveat: 'Ils peuvent encore identifier un projet ou une personne.' },
      { name: 'Canaux / fréquence / codec', meaning: 'Paramètres techniques indispensables au fichier sonore.', caveat: 'Les conserver n’équivaut pas à garder les crédits d’artiste.' },
    ]),
    section('audio-cleanup-production-notes', 'Les notes de studio méritent une recherche séparée', [
      'Un logiciel de production peut écrire des références de session dans un commentaire ou dans les champs d’un WAV de diffusion. Un gestionnaire musical peut remplir les crédits depuis un catalogue. Effacer l’artiste visible dans un lecteur ne décrit donc pas forcément toutes les propriétés du fichier. Examinez l’état initial, puis les chemins des champs réellement retirés.',
      'Pour une démo envoyée à un prestataire, cherchez le nom du projet, les contacts et les notes internes. Gardez votre fichier de production intact. Si vous devez aussi masquer une voix, une adresse prononcée ou un indicatif sonore, il faut éditer l’enregistrement. Ce nettoyeur ne joue pas le son, ne transcrit pas la parole et ne modifie pas son contenu.',
    ]),
    section('audio-cleanup-checks', 'Le rapport de sortie compte plus que la taille', [
      'L’outil relit la copie et sépare les informations supprimées, conservées et résiduelles. Il contrôle la structure et les éléments prévus par son parcours. Si des résidus restent, examinez-les ; s’ils concernent une description privée, ne les présentez pas comme effacés. Un contrôle inachevé demande la même prudence, même si l’application peut ouvrir le fichier.',
      'Une différence de taille ne mesure ni la qualité sonore ni la confidentialité. Un fichier peut garder sa taille tout en perdant une étiquette. Il peut aussi devenir plus petit pour une raison sans rapport avec votre objectif. Comparez les champs et les contrôles, pas seulement les octets. Une signature présente peut devenir invalide après une modification.',
    ]),
    section('audio-cleanup-demo-protocol', 'Vérifier une version de diffusion', [
      'L’exemple illustré lit le WAV Synthetic silence avant traitement. L’artiste Ada Example est fictif et le lecteur signale Data chunk size exceeds file size. Cette sortie illustre une limite de lecture, sans prouver un nettoyage audio. Pour votre essai, prenez un fichier valide et non sensible, notez ses descriptions, sa pochette et ses chapitres avant de lancer le traitement.',
      'Après la vérification, relisez la copie dans le lecteur audio et ouvrez-la dans votre application habituelle. Contrôlez la durée attendue, les canaux et les éléments de présentation que vous souhaitez garder. Si une pochette contient une ancienne identité, le maintien volontaire de cette image mérite une autre action ; le compteur des étiquettes supprimées ne répond pas à cette question.',
      'Pour une émission ou une livraison musicale, vérifiez séparément vos crédits et vos licences avant de retirer des mentions. Le nettoyage ne vous donne aucun droit sur le son. Gardez des noms de fichiers distincts pour l’original et la version de diffusion, puis choisissez explicitement laquelle partira chez votre destinataire.',
    ], undefined, { src: '/editorial/audio-sample.png', alt: 'Lecture initiale du WAV synthétique avec avertissement audio', caption: 'État initial avec une limite du lecteur audio ; ce n’est pas un résultat de nettoyage.' }),
  ],
  documentRemover: [
    section('document-cleanup-property-layers', 'Nettoyer la fiche, pas caviarder le document', [
      'Le nettoyeur traite les propriétés prises en charge des PDF, DOCX, PPTX et XLSX. Pour Office, il réécrit les parties de propriétés communes, d’application et personnalisées. Pour PDF, il retire les fiches Info et XMP de premier niveau dans une réécriture complète. Ces opérations visent les étiquettes du document, sans rechercher des noms dans les paragraphes ou les cellules.',
      'Cette limite est essentielle pour un CV, un devis ou un dossier administratif. Un nom peut figurer dans Author, mais aussi dans un commentaire, une révision ou le texte visible. Le retrait du premier ne masque pas les autres. Conservez un contrôle distinct du contenu dans votre application bureautique avant de décider que la copie convient à un envoi.',
    ], [
      { name: 'PDF Info / XMP', meaning: 'Fiches descriptives de premier niveau du PDF.', caveat: 'Les pages et fichiers incorporés peuvent contenir leurs propres informations.' },
      { name: 'Office Core', meaning: 'Auteur, titre, dates et propriétés communes.', caveat: 'Le texte et les révisions ne font pas partie de cette fiche.' },
      { name: 'Office App / Custom', meaning: 'Propriétés de l’application et champs définis par l’utilisateur.', caveat: 'Les statistiques techniques conservées ont un rôle distinct des noms.' },
      { name: 'Commentaires / pièces jointes', meaning: 'Contenus supplémentaires que la politique conserve.', caveat: 'Ils ne deviennent pas anonymes après le retrait des propriétés.' },
    ]),
    section('document-cleanup-pdf-rewrite', 'Pourquoi le parcours PDF réécrit le fichier', [
      'Certaines modifications PDF ajoutent une nouvelle version à la fin du fichier et peuvent laisser l’ancienne propriété récupérable. Le parcours qpdf du site réécrit le PDF en omettant les fiches ciblées de premier niveau. Cette différence explique pourquoi le traitement ne se résume pas à remplacer le mot Author par une chaîne vide.',
      'Cela ne signifie pas que chaque objet incorporé a été nettoyé. Les pages, formulaires, annotations et pièces jointes restent dans le périmètre de contenu conservé. Une image incluse peut avoir sa propre fiche ; une annotation peut contenir un nom. Si votre objectif exige leur retrait, utilisez une application adaptée puis contrôlez le nouvel export.',
    ]),
    section('document-cleanup-signatures-and-errors', 'La signature et la vérification demandent une vraie décision', [
      'Modifier un PDF signé ou un paquet Office signé invalide sa signature existante. Gardez l’original et lisez la confirmation avant de poursuivre. Pour un document contractuel, une copie nettoyée n’a pas automatiquement la valeur du fichier signé. Si nécessaire, demandez une nouvelle version à son émetteur plutôt que d’essayer de préserver une signature après modification.',
      'Le traitement ne contourne ni chiffrement ni mot de passe. Il refuse les formats non pris en charge au lieu de promettre une suppression partielle invisible. Après traitement, lisez les contrôles, les résidus et les avertissements. Une copie qui s’ouvre encore peut présenter une validation incomplète ; sa seule ouverture ne prouve pas que toutes les propriétés ciblées ont disparu.',
    ]),
    section('document-cleanup-submission-protocol', 'Contrôler une copie avant de la joindre à un message', [
      'Le DOCX illustré porte le titre Synthetic review copy, l’auteur Ada Example et la propriété personnalisée Review status avec la valeur Draft. Ces étiquettes fictives permettent de repérer deux couches avant le nettoyage. L’image montre une lecture initiale, pas une sortie nettoyée. Pour votre essai, utilisez une copie non sensible et comparez ensuite ses propriétés réellement produites.',
      'Comparez les propriétés après traitement et ouvrez la copie dans votre lecteur PDF ou votre suite Office. Contrôlez les pages, cellules ou diapositives dont vous avez besoin. Inspectez manuellement les commentaires, révisions et objets incorporés si la confidentialité compte. Cette étape traite le contenu conservé que la table des propriétés ne peut pas résumer.',
      'Pour un dossier administratif ou une candidature, vérifiez enfin le nom de la pièce jointe et le fichier réellement sélectionné dans votre messagerie. Gardez l’original à part. Le reçu aide à documenter le traitement ; il ne certifie pas l’absence de toute donnée personnelle ni l’authenticité d’un document modifié.',
    ], undefined, { src: '/editorial/document-sample.png', alt: 'Propriétés initiales du DOCX synthétique Synthetic review copy', caption: 'Lecture initiale du DOCX : propriétés communes et personnalisées, sans démonstration de nettoyage documentaire.' }),
  ],
  c2pa: [
    section('c2pa-separate-checks', 'Lire plusieurs contrôles derrière un résultat', [
      'Une Content Credential contient des déclarations signées liées à un fichier. Le lecteur distingue la liaison au contenu, la signature et la confiance accordée à l’émetteur. Ces contrôles répondent à des questions différentes. Une signature mathématiquement valide ne transforme pas chaque déclaration en vérité, et un nom d’émetteur affiché ne prouve pas à lui seul son identité.',
      'Le site effectue une vérification cryptographique locale avec sa politique déclarée. Il ne configure pas de liste de confiance des éditeurs et ne consulte pas de liste externe ou de service de révocation des certificats. Les contrôles non effectués doivent rester visibles ; le résultat ne remplace pas une évaluation externe complète de la confiance dans l’émetteur.',
    ], [
      { name: 'Liaison au fichier', meaning: 'Vérifie que la déclaration correspond aux données du fichier choisi.', caveat: 'Elle ne démontre pas que la scène représentée a réellement eu lieu.' },
      { name: 'Signature', meaning: 'Examine la preuve cryptographique associée à la déclaration.', caveat: 'Sa validité ne suffit pas à établir la confiance dans l’émetteur.' },
      { name: 'Actions / ingrédients', meaning: 'Étapes et éléments sources déclarés dans la provenance.', caveat: 'Le lecteur présente les déclarations disponibles, pas toute l’histoire réelle.' },
      { name: 'Aucune credential trouvée', meaning: 'Aucun manifeste incorporé n’a été détecté par ce parcours.', caveat: 'Ce résultat ne signifie ni faux, ni jamais modifié, ni signature invalide.' },
    ]),
    section('c2pa-who-writes-the-story', 'La provenance décrit ce qu’un outil a déclaré', [
      'Une application compatible peut écrire des actions, des ingrédients et son nom de générateur. Un appareil ou un éditeur peut signer une étape dans la chaîne. Relisez ces informations avec leur portée : une action d’export ne renseigne pas forcément sur toute la création initiale. Les dates et noms inclus demandent le même soin que les autres déclarations du manifeste.',
      'Les champs EXIF et les Content Credentials remplissent des rôles distincts. EXIF peut conserver une date modifiable ; C2PA peut vérifier la liaison d’une déclaration signée au fichier. Si vous comparez les deux, ne choisissez pas automatiquement celle qui paraît plus détaillée. Cherchez la question exacte que chaque donnée permet de traiter.',
    ]),
    section('c2pa-absence-and-failure', 'Absence, format refusé et échec ne sont pas synonymes', [
      'Beaucoup de fichiers authentiques n’ont jamais reçu de credential. Un export peut aussi produire une copie sans le manifeste de départ. Le lecteur local ne cherche pas automatiquement une provenance distante. L’absence de manifeste incorporé réduit donc l’information disponible ; elle ne permet pas de conclure que le contenu est fabriqué ou qu’il n’a jamais été édité.',
      'Un format refusé ou un contrôle non effectué exprime une limite différente d’une signature qui échoue. Ouvrez les détails si vous devez comprendre le diagnostic, puis conservez la distinction dans votre note. Ne rassemblez pas tous ces résultats sous « faux fichier ». La portée d’un contrôle incomplet reste plus étroite qu’un verdict sur la scène, la voix ou le texte.',
    ]),
    section('c2pa-controlled-reading', 'Comparer une source et sa copie sans surinterpréter', [
      'L’exemple ci-dessous utilise un JPEG non signé et montre le résultat réel « aucune Content Credential trouvée ». Ce n’est ni une signature valide ni une signature qui échoue. Il aide à lire une absence sans accuser le contenu d’être faux. Pour votre examen, gardez la source intacte et notez séparément la présence d’un manifeste et les contrôles effectivement réalisés.',
      'Si une preuve signée compte dans votre échange, évitez de nettoyer les métadonnées avant cet examen : un changement peut rompre la signature ou la liaison. Vous pouvez exporter un reçu pour préciser le fichier et les contrôles. Le reçu ne remplace pas l’original et ne confirme pas les affirmations qui dépassent le périmètre de la vérification locale.',
      'Pour une publication, combinez ce résultat avec vos sources et votre connaissance du contexte. Une credential valide peut aider à discuter de provenance ; elle ne décide pas si une information est exacte ou trompeuse. Une absence de credential appelle une vérification par d’autres moyens, sans accusation automatique.',
    ], undefined, { src: '/editorial/c2pa-sample.png', alt: 'Résultat sans Content Credential sur un JPEG de démonstration non signé', caption: 'JPEG non signé : aucune credential trouvée. Ce résultat ne signifie ni faux contenu ni échec d’une signature.' }),
  ],
};
