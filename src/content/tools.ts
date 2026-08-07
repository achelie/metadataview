import type { IconName } from '../components/IconGlyph';
import type { ToolMode } from '../components/ToolWorkbench';
import { metadataViewerFaqs } from './metadata-faqs';
import type { DetectedFileType } from '../lib/metadata/types';

export interface ToolConfig {
  title: string; metaTitle: string; description: string; path: string; eyebrow: string; icon: IconName;
  mode: ToolMode; formats: string; accept: string; allowedTypes?: DetectedFileType[]; shortDescription: string; highlights: string[];
  productionMetadataReport?: boolean;
  metadataReportScope?: 'all' | 'image';
  productionPrivacyChecker?: boolean;
  productionMetadataRemover?: boolean;
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
  { href: '/metadata-remover/', title: 'Metadata Remover', note: 'Re-encode an image without the hidden baggage.' },
  { href: '/c2pa-viewer/', title: 'C2PA Viewer', note: 'Check signed provenance separately from metadata.' },
];
const protectRelated = [
  { href: '/metadata-viewer/', title: 'Metadata Viewer', note: 'Inspect the complete file record first.' },
  { href: '/image-privacy-checker/', title: 'Privacy Checker', note: 'See which fields deserve attention.' },
  { href: '/c2pa-viewer/', title: 'C2PA Viewer', note: 'Check signed provenance separately from EXIF.' },
];

const imageGuide: FormatGuide = {
  valueEyebrow: 'WHY IMAGE METADATA MATTERS',
  valueTitle: 'See what travels with an image.',
  valueDescription: 'A photo can carry location, camera, color, authorship, and editing details long after the pixels look finished.',
  benefits: [
    { href: '/image-privacy-checker/', icon: 'shield', kicker: 'Privacy check', title: 'Catch location leaks', description: 'Find GPS coordinates, owner names, serial numbers, and embedded previews before an image leaves your device.', action: 'Check image privacy' },
    { href: '#metadata-workbench-tool', icon: 'fileImage', kicker: 'Capture context', title: 'Understand the shot', description: 'Review camera, lens, exposure, orientation, dates, software, color profiles, and the exact native tag paths.', action: 'Inspect an image' },
    { href: '/metadata-remover/', icon: 'eraser', kicker: 'Cleaner sharing', title: 'Make a cleaner copy', description: 'Remove writable image metadata, rescan the result, and keep a verification receipt beside the download.', action: 'Remove metadata' },
  ],
  processTitle: 'How the image scan works',
  processDescription: 'The browser reads one JPEG, PNG, or WebP in this tab. The image and its metadata are never posted to a server.',
  steps: [
    { title: 'Choose one image', description: 'Select a JPEG, PNG, or WebP up to 50 MB. The source stays in browser memory.' },
    { title: 'Verify the image format', description: 'The file signature, dimensions, and container structure are checked instead of trusting the extension.' },
    { title: 'Scan every metadata field', description: 'The quick browser parser responds first, then local ExifTool WASM inspects standard and embedded image records.' },
    { title: 'Build the image report', description: 'EXIF, GPS, XMP, IPTC, ICC, text chunks, hashes, and native paths become searchable sections.' },
    { title: 'Forget the image', description: 'Clear, replace, or refresh to terminate the scan, revoke the preview URL, and leave no file history.' },
  ],
  ctaLead: 'Have an image ready?',
  ctaLabel: 'Choose an image above',
};

