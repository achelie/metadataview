import type { IconName } from '../components/IconGlyph';
import type { ToolMode } from '../components/ToolWorkbench';
import { metadataViewerFaqs } from './metadata-faqs';
import type { DetectedFileType } from '../lib/metadata/types';
import type { MetadataRemovalScope } from '../lib/metadata-removal/types';
import { C2PA_ACCEPT, C2PA_FORMAT_SUMMARY } from '../lib/c2pa/formats';

export interface ToolConfig {
  title: string; metaTitle: string; description: string; path: string; eyebrow: string; icon: IconName;
  mode: ToolMode; formats: string; accept: string; allowedTypes?: DetectedFileType[]; shortDescription: string; highlights: string[];
  productionMetadataReport?: boolean;
  metadataReportScope?: 'all' | 'image';
  productionPrivacyChecker?: boolean;
  productionMetadataRemover?: boolean;
  metadataRemovalScope?: MetadataRemovalScope;
  productionC2paViewer?: boolean;
  formatGuide?: FormatGuide;
  faqDisplay?: 'accordion' | 'expanded';
  limitations: string[]; faqs: { question: string; answer: string }[];
  related: { href: string; title: string; note: string }[];
}

export interface FormatGuide {
  valueEyebrow: string;
  valueTitle: string;
  valueDescription: string;
  benefits: { href: string; icon: IconName; kicker: string; title: string; description: string; action: string }[];
  processTitle: string;
  processDescription: string;
  steps: { title: string; description: string }[];
  ctaLead: string;
  ctaLabel: string;
}

const inspectRelated = [
  { href: '/image-privacy-checker/', title: 'Image Privacy Checker', note: 'Turn metadata into an explainable risk score.' },
  { href: '/metadata-remover/', title: 'Metadata Remover', note: 'Remove writable tags without re-encoding the file.' },
  { href: '/c2pa-viewer/', title: 'C2PA Viewer', note: 'Check signed provenance separately from metadata.' },
];
const protectRelated = [
  { href: '/metadata-viewer/', title: 'Metadata Viewer', note: 'Inspect the complete file record first.' },
  { href: '/image-privacy-checker/', title: 'Privacy Checker', note: 'See which fields deserve attention.' },
  { href: '/c2pa-viewer/', title: 'C2PA Viewer', note: 'Check signed provenance separately from EXIF.' },
];

const imageGuide: FormatGuide = {
  valueEyebrow: 'WHY IT MATTERS',
  valueTitle: 'Why inspect images?',
  valueDescription: 'Image metadata can reveal GPS, camera IDs, authors, edits, and color details hidden behind the pixels.',
  benefits: [
    { href: '/image-privacy-checker/', icon: 'shield', kicker: 'Privacy check', title: 'Catch location leaks', description: 'Find GPS coordinates, owner names, serial numbers, and embedded previews before an image leaves your device.', action: 'Check image privacy' },
    { href: '#metadata-workbench-tool', icon: 'fileImage', kicker: 'Capture context', title: 'Understand the shot', description: 'Review camera, lens, exposure, orientation, dates, software, color profiles, and the exact native tag paths.', action: 'Inspect an image' },
    { href: '/image-metadata-remover/', icon: 'eraser', kicker: 'Cleaner sharing', title: 'Make a cleaner copy', description: 'Remove writable image metadata, rescan the result, and keep a verification receipt beside the download.', action: 'Remove metadata' },
  ],
  processTitle: 'How the image scan works',
  processDescription: 'The browser reads one PNG, JPEG, WebP, HEIC, TIFF, or GIF in this tab. The image and its metadata are never posted to a server.',
  steps: [
    { title: 'Choose one image', description: 'Select one PNG, JPEG, WebP, HEIC, TIFF, or GIF up to 50 MB. The source stays in browser memory.' },
    { title: 'Verify the image format', description: 'PNG/JPEG markers, RIFF, HEIF brands, TIFF byte order, and GIF headers are checked instead of trusting the extension.' },
    { title: 'Scan every metadata field', description: 'The quick browser parser responds first, then local ExifTool WASM inspects standard and embedded image records.' },
    { title: 'Build the image report', description: 'EXIF, GPS, XMP, IPTC, ICC, text chunks, hashes, and native paths become searchable sections.' },
    { title: 'Forget the image', description: 'Clear, replace, or refresh to terminate the scan, revoke the preview URL, and leave no file history.' },
  ],
  ctaLead: 'Have an image ready?',
  ctaLabel: 'Choose an image above',
};

const documentGuide: FormatGuide = {
  valueEyebrow: 'WHY IT MATTERS',
  valueTitle: 'Why inspect documents?',
  valueDescription: 'Document metadata can reveal authors, edit dates, software history, saved counts, and custom properties.',
  benefits: [
    { href: '#metadata-workbench-tool', icon: 'fileText', kicker: 'Document labels', title: 'Check authorship claims', description: 'Review title, author, subject, company, manager, keywords, and custom properties without opening the document in an office suite.', action: 'Inspect a document' },
    { href: '#metadata-workbench-tool', icon: 'scan', kicker: 'Stored statistics', title: 'Read the saved counts', description: 'See PDF pages, Word page and word counts, PowerPoint slides, or Excel worksheet totals when the package records them.', action: 'Read local fields' },
    { href: '#metadata-workbench-tool', icon: 'badge', kicker: 'Revision context', title: 'Trace the editing trail', description: 'Compare stored creation and modification dates, revision numbers, application versions, document IDs, and package details.', action: 'Audit the properties' },
  ],
  processTitle: 'How the document scan works',
  processDescription: 'The browser inspects document properties locally. It does not upload the file or extract body text, cells, slide text, notes, attachments, or media.',
  steps: [
    { title: 'Choose one document', description: 'Select a PDF, DOCX, PPTX, or XLSX up to 100 MB. Its bytes remain inside this browser tab.' },
    { title: 'Verify the real format', description: 'PDF signatures and Office ZIP content types are checked instead of trusting the extension.' },
    { title: 'Read property records', description: 'Local parsers read PDF dictionaries or OOXML Core, App, and Custom Properties without extracting visible document content.' },
    { title: 'Build the document report', description: 'ExifTool adds native fields while authoring labels, stored statistics, hashes, warnings, and exact paths become searchable.' },
    { title: 'Forget the document', description: 'Clear, replace, or refresh to stop both workers and remove the temporary in-tab report.' },
  ],
  ctaLead: 'Have a document ready?',
  ctaLabel: 'Choose a document above',
};