const documentGuide: FormatGuide = {
  valueEyebrow: 'WHY DOCUMENT METADATA MATTERS',
  valueTitle: 'Read the properties behind the pages, slides, and sheets.',
  valueDescription: 'A document can carry names, dates, application history, revision labels, and custom properties that never appear in the visible content.',
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
  valueEyebrow: 'WHY VIDEO METADATA MATTERS',
  valueTitle: 'Inspect the container around the frames.',
  valueDescription: 'An MP4 can reveal duration, dimensions, codecs, track layout, brands, dates, and authoring software without playing a second of video.',
  benefits: [
    { href: '#metadata-workbench-tool', icon: 'film', kicker: 'Container facts', title: 'Check delivery details', description: 'Read duration, frame size, compatible brands, track counts, codecs, bitrate clues, and rotation from the MP4 container.', action: 'Inspect an MP4' },
    { href: '#metadata-workbench-tool', icon: 'scan', kicker: 'Production context', title: 'Trace stored history', description: 'Find creation dates, handler names, encoder labels, comments, and other fields left by cameras and editing tools.', action: 'Read local fields' },
    { href: '/c2pa-viewer/', icon: 'badge', kicker: 'Provenance check', title: 'Look for signed evidence', description: 'Metadata remains editable. Use the C2PA viewer when you need to check an embedded signed provenance claim.', action: 'Verify C2PA' },
  ],
  processTitle: 'How the MP4 scan works',
  processDescription: 'The browser reads container metadata in this tab. It does not upload, play, transcribe, or analyze the video frames.',
  steps: [
    { title: 'Choose one MP4', description: 'Select one MP4 up to 100 MB. No media bytes are sent to an upload endpoint.' },
    { title: 'Verify the container', description: 'The file signature and MP4 box structure are checked before metadata parsing begins.' },
    { title: 'Read tracks and tags', description: 'Local parsers and ExifTool WASM inspect movie headers, track records, brands, dates, and readable custom fields.' },
    { title: 'Build the video report', description: 'Duration, dimensions, codecs, tracks, hashes, warnings, and native paths become searchable and exportable.' },
    { title: 'Forget the video', description: 'Clear, replace, or refresh to terminate the task and remove the in-tab report.' },
  ],
  ctaLead: 'Have a video ready?',
  ctaLabel: 'Choose an MP4 above',
};

const audioGuide: FormatGuide = {
  valueEyebrow: 'WHY AUDIO METADATA MATTERS',
  valueTitle: 'Read the tags around the sound.',
  valueDescription: 'An MP3 can carry track labels, credits, dates, comments, technical headers, and embedded artwork that never appear in its filename.',
  benefits: [
    { href: '#metadata-workbench-tool', icon: 'audio', kicker: 'Track identity', title: 'Verify music labels', description: 'Read title, artist, album, album artist, track, disc, year, genre, composer, and comment fields from ID3 tags.', action: 'Inspect an MP3' },
    { href: '#metadata-workbench-tool', icon: 'scan', kicker: 'Technical delivery', title: 'Check the audio header', description: 'Review duration, bitrate, sample rate, channel mode, MPEG version, encoder information, and file fingerprints.', action: 'Read local fields' },
    { href: '#metadata-workbench-tool', icon: 'fileImage', kicker: 'Embedded extras', title: 'Spot hidden attachments', description: 'See whether cover art and other binary frames exist without copying their payload into the safe report.', action: 'Check embedded data' },
  ],
  processTitle: 'How the MP3 scan works',
  processDescription: 'The browser reads stored tags and technical headers locally. It does not upload, play, transcribe, or fingerprint the song.',
  steps: [
    { title: 'Choose one MP3', description: 'Select one MP3 up to 100 MB. The audio stays in the current browser tab.' },
    { title: 'Verify the audio format', description: 'ID3 and MPEG signatures are checked before the page trusts the extension or MIME label.' },
    { title: 'Read tags and headers', description: 'Local parsers and ExifTool WASM inspect ID3 frames, MPEG details, comments, credits, and binary summaries.' },
    { title: 'Build the audio report', description: 'Track labels, technical facts, hashes, warnings, and exact native paths become searchable and exportable.' },
    { title: 'Forget the audio', description: 'Clear, replace, or refresh to stop the task and remove the temporary report.' },
  ],
  ctaLead: 'Have an audio file ready?',
  ctaLabel: 'Choose an MP3 above',
};