const videoGuide: FormatGuide = {
  valueEyebrow: 'WHY IT MATTERS',
  valueTitle: 'Why inspect video?',
  valueDescription: 'Video metadata can explain duration, dimensions, codecs, tracks, dates, and editing software.',
  benefits: [
    { href: '#metadata-workbench-tool', icon: 'film', kicker: 'Container facts', title: 'Check delivery details', description: 'Read duration, frame size, track counts, codecs, bitrate clues, brands, and rotation across nine common video extensions.', action: 'Inspect a video' },
    { href: '#metadata-workbench-tool', icon: 'scan', kicker: 'Production context', title: 'Trace stored history', description: 'Find creation dates, handler names, encoder labels, comments, and other fields left by cameras and editing tools.', action: 'Read local fields' },
    { href: '/c2pa-viewer/', icon: 'badge', kicker: 'Provenance check', title: 'Look for signed evidence', description: 'Metadata remains editable. Use the C2PA viewer when you need to check an embedded signed provenance claim.', action: 'Verify C2PA' },
  ],
  processTitle: 'How the video scan works',
  processDescription: 'The browser reads container metadata in this tab. It does not upload, play, transcribe, or analyze the video frames.',
  steps: [
    { title: 'Choose one video', description: 'Select one MP4, M4V, MOV, MKV, WebM, AVI, FLV, 3GP, or 3G2 up to 100 MB. It stays in this browser tab.' },
    { title: 'Verify the real container', description: 'ISO BMFF brands, EBML, RIFF, and FLV signatures are checked before the filename is trusted.' },
    { title: 'Read tracks and tags', description: 'Local parsers and ExifTool WASM inspect movie headers, track records, codecs, dates, and readable custom fields.' },
    { title: 'Build the video report', description: 'Duration, dimensions, codecs, tracks, hashes, warnings, and native paths become searchable and exportable.' },
    { title: 'Forget the video', description: 'Clear, replace, or refresh to terminate the task and remove the in-tab report.' },
  ],
  ctaLead: 'Have a video ready?',
  ctaLabel: 'Choose a video above',
};

const audioGuide: FormatGuide = {
  valueEyebrow: 'WHY IT MATTERS',
  valueTitle: 'Why inspect audio?',
  valueDescription: 'Audio metadata can reveal titles, credits, dates, comments, codec details, and embedded artwork.',
  benefits: [
    { href: '#metadata-workbench-tool', icon: 'audio', kicker: 'Track identity', title: 'Verify music labels', description: 'Read title, artist, album, track, disc, date, genre, composer, label, ISRC, and comments across ID3, Vorbis, iTunes, and ASF tags.', action: 'Inspect an audio file' },
    { href: '#metadata-workbench-tool', icon: 'scan', kicker: 'Technical delivery', title: 'Check the audio header', description: 'Review the real container, codec, duration, bitrate, sample rate, channels, bit depth, and lossless status.', action: 'Read local fields' },
    { href: '#metadata-workbench-tool', icon: 'fileImage', kicker: 'Embedded extras', title: 'Spot hidden attachments', description: 'See whether cover art and other binary frames exist without copying their payload into the safe report.', action: 'Check embedded data' },
  ],
  processTitle: 'How the audio scan works',
  processDescription: 'The browser reads stored tags and technical headers locally. It does not upload, play, transcribe, or fingerprint the recording.',
  steps: [
    { title: 'Choose one audio file', description: 'Select one MP3, FLAC, OGG, OPUS, OGA, M4A, AAC, WAV, or WMA up to 100 MB. It stays in this browser tab.' },
    { title: 'Verify the real container', description: 'MPEG, FLAC, Ogg, ISO BMFF, ADTS, RIFF, and ASF signatures are checked before the extension is trusted.' },
    { title: 'Read tags and headers', description: 'Local parsers and ExifTool WASM inspect available ID3, Vorbis, Opus, iTunes, RIFF, and ASF fields plus binary summaries.' },
    { title: 'Build the audio report', description: 'Track labels, technical facts, hashes, warnings, and exact native paths become searchable and exportable.' },
    { title: 'Forget the audio', description: 'Clear, replace, or refresh to stop the task and remove the temporary report.' },
  ],
  ctaLead: 'Have an audio file ready?',
  ctaLabel: 'Choose an audio file above',
};

function removalGuide(kind: string, formats: string, detail: string): FormatGuide {
  const selection = kind === 'file' ? 'Select one supported file.' : `Select a supported ${kind} file.`;
  return {
    valueEyebrow: 'WHY CLEAN IT',
    valueTitle: `Why remove ${kind} metadata?`,
    valueDescription: detail,
    benefits: [
      { href: '#metadata-workbench-tool', icon: 'eraser', kicker: 'Metadata only', title: 'Strip labels, not content', description: 'Remove writable identity, location, software, date, and custom fields without transcoding the actual file.', action: 'Clean one file' },
      { href: '#metadata-workbench-tool', icon: 'scan', kicker: 'Proof after cleanup', title: 'Trust the rescan', description: 'The generated copy is parsed again at the same depth. Removed, preserved, and residual fields stay separate.', action: 'See verification' },
      { href: '/', icon: 'badge', kicker: 'Keep the source', title: 'Download a receipt', description: 'The original never changes. Save the clean copy and a safe JSON record of every output check.', action: 'View metadata first' },
    ],
    processTitle: `How ${kind} cleanup works`,
    processDescription: `${formats} files are cleaned inside this browser tab. The selected file and generated copy are never uploaded.`,
    steps: [
      { title: 'Choose one file', description: `${selection} The bytes remain inside this browser tab.` },
      { title: 'Scan the original', description: 'The real signature, technical structure, writable metadata, and signatures are checked before cleanup.' },
      { title: 'Remove metadata locally', description: 'A format-specific engine removes descriptive tags while retaining media and document content.' },
      { title: 'Verify the output', description: 'The copy is reopened, structurally compared, and scanned again before download is enabled.' },
      { title: 'Forget the session', description: 'Clear, replace, or refresh to stop workers and release temporary browser objects.' },
    ],
    ctaLead: 'Have a file ready?',
    ctaLabel: 'Choose a file above',
  };
}

const imageRemovalGuide = removalGuide('image', 'PNG, JPEG, WebP, HEIC, TIFF, and GIF', 'Photos can carry GPS, owner names, serial numbers, edit history, and stale previews long after the pixels look harmless.');
const videoRemovalGuide = removalGuide('video', 'MP4, M4V, MOV, MKV, WebM, AVI, FLV, 3GP, and 3G2', 'Video containers can name the authoring app, device, owner, location, and edit dates without showing any of it in playback.');
const audioRemovalGuide = removalGuide('audio', 'MP3, FLAC, OGG, OPUS, OGA, M4A, AAC, WAV, and WMA', 'Audio tags can expose names, comments, software, dates, library labels, and broadcast notes around an otherwise ordinary recording.');
const documentRemovalGuide = removalGuide('document', 'PDF, DOCX, PPTX, and XLSX', 'Documents can retain authors, companies, templates, software, edit dates, revision labels, and custom properties after the visible page looks finished.');
const allRemovalGuide = removalGuide('file', 'Image, video, audio, and document', 'Choose the file you actually plan to share. The cleaner picks a format-specific engine and proves what changed.');

function makeRemovalTool(input: {
  scope: MetadataRemovalScope; title: string; metaTitle: string; path: string; eyebrow: string; icon: IconName;
  description: string; shortDescription: string; formats: string; accept: string; allowedTypes: DetectedFileType[];
  guide: FormatGuide; highlights: string[]; limitations: string[]; faqs: { question: string; answer: string }[];
}): ToolConfig {
  return {
    productionMetadataRemover: true, metadataRemovalScope: input.scope, faqDisplay: 'expanded', formatGuide: input.guide,
    title: input.title, metaTitle: input.metaTitle, path: input.path, eyebrow: input.eyebrow, icon: input.icon, mode: 'remover',
    description: input.description, shortDescription: input.shortDescription, formats: input.formats, accept: input.accept, allowedTypes: input.allowedTypes,
    highlights: input.highlights, limitations: input.limitations, faqs: input.faqs, related: protectRelated,
  };
}