export const tools: Record<string, ToolConfig> = {
  metadata: {
    productionMetadataReport: true, metadataReportScope: 'all',
    faqDisplay: 'expanded',
    title: 'Metadata Viewer', metaTitle: 'Metadata Viewer – View Hidden File Metadata Online', path: '/metadata-viewer/', eyebrow: 'Universal file inspector', icon: 'scan', mode: 'metadata',
    description: 'Open JPEG, PNG, WebP, PDF, DOCX, PPTX, XLSX, MP4, or MP3 metadata in your browser. Search fields, copy values, and export the complete result without uploading the file.',
    shortDescription: 'Drop one supported file, then search, copy, or export every readable metadata field.',
    highlights: ['Checks the real file signature instead of trusting the extension.', 'Builds a readable summary and a complete native field ledger.', 'Calculates SHA-256 and MD5 while reading the file once.', 'Exports safe JSON and a concise PDF report.'],
    formats: 'JPEG · PNG · WebP · PDF · DOCX · PPTX · XLSX · MP4 · MP3', accept: '.jpg,.jpeg,.png,.webp,.pdf,.docx,.pptx,.xlsx,.mp4,.mp3', allowedTypes: ['jpeg','png','webp','pdf','docx','pptx','xlsx','mp4','mp3'],
    limitations: ['The 100 MB general limit keeps a damaged file from swallowing the tab.', 'Encrypted PDFs are reported, never brute-forced.', 'Metadata describes a file; it does not prove every field is accurate.'],
    faqs: [...metadataViewerFaqs], related: inspectRelated,
  },
  image: {
    productionMetadataReport: true, metadataReportScope: 'image',
    faqDisplay: 'expanded', formatGuide: imageGuide,
    title: 'Image Metadata Viewer', metaTitle: 'Image Metadata Viewer – View EXIF, GPS, PNG and WebP Metadata', path: '/image-metadata-viewer/', eyebrow: 'Image evidence reader', icon: 'fileImage', mode: 'metadata',
    description: 'View EXIF, GPS, XMP, IPTC, ICC, PNG text chunks, and WebP metadata in JPEG, PNG, and WebP images. Everything stays in your browser.',
    shortDescription: 'Read EXIF, GPS, color, author, software, and native application data from one image.',
    highlights: ['Reads JPEG, PNG, and WebP container metadata.', 'Shows camera, GPS, color profile, authorship, and dates.', 'Keeps native ExifTool paths and unknown readable tags.', 'Links privacy-sensitive fields to the dedicated checker.'],
    formats: 'JPEG · PNG · WebP', accept: 'image/jpeg,image/png,image/webp', allowedTypes: ['jpeg','png','webp'],
    limitations: ['A field can be missing because the camera never wrote it or an editor already removed it.', 'Visible faces and text are pixels, not metadata, and are not analyzed.', 'Metadata can be edited or forged, so treat it as context rather than proof.'],
    faqs: [
      { question: 'Does this upload my image?', answer: 'No. Browser parsers and ExifTool WebAssembly read the image in this tab. The file, filename, hashes, and metadata are not posted to a server or saved to a history.' },
      { question: 'Which image formats and metadata are supported?', answer: 'The viewer supports JPEG, PNG, and WebP. It reads available EXIF, GPS, XMP, IPTC, ICC, PNG text, WebP container fields, embedded previews, and unknown readable tags.' },
      { question: 'Can this show where a photo was taken?', answer: 'Yes, when valid latitude and longitude remain in EXIF GPS. If those tags are missing or invalid, the report cannot reconstruct the location from the pixels.' },
      { question: 'Why are camera or GPS fields missing?', answer: 'The camera may never have written them, an editor may have removed them, or the format may store them differently. A missing field does not prove it never existed.' },
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
    title: 'Video Metadata Viewer', metaTitle: 'Video Metadata Viewer – Inspect MP4 File Information', path: '/video-metadata-viewer/', eyebrow: 'MP4 container inspector', icon: 'film', mode: 'metadata',
    description: 'Inspect MP4 duration, dimensions, codecs, tracks, brands, creation dates, and readable authoring details without uploading the video.',
    shortDescription: 'Read MP4 duration, dimensions, codecs, tracks, brands, and stored dates.',
    highlights: ['Inspects MP4 container boxes without analyzing frames.', 'Summarizes duration, dimensions, codecs, and tracks.', 'Reports compatible brands and stored authoring details.', 'Runs the parser away from the main UI thread.'],
    formats: 'MP4', accept: '.mp4,video/mp4', allowedTypes: ['mp4'],
    limitations: ['Only MP4 containers are in scope; MKV, MOV variants, and AVI are not promised.', 'Video frames and audio speech are never analyzed.', 'Metadata removal for video is not part of this MVP.'],
    faqs: [
      { question: 'Is the MP4 uploaded anywhere?', answer: 'No. The browser reads the MP4 locally. The video, filename, hashes, container tags, and report are not sent to an upload endpoint.' },
      { question: 'Which video formats are supported?', answer: 'This page supports MP4 containers up to 100 MB. It does not promise MOV, MKV, AVI, WebM, or files that only use an MP4-looking extension.' },
      { question: 'Does the tool watch, transcribe, or fingerprint the video?', answer: 'No. It reads container boxes and stored metadata without decoding frames, recognizing faces, listening to speech, or creating a media fingerprint.' },
      { question: 'Why can the stored creation date look wrong?', answer: 'MP4 dates may use a different epoch or time basis, and editing software can rewrite them. They are useful clues, not guaranteed capture times.' },
      { question: 'Can MP4 metadata prove a video is original?', answer: 'No. Container labels and dates are editable. A signed C2PA credential can provide stronger file-binding evidence, but even that does not prove every visible claim is true.' },
    ], related: inspectRelated,
  },
  audio: {
    productionMetadataReport: true, metadataReportScope: 'all',
    faqDisplay: 'expanded', formatGuide: audioGuide,
    title: 'Audio Metadata Viewer', metaTitle: 'Audio Metadata Viewer – View MP3 Tags and File Details', path: '/audio-metadata-viewer/', eyebrow: 'ID3 tag reader', icon: 'audio', mode: 'metadata',
    description: 'Read MP3 title, artist, album, year, genre, track, comments, cover-art presence, duration, bitrate, and sample rate in your browser.',
    shortDescription: 'Read MP3 tags, duration, bitrate, sample rate, and cover-art presence.',
    highlights: ['Reads common ID3 tags and MPEG technical details.', 'Reports title, artist, album, dates, comments, and genre.', 'Detects embedded cover art without exporting its bytes.', 'Never plays or fingerprints the audio.'],
    formats: 'MP3', accept: '.mp3,audio/mpeg', allowedTypes: ['mp3'],
    limitations: ['This MVP supports MP3, not FLAC, WAV, AAC, or Ogg.', 'Lyrics and embedded artwork bytes are not rendered.', 'Audio metadata removal is intentionally not included.'],
    faqs: [
      { question: 'Is the MP3 uploaded or saved?', answer: 'No. The audio stays in this browser tab while local parsers read it. The file, filename, hashes, tags, and report are not uploaded or added to a listening history.' },
      { question: 'Which MP3 tags does the viewer read?', answer: 'It reads available ID3 title, artist, album, album artist, track, disc, year, genre, composer, comments, encoder labels, and technical MPEG information.' },
      { question: 'Will this play, transcribe, or fingerprint the song?', answer: 'No. It reads stored tags and technical headers without playing audio, recognizing speech, matching a music database, or generating an acoustic fingerprint.' },
      { question: 'Why is embedded album art summarized instead of displayed?', answer: 'The safe report records the artwork type and size without exporting the binary payload or creating another persistent copy of the image.' },
      { question: 'Can ID3 tags be wrong?', answer: 'Yes. Anyone with a tag editor can change the title, artist, year, genre, or comments. Use those fields as file labels rather than proof of authorship or ownership.' },
    ], related: inspectRelated,
  },
  privacy: {
    title: 'Image Privacy Checker', metaTitle: 'Image Privacy Checker – Detect EXIF, GPS and Hidden Metadata', path: '/image-privacy-checker/', eyebrow: 'Explainable risk scan', icon: 'shield', mode: 'privacy', productionPrivacyChecker: true,
    description: 'Check images for GPS coordinates, device identifiers, timestamps, author information, and hidden metadata without uploading your files.',
    shortDescription: 'Check one image for location, identity, device, editing, and thumbnail clues.',
    highlights: ['Shows an initial result while one automatic full scan finishes.', 'Explains every score with the matched metadata fields.', 'Checks standard tags, embedded previews, and nested image records.', 'Creates, fully rescans, and compares a cleaned local copy.'],
    formats: 'JPEG · PNG · WebP', accept: 'image/jpeg,image/png,image/webp', allowedTypes: ['jpeg','png','webp'],
    limitations: ['A low score does not guarantee that an image is safe to share.', 'The checker does not inspect visible faces, text, reflections, or landmarks.', 'Rules explain likely exposure; they cannot know your personal threat model.'],
    faqs: [
      { question: 'Can an image reveal my location?', answer: 'Yes. Valid EXIF latitude and longitude can identify where a photo was taken, so exact GPS adds 40 points to this report.' },
      { question: 'Does this tool upload my image?', answer: 'No. A Web Worker reads the file in browser memory. The image, filename, coordinates, and report are not sent to a server.' },
      { question: 'What does the privacy score mean?', answer: 'It is a repeatable 0–100 total from visible rules. Low means fewer supported metadata signals; it never means the image is guaranteed safe.' },
      { question: 'Can screenshots contain metadata?', answer: 'Yes. Screenshots often have little EXIF, but software names, timestamps, PNG text, or color data can remain.' },
    ], related: protectRelated,
  },
  remover: {
    productionMetadataRemover: true,
    title: 'Metadata Remover', metaTitle: 'Metadata Remover – Remove EXIF and Hidden Image Data', path: '/metadata-remover/', eyebrow: 'Pixel-only re-encoder', icon: 'eraser', mode: 'remover',
    description: 'Remove EXIF, XMP, IPTC, PNG text, and other removable image metadata locally in your browser.',
    shortDescription: 'Create a new image without removable metadata, then scan the copy again.',
    highlights: ['Leaves the original file unchanged.', 'Re-encodes pixels into a fresh local image.', 'Checks the generated copy before download.', 'Reports the before-and-after field and file-size change.'],
    formats: 'JPEG · PNG · WebP', accept: '.jpg,.jpeg,.png,.webp', allowedTypes: ['jpeg','png','webp'],
    limitations: ['JPEG and WebP re-encoding can make tiny visual changes.', 'Color profiles may be removed and file size can increase or decrease.', 'Metadata removal does not hide visible people, text, plates, or locations.'],
    faqs: [{ question: 'Does this selectively preserve some EXIF?', answer: 'No. The reliable MVP mode removes all removable metadata instead of pretending selective deletion is safe.' }, { question: 'Is PNG output lossy?', answer: 'No. PNG is encoded losslessly; the quality selector is disabled for it.' }, { question: 'Does the original file change?', answer: 'Never. The browser creates a new downloadable Blob and leaves the source untouched.' }], related: protectRelated,
  },
  c2pa: {
    productionC2paViewer: true,
    title: 'C2PA Viewer', metaTitle: 'C2PA Viewer – Verify Content Credentials and File Provenance', path: '/c2pa-viewer/', eyebrow: 'Cryptographic provenance check', icon: 'badge', mode: 'metadata',
    description: 'Validate C2PA Content Credentials in your browser. Check the signature, file binding, status codes, actions, ingredients, assertions, and full safe manifest report without uploading the file.',
    shortDescription: 'Drop one file. Get a clear Valid, Invalid, Trusted, or No Credential result with the evidence behind it.',
    highlights: ['Uses the official @contentauth browser verifier in an isolated Web Worker.', 'Separates a valid signature from publisher trust instead of showing one vague green badge.', 'Indexes actions, ingredients, assertions, manifest history, and exact validation codes.', 'Calculates SHA-256 and exports a safe verification receipt without source bytes.'],
    formats: 'JPEG · PNG · WebP · MP4 · PDF', accept: '.jpg,.jpeg,.png,.webp,.mp4,.pdf',
    limitations: ['No credential does not mean a file is fake.', 'A valid signature proves file binding and claim integrity, not that every claim or visible scene is true.', 'This privacy-first verifier does not contact an external trust list or OCSP service, so publisher trust and revocation may remain not checked.'],
    faqs: [{ question: 'What does Valid mean?', answer: 'The manifest is well formed, its signature validates, and its signed content binding matches this file. Publisher trust is a separate result.' }, { question: 'Why is publisher trust “Not checked”?', answer: 'This static tool blocks external verification requests so a credential cannot trigger a trust-list, remote manifest, or OCSP lookup. Use another conforming validator when you need an online trust decision.' }, { question: 'What does No Content Credentials mean?', answer: 'No embedded C2PA manifest was detected. Many authentic files have no credential, so absence is not a fake-content verdict.' }, { question: 'Is the file uploaded for validation?', answer: 'No. The official verifier runs in a browser Worker, the network policy is same-origin only, and the report excludes file bytes and thumbnails.' }], related: protectRelated,
  },
};