export const tools: Record<string, ToolConfig> = {
  metadata: {
    productionMetadataReport: true, metadataReportScope: 'all',
    faqDisplay: 'expanded',
    title: 'Metadata Viewer', metaTitle: 'Metadata Viewer – View Hidden File Metadata Online', path: '/metadata-viewer/', eyebrow: 'Universal file inspector', icon: 'scan', mode: 'metadata',
    description: 'Open image, document, video, and audio metadata across 28 supported file formats. Search fields, copy values, and export the complete result without uploading the file.',
    shortDescription: 'Drop one supported file, then search, copy, or export every readable metadata field.',
    highlights: ['Checks the real file signature instead of trusting the extension.', 'Builds a readable summary and a complete native field ledger.', 'Calculates SHA-256 and MD5 while reading the file once.', 'Exports safe JSON and a concise PDF report.'],
    formats: 'PNG · JPG / JPEG · WebP · HEIC · TIFF · GIF · PDF · DOCX · PPTX · XLSX · MP4 · M4V · MOV · MKV · WebM · AVI · FLV · 3GP · 3G2 · MP3 · FLAC · OGG · OPUS · OGA · M4A · AAC · WAV · WMA', accept: '.png,.jpg,.jpeg,.webp,.heic,.heif,.tif,.tiff,.gif,.pdf,.docx,.pptx,.xlsx,.mp4,.m4v,.mov,.mkv,.webm,.avi,.flv,.3gp,.3g2,.mp3,.flac,.ogg,.opus,.oga,.m4a,.aac,.wav,.wma', allowedTypes: ['png','jpeg','webp','heic','tiff','gif','pdf','docx','pptx','xlsx','mp4','mov','mkv','webm','avi','flv','3gp','3g2','mp3','flac','ogg','opus','m4a','aac','wav','wma'],
    limitations: ['The 100 MB general limit keeps a damaged file from swallowing the tab.', 'Encrypted PDFs are reported, never brute-forced.', 'Metadata describes a file; it does not prove every field is accurate.'],
    faqs: [...metadataViewerFaqs], related: inspectRelated,
  },
  image: {
    productionMetadataReport: true, metadataReportScope: 'image',
    faqDisplay: 'expanded', formatGuide: imageGuide,
    title: 'Image Metadata Viewer', metaTitle: 'Image Metadata Viewer – View PNG, JPEG, WebP, HEIC, TIFF and GIF Metadata', path: '/image-metadata-viewer/', eyebrow: 'Multi-format image evidence reader', icon: 'fileImage', mode: 'metadata',
    description: 'View EXIF, GPS, XMP, IPTC, ICC, comments, animation flags, and native fields in PNG, JPEG, WebP, HEIC, TIFF, and GIF images. Everything stays in your browser.',
    shortDescription: 'Read camera, GPS, color, author, software, animation, and container data from one image.',
    highlights: ['Checks the real PNG, JPEG, WebP, HEIC, TIFF, or GIF signature.', 'Shows dimensions, animation, camera, GPS, color, authorship, and dates.', 'Keeps native ExifTool paths and unknown readable tags.', 'Falls back to a format badge when the browser cannot preview HEIC or TIFF pixels.'],
    formats: 'PNG · JPG / JPEG · WebP · HEIC · TIFF · GIF', accept: '.png,.jpg,.jpeg,.webp,.heic,.heif,.tif,.tiff,.gif,image/png,image/jpeg,image/webp,image/heic,image/heif,image/tiff,image/gif', allowedTypes: ['png','jpeg','webp','heic','tiff','gif'],
    limitations: ['Some browsers cannot preview HEIC or TIFF pixels; metadata inspection still works.', 'Image Metadata Remover supports all six image families; Privacy Checker remains focused on JPEG, PNG, and WebP.', 'Visible faces and text are pixels, not metadata, and are not analyzed.'],
    faqs: [
      { question: 'Does this upload my image?', answer: 'No. Browser parsers and ExifTool WebAssembly read the image in this tab. The file, filename, hashes, and metadata are not posted to a server or saved to a history.' },
      { question: 'Which image formats and metadata are supported?', answer: 'The viewer supports PNG, JPG/JPEG, WebP, HEIC, TIFF, and GIF up to 50 MB. It reads available EXIF, GPS, XMP, IPTC, ICC, comments, animation flags, container fields, embedded previews, and unknown readable tags.' },
      { question: 'Can this show where a photo was taken?', answer: 'Yes, when valid latitude and longitude remain in EXIF GPS. If those tags are missing or invalid, the report cannot reconstruct the location from the pixels.' },
      { question: 'Why is there no HEIC or TIFF preview?', answer: 'Chrome and some other browsers cannot decode every HEIC or TIFF pixel stream. The report can still read the file signature, dimensions, container structure, and metadata locally.' },
      { question: 'Can image metadata prove a photo is original?', answer: 'No. Camera names, dates, authors, and coordinates are editable labels. Use them as context, and check signed C2PA credentials separately when provenance matters.' },
    ], related: inspectRelated,
  },
  document: {
    productionMetadataReport: true, metadataReportScope: 'all',
    faqDisplay: 'expanded', formatGuide: documentGuide,
    title: 'Document Metadata Viewer', metaTitle: 'Document Metadata Viewer – View PDF, DOCX, PPTX and XLSX Properties', path: '/document-metadata-viewer/', eyebrow: 'Document property reader', icon: 'fileText', mode: 'metadata',
    description: 'Inspect PDF, DOCX, PPTX, and XLSX author, date, application, revision, stored statistics, custom properties, and native metadata locally in your browser.',
    shortDescription: 'Open one PDF or Office document and read the properties stored around its visible content.',
    highlights: ['Reads PDF dictionaries and OOXML Core, App, and Custom Properties.', 'Reports stored page, word, slide, note, and worksheet statistics when available.', 'Checks the real package type instead of trusting the extension.', 'Exports a safe report without body text, cells, slides, attachments, or media bytes.'],
    formats: 'PDF · DOCX · PPTX · XLSX', accept: '.pdf,.docx,.pptx,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', allowedTypes: ['pdf','docx','pptx','xlsx'],
    limitations: ['Password-protected PDFs and encrypted Office packages are not decrypted or bypassed.', 'Legacy DOC, PPT, XLS and macro-enabled DOCM, PPTM, XLSM files are outside this tool.', 'Stored authors, dates, revisions, and statistics can be missing, stale, or edited.'],
    faqs: [
      { question: 'Will my document be sent to a server?', answer: 'No. The PDF, OOXML, and ExifTool parsers run inside this browser tab. The document, filename, hashes, properties, and report are not posted to an upload endpoint.' },
      { question: 'Which document formats and properties are supported?', answer: 'The viewer supports PDF, DOCX, PPTX, and XLSX up to 100 MB. It reads available title, author, subject, keywords, dates, application, revision, company, custom properties, PDF pages, Word statistics, PowerPoint counts, Excel worksheet counts, and native ExifTool fields.' },
      { question: 'Does the viewer read document text, cells, slides, or attachments?', answer: 'No. It does not extract body text, spreadsheet values, slide text, speaker notes, attachments, embedded media, macros, OCR, or scripts. It reads document property records and safe package statistics only.' },
      { question: 'What happens with encrypted or older Office files?', answer: 'The viewer does not bypass PDF passwords or Office encryption. Legacy DOC, PPT, XLS and macro-enabled DOCM, PPTM, XLSM packages are rejected with a clear message instead of being opened.' },
      { question: 'Can author, date, or revision properties prove who made a document?', answer: 'No. These labels can be edited, copied, omitted, or left stale by an application. Treat them as useful context rather than identity or provenance proof.' },
    ], related: inspectRelated,
  },
  video: {
    productionMetadataReport: true, metadataReportScope: 'all',
    faqDisplay: 'expanded', formatGuide: videoGuide,
    title: 'Video Metadata Viewer', metaTitle: 'Video Metadata Viewer – View MP4, MOV, MKV, WebM, AVI and FLV Metadata', path: '/video-metadata-viewer/', eyebrow: 'Multi-format video container reader', icon: 'film', mode: 'metadata',
    description: 'Inspect metadata from MP4, M4V, MOV, MKV, WebM, AVI, FLV, 3GP, and 3G2 videos locally in your browser.',
    shortDescription: 'Read duration, dimensions, codecs, tracks, brands, dates, and authoring details from one video.',
    highlights: ['Checks ISO BMFF, EBML, RIFF, and FLV container signatures.', 'Summarizes duration, dimensions, codecs, frame rate, and tracks.', 'Keeps native ExifTool paths and format-specific fields.', 'Never plays, transcribes, or analyzes video frames.'],
    formats: 'MP4 · M4V · MOV · MKV · WebM · AVI · FLV · 3GP · 3G2', accept: '.mp4,.m4v,.mov,.mkv,.webm,.avi,.flv,.3gp,.3g2,video/mp4,video/x-m4v,video/quicktime,video/x-matroska,video/webm,video/x-msvideo,video/x-flv,video/3gpp,video/3gpp2', allowedTypes: ['mp4','mov','mkv','webm','avi','flv','3gp','3g2'],
    limitations: ['M4V is reported as its underlying MP4 container family.', 'Video frames, speech, faces, subtitles, and visible text are never analyzed.', 'Video playback, transcoding, repair, and metadata removal are not included.'],
    faqs: [
      { question: 'Is my video uploaded or saved?', answer: 'No. Local parsers and ExifTool WebAssembly read the video inside this browser tab. The file, filename, hashes, tags, and report are not posted to an upload endpoint or saved to a viewing history.' },
      { question: 'Which video formats and fields are supported?', answer: 'The viewer supports MP4, M4V, MOV, MKV, WebM, AVI, FLV, 3GP, and 3G2 up to 100 MB. It reads available duration, dimensions, codecs, frame rate, bitrate, tracks, brands, dates, encoder labels, comments, and native container fields.' },
      { question: 'Does the tool watch, transcribe, or fingerprint the video?', answer: 'No. It reads container boxes and stored metadata without decoding frames, recognizing faces, listening to speech, or creating a media fingerprint.' },
      { question: 'Why can a duration, codec, or stored date look wrong?', answer: 'Damaged indexes, unusual codecs, and editing software can leave stale or conflicting labels. Dates also use different time bases across containers. Treat the report as stored evidence, not a fresh media decode.' },
      { question: 'Can video metadata prove a clip is original?', answer: 'No. Container labels, dates, and encoder names are editable. A signed C2PA credential can provide stronger file-binding evidence when present, but it still has a specific scope.' },
    ], related: inspectRelated,
  },
  audio: {
    productionMetadataReport: true, metadataReportScope: 'all',
    faqDisplay: 'expanded', formatGuide: audioGuide,
    title: 'Audio Metadata Viewer', metaTitle: 'Audio Metadata Viewer – View MP3, FLAC, OGG, M4A, WAV and WMA Tags', path: '/audio-metadata-viewer/', eyebrow: 'Multi-format audio tag reader', icon: 'audio', mode: 'metadata',
    description: 'Read tags and technical metadata from MP3, FLAC, OGG, OPUS, OGA, M4A, AAC, WAV, and WMA files locally in your browser.',
    shortDescription: 'Check track labels, credits, codec, duration, bitrate, sample rate, channels, bit depth, and embedded artwork.',
    highlights: ['Reads ID3, Vorbis, Opus, iTunes, RIFF, and ASF metadata.', 'Checks the real container before trusting the extension.', 'Summarizes embedded artwork without exporting its bytes.', 'Never plays, transcribes, or fingerprints the audio.'],
    formats: 'MP3 · FLAC · OGG · OPUS · OGA · M4A · AAC · WAV · WMA', accept: '.mp3,.flac,.ogg,.opus,.oga,.m4a,.aac,.wav,.wma,audio/mpeg,audio/flac,audio/ogg,audio/opus,audio/mp4,audio/aac,audio/wav,audio/x-ms-wma', allowedTypes: ['mp3','flac','ogg','opus','m4a','aac','wav','wma'],
    limitations: ['OGA is the audio-oriented Ogg extension; the report identifies its actual Ogg codec when available.', 'Artwork and other binary payloads are summarized, not exported or rendered.', 'Audio playback, transcription, acoustic fingerprinting, and metadata removal are not included.'],
    faqs: [
      { question: 'Is my audio file uploaded or saved?', answer: 'No. The audio stays in this browser tab while local parsers read it. The file, filename, hashes, tags, and report are not uploaded or added to a listening history.' },
      { question: 'Which audio formats and tags are supported?', answer: 'The viewer supports MP3, FLAC, OGG, OPUS, OGA, M4A, AAC, WAV, and WMA up to 100 MB. It reads available ID3, Vorbis, Opus, iTunes, RIFF, and ASF tags plus technical codec fields.' },
      { question: 'Will this play, transcribe, or fingerprint the recording?', answer: 'No. It reads stored tags and headers without decoding playback audio, recognizing speech, matching a music database, or generating an acoustic fingerprint.' },
      { question: 'Why is embedded album art summarized instead of displayed?', answer: 'The safe report records the artwork format, role, and byte length without exporting the binary payload or creating another persistent image copy.' },
      { question: 'Can audio tags prove the artist or release is genuine?', answer: 'No. Titles, artists, dates, ISRC values, labels, and comments can all be edited. Treat them as file labels and technical context, not proof of authorship or ownership.' },
    ], related: inspectRelated,
  },
  privacy: {
    title: 'Image Privacy Checker', metaTitle: 'Image Privacy Checker – Detect EXIF, GPS and Hidden Metadata', path: '/image-privacy-checker/', eyebrow: 'Explainable risk scan', icon: 'shield', mode: 'privacy', productionPrivacyChecker: true, faqDisplay: 'expanded',
    description: 'Check images for GPS coordinates, device identifiers, timestamps, author information, and hidden metadata without uploading your files.',
    shortDescription: 'Check one image for location, identity, device, editing, and thumbnail clues.',
    highlights: ['Shows an initial result while one automatic full scan finishes.', 'Explains every score with the matched metadata fields.', 'Checks standard tags, embedded previews, and nested image records.', 'Creates, fully rescans, and compares a cleaned local copy.'],
    formats: 'JPEG · PNG · WebP', accept: 'image/jpeg,image/png,image/webp', allowedTypes: ['jpeg','png','webp'],
    limitations: ['A low score does not guarantee that an image is safe to share.', 'The checker does not inspect visible faces, text, reflections, or landmarks.', 'Rules explain likely exposure; they cannot know your personal threat model.'],
    faqs: [
      { question: 'Is my image uploaded or saved?', answer: 'No. The image stays in this browser tab while local Workers inspect it. The file, filename, coordinates, hashes, and report are not uploaded or added to a history.' },
      { question: 'What does the checker look for?', answer: 'It checks supported GPS, names, contact details, device and lens identifiers, original filenames, timestamps, editing history, persistent IDs, thumbnails, previews, and nested image records.' },
      { question: 'What does the 0–100 privacy score mean?', answer: 'It is a repeatable total from visible, capped rules. Exact coordinates matter more than a camera model, and duplicate copies of the same fact do not earn the same points twice.' },
      { question: 'Can it reveal exactly where a photo was taken?', answer: 'It can show stored coordinates when a valid GPS latitude and longitude pair exists. If the image has no usable GPS tags, the checker does not guess a location or contact an online map.' },
      { question: 'Does a zero score mean the image is safe to share?', answer: 'No. Zero only means the supported metadata rules found no scored evidence. Faces, text, addresses, plates, screens, reflections, and landmarks in the visible pixels can still reveal private information.' },
    ], related: protectRelated,
  },
  remover: {
    productionMetadataRemover: true, metadataRemovalScope: 'all', faqDisplay: 'expanded', formatGuide: allRemovalGuide,
    title: 'Metadata Remover', metaTitle: 'Metadata Remover — Clean Image, Video, Audio and Document Tags', path: '/metadata-remover/', eyebrow: 'All-format metadata cleaner', icon: 'eraser', mode: 'remover',
    description: 'Remove writable metadata from 28 image, video, audio, and document formats locally, then verify the generated copy before download.',
    shortDescription: 'Drop one supported file. Remove descriptive tags without re-encoding its content, then rescan the copy.',
    highlights: ['Selects a real format-specific cleanup engine.', 'Keeps media and document content intact.', 'Rescans the generated copy before download.', 'Separates removed, preserved, and residual fields.'],
    formats: 'Images · Videos · Audio · Documents', accept: '.png,.jpg,.jpeg,.webp,.heic,.heif,.tif,.tiff,.gif,.pdf,.docx,.pptx,.xlsx,.mp4,.m4v,.mov,.mkv,.webm,.avi,.flv,.3gp,.3g2,.mp3,.flac,.ogg,.opus,.oga,.m4a,.aac,.wav,.wma', allowedTypes: ['png','jpeg','webp','heic','tiff','gif','pdf','docx','pptx','xlsx','mp4','mov','mkv','webm','avi','flv','3gp','3g2','mp3','flac','ogg','opus','m4a','aac','wav','wma'] as DetectedFileType[],
    limitations: ['Required technical fields remain because deleting them would break the file.', 'Cover art, chapters, subtitles, attachments, comments, revisions, and visible content are preserved.', 'A verified cleanup does not hide people, text, locations, or other details visible in the content.'],
    faqs: [
      { question: 'Does this upload or replace my original file?', answer: 'No. Cleanup and verification run inside this browser tab. The original remains unchanged, and only a new downloadable copy is created.' },
      { question: 'Which formats can be cleaned?', answer: 'The cleaner supports six image formats, nine video formats, nine audio formats, and PDF, DOCX, PPTX, and XLSX. It checks the real signature before selecting an engine.' },
      { question: 'Will audio or video be re-encoded?', answer: 'No. Metadata-only cleanup keeps encoded media packets, tracks, chapters, subtitles, cover art, and attachments. A structural mismatch blocks the download.' },
      { question: 'Why can some metadata remain?', answer: 'Some fields are required for decoding, color, dimensions, duration, pages, or container integrity. Preserved and format-limited residual fields are listed instead of hidden.' },
      { question: 'What happens to signed files?', answer: 'Any metadata change can invalidate C2PA or document signatures. The cleaner detects likely signatures and requires a separate confirmation first.' },
    ], related: protectRelated,
  },
  imageRemover: makeRemovalTool({
    scope: 'image', title: 'Image Metadata Remover', metaTitle: 'Image Metadata Remover — Clean PNG, JPEG, WebP, HEIC, TIFF and GIF', path: '/image-metadata-remover/', eyebrow: 'Image tag scrubber', icon: 'eraser', guide: imageRemovalGuide,
    description: 'Remove writable EXIF, GPS, XMP, IPTC, MakerNote, comments, and hidden previews from PNG, JPEG, WebP, HEIC, TIFF, and GIF images without re-encoding pixels.',
    shortDescription: 'Clean six image formats while retaining ICC color, orientation, dimensions, and animation.',
    formats: 'PNG · JPG / JPEG · WebP · HEIC · TIFF · GIF', accept: '.png,.jpg,.jpeg,.webp,.heic,.heif,.tif,.tiff,.gif,image/png,image/jpeg,image/webp,image/heic,image/heif,image/tiff,image/gif', allowedTypes: ['png','jpeg','webp','heic','tiff','gif'],
    highlights: ['Removes writable image identity and location fields.', 'Keeps compressed pixels and animation intact.', 'Retains color and orientation needed for correct display.', 'Runs the same full embedded scan before and after.'],
    limitations: ['TIFF keeps structural IFD fields required to render pixels.', 'ICC color and Orientation are intentionally preserved.', 'Removing metadata cannot hide visible faces, text, plates, screens, or landmarks.'],
    faqs: [
      { question: 'Are the image pixels recompressed?', answer: 'No. This metadata-only tool edits supported metadata blocks while retaining compressed image data, dimensions, orientation, color, and animation.' },
      { question: 'Does it remove GPS and camera serial numbers?', answer: 'Writable GPS, owner, camera, lens, serial, XMP, IPTC, EXIF, MakerNote, comment, and hidden-preview records are targeted and then rescanned.' },
      { question: 'Why are ICC and Orientation preserved?', answer: 'Removing them can change color or rotate the image incorrectly. The report labels them as required technical data rather than claiming they were missed.' },
      { question: 'Does GIF animation survive?', answer: 'Yes. Animation frames, timing, transparency, and looping data are retained. Comments and writable descriptive extensions are removed.' },
      { question: 'Does zero residual metadata mean the picture is anonymous?', answer: 'No. Visible pixels and the output filename can still expose people, text, places, screens, reflections, or account information.' },
    ],
  }),
  videoRemover: makeRemovalTool({
    scope: 'video', title: 'Video Metadata Remover', metaTitle: 'Video Metadata Remover — Clean MP4, MOV, MKV, WebM, AVI and FLV Tags', path: '/video-metadata-remover/', eyebrow: 'Container tag scrubber', icon: 'film', guide: videoRemovalGuide,
    description: 'Remove writable descriptive metadata from MP4, M4V, MOV, MKV, WebM, AVI, FLV, 3GP, and 3G2 files without transcoding the video.',
    shortDescription: 'Keep tracks, codecs, chapters, subtitles, and frames while stripping writable container labels.',
    formats: 'MP4 / M4V · MOV · MKV · WebM · AVI · FLV · 3GP · 3G2', accept: '.mp4,.m4v,.mov,.mkv,.webm,.avi,.flv,.3gp,.3g2,video/mp4,video/x-m4v,video/quicktime,video/x-matroska,video/webm,video/x-msvideo,video/x-flv,video/3gpp,video/3gpp2', allowedTypes: ['mp4','mov','mkv','webm','avi','flv','3gp','3g2'],
    highlights: ['Never transcodes video or audio tracks.', 'Uses ExifTool, TagLib, RIFF, or FLV cleanup by real container.', 'Retains chapters, subtitles, cover art, and attachments.', 'Blocks output when structure or technical facts change.'],
    limitations: ['Mandatory track dates or handler labels may remain in some containers.', 'Subtitles, chapters, attachments, and visible frames are preserved.', 'Cleaning metadata does not remove faces, speech, logos, captions, or visible locations.'],
    faqs: [
      { question: 'Will the video be transcoded?', answer: 'No. The tool edits container metadata only. Encoded tracks and frames are preserved, and a changed duration, codec, dimension, or track fact blocks download.' },
      { question: 'Which video tags are removed?', answer: 'Writable titles, authors, comments, locations, software, device labels, dates, copyright, XMP, and custom container tags are targeted.' },
      { question: 'Are chapters and subtitles deleted?', answer: 'No. The selected metadata-only policy preserves chapters, subtitle tracks, attachments, cover art, and other user-visible content.' },
      { question: 'Why can MP4 or MOV fields remain?', answer: 'Some ISO BMFF values are required to address tracks or decode media. The rescan lists these as structural or residual instead of calling them removed.' },
      { question: 'Does this make the visible video private?', answer: 'No. Frames and audio can still reveal faces, voices, signs, locations, screens, captions, or account details.' },
    ],
  }),
  audioRemover: makeRemovalTool({
    scope: 'audio', title: 'Audio Metadata Remover', metaTitle: 'Audio Metadata Remover — Clean MP3, FLAC, OGG, M4A, WAV and WMA Tags', path: '/audio-metadata-remover/', eyebrow: 'Audio tag scrubber', icon: 'audio', guide: audioRemovalGuide,
    description: 'Remove ID3, Vorbis, Opus, iTunes, RIFF, BEXT, iXML, and ASF descriptive metadata from nine audio formats without re-encoding sound.',
    shortDescription: 'Strip writable audio labels while retaining sound, cover art, chapters, codec, and sample properties.',
    formats: 'MP3 · FLAC · OGG · OPUS · OGA · M4A · AAC · WAV · WMA', accept: '.mp3,.flac,.ogg,.opus,.oga,.m4a,.aac,.wav,.wma,audio/mpeg,audio/flac,audio/ogg,audio/opus,audio/mp4,audio/aac,audio/wav,audio/x-ms-wma', allowedTypes: ['mp3','flac','ogg','opus','m4a','aac','wav','wma'],
    highlights: ['Uses TagLib WASM locally in a dedicated Worker.', 'Keeps cover art and chapters by policy.', 'Removes broadcast notes and custom descriptive tags.', 'Verifies format, duration, sample rate, channels, and codec.'],
    limitations: ['Cover art and chapters are intentionally preserved.', 'Required codec headers and technical audio properties remain.', 'The tool does not edit, normalize, transcribe, fingerprint, or listen to audio.'],
    faqs: [
      { question: 'Is the sound re-encoded?', answer: 'No. TagLib changes metadata containers and returns a new file while keeping the encoded audio stream and its technical properties.' },
      { question: 'Which tags are removed?', answer: 'Titles, artists, albums, comments, dates, software, custom tags, ratings, lyrics, ID3, Vorbis comments, ASF fields, RIFF INFO, BEXT, and iXML are targeted.' },
      { question: 'Will cover art and chapters remain?', answer: 'Yes. The metadata-only policy snapshots and restores embedded pictures and supported chapter markers after descriptive fields are cleared.' },
      { question: 'Does it support broadcast WAV metadata?', answer: 'Yes. Writable RIFF INFO, BEXT, and iXML records are removed while PCM data, format, sample rate, channels, and bit depth remain.' },
      { question: 'Can cleaned audio still identify someone?', answer: 'Yes. A voice, spoken name, lyric, audible room, acoustic fingerprint, or filename can reveal information outside metadata.' },
    ],
  }),
  documentRemover: makeRemovalTool({
    scope: 'document', title: 'Document Metadata Remover', metaTitle: 'Document Metadata Remover — Clean PDF, DOCX, PPTX and XLSX Properties', path: '/document-metadata-remover/', eyebrow: 'Document property scrubber', icon: 'fileText', guide: documentRemovalGuide,
    description: 'Remove writable PDF and Office document properties locally while preserving pages, body content, cells, slides, comments, revisions, media, and attachments.',
    shortDescription: 'Clean PDF, DOCX, PPTX, and XLSX property records, then reopen and verify the generated document.',
    formats: 'PDF · DOCX · PPTX · XLSX', accept: '.pdf,.docx,.pptx,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', allowedTypes: ['pdf','docx','pptx','xlsx'],
    highlights: ['Rewrites Office property XML without reading body content.', 'Uses qpdf to omit top-level PDF Info and XMP during a full rewrite.', 'Keeps document content and embedded objects.', 'Warns before invalidating a digital signature.'],
    limitations: ['PDF page content and embedded files can carry their own metadata and are not rewritten.', 'Office comments, revisions, hidden sheets or slides, macros, and embedded objects are preserved.', 'Any existing PDF or OOXML digital signature becomes invalid after modification.'],
    faqs: [
      { question: 'Does this read or change the document body?', answer: 'No. Office cleanup rewrites property parts only. PDF cleanup rewrites top-level Info and XMP while retaining pages, forms, annotations, attachments, and visible content.' },
      { question: 'Why does PDF use qpdf instead of a normal tag edit?', answer: 'A normal PDF metadata edit is incremental and can leave the old value recoverable. qpdf omits the top-level Info and XMP dictionaries while rewriting the complete file.' },
      { question: 'Which Office properties are removed?', answer: 'Core author, title, subject, keywords, dates, revision, company, manager, application identity, template labels, and custom properties are targeted.' },
      { question: 'Are comments and tracked changes removed?', answer: 'No. They are document content under the selected metadata-only policy. The page warns that those features may still contain names or history.' },
      { question: 'What happens to digital signatures?', answer: 'Changing document bytes invalidates the existing signature. The cleaner detects likely signatures and requires explicit confirmation before creating a copy.' },
    ],
  }),
  c2pa: {
    productionC2paViewer: true,
    title: 'C2PA Viewer', metaTitle: 'C2PA Viewer — Verify Content Credentials and File Provenance', path: '/c2pa-viewer/', eyebrow: 'Cryptographic provenance check', icon: 'badge', mode: 'metadata',
    description: 'Validate C2PA Content Credentials across 20 common image, video, audio, and document formats. Check signatures, file bindings, actions, ingredients, assertions, and safe manifest data without uploading the file.',
    shortDescription: 'Drop one image, video, audio file, or PDF. Get a clear credential result and the evidence behind it.',
    highlights: ['Uses the official @contentauth browser verifier in an isolated Web Worker.', 'Checks 20 common C2PA asset formats by their real file signatures.', 'Separates a valid signature from publisher trust instead of showing one vague green badge.', 'Calculates SHA-256 and exports a safe verification receipt without source bytes.'],
    formats: C2PA_FORMAT_SUMMARY, accept: C2PA_ACCEPT,
    limitations: ['No credential does not mean a file is fake.', 'A valid signature proves file binding and claim integrity, not that every claim or visible scene is true.', 'This privacy-first verifier does not contact an external trust list or OCSP service, so publisher trust and revocation may remain not checked.'],
    faqs: [
      { question: 'What does Valid mean?', answer: 'The manifest is well formed, its signature validates, and its signed content binding matches this exact file. Publisher trust is a separate result.' },
      { question: 'Why is publisher trust Not checked?', answer: 'This privacy-first page makes no external trust-list, remote-manifest, or OCSP request. Use another conforming validator when you need a current online publisher-trust decision.' },
      { question: 'What does No Content Credentials mean?', answer: 'No embedded C2PA manifest was detected. Many genuine files have no credential, so absence is not a fake-content verdict.' },
      { question: 'Which file formats can I check?', answer: 'JPEG, PNG, WebP, GIF, TIFF, HEIC, HEIF, AVIF, JXL, DNG, ARW, NEF, SVG, MP4, MOV, AVI, MP3, M4A, WAV, and PDF are accepted after their real file signatures are checked.' },
      { question: 'Is my file uploaded?', answer: 'No. The official verifier runs in a browser Worker. The source bytes, filename, fingerprint, and manifest values are not posted to a server or stored in a history.' },
      { question: 'Can C2PA prove that content is true?', answer: 'No. A valid result proves that a signed credential still binds to this file. It cannot prove that every claim, sound, or visible scene is factually true.' },
    ], related: protectRelated,
  },
};
