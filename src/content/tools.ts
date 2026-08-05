import type { IconName } from '../components/IconGlyph';
import type { ToolMode } from '../components/ToolWorkbench';

export interface ToolConfig {
  title: string; metaTitle: string; description: string; path: string; eyebrow: string; icon: IconName;
  mode: ToolMode; formats: string; accept: string; allowedTypes?: string[]; shortDescription: string; highlights: string[];
  productionImageViewer?: boolean;
  productionMetadataReport?: boolean;
  metadataReportScope?: 'all' | 'image';
  productionPrivacyChecker?: boolean;
  productionMetadataRemover?: boolean;
  limitations: string[]; faqs: { question: string; answer: string }[];
  related: { href: string; title: string; note: string }[];
}

const inspectRelated = [
  { href: '/image-privacy-checker', title: 'Image Privacy Checker', note: 'Turn metadata into an explainable risk score.' },
  { href: '/metadata-remover', title: 'Metadata Remover', note: 'Re-encode an image without the hidden baggage.' },
  { href: '/ai-prompt-reader', title: 'AI Prompt Reader', note: 'Read stored Stable Diffusion and ComfyUI data.' },
];
const protectRelated = [
  { href: '/metadata-viewer', title: 'Metadata Viewer', note: 'Inspect the complete file record first.' },
  { href: '/image-privacy-checker', title: 'Privacy Checker', note: 'See which fields deserve attention.' },
  { href: '/c2pa-viewer', title: 'C2PA Viewer', note: 'Check signed provenance separately from EXIF.' },
];
const aiRelated = [
  { href: '/comfyui-workflow-reader', title: 'ComfyUI Workflow Reader', note: 'Follow sampler connections through a workflow.' },
  { href: '/image-metadata-viewer', title: 'Image Metadata Viewer', note: 'See EXIF, XMP, IPTC, ICC, and PNG chunks.' },
  { href: '/metadata-remover', title: 'Metadata Remover', note: 'Remove prompts before sharing an image.' },
];

export const tools: Record<string, ToolConfig> = {
  metadata: {
    productionMetadataReport: true, metadataReportScope: 'all',
    title: 'Metadata Viewer', metaTitle: 'Metadata Viewer – View Hidden File Metadata Online', path: '/metadata-viewer', eyebrow: 'Universal file inspector', icon: 'scan', mode: 'metadata',
    description: 'Open JPEG, PNG, WebP, PDF, MP4, or MP3 metadata in your browser. Search fields, copy values, and export the complete result without uploading the file.',
    shortDescription: 'Drop one supported file, then search, copy, or export every readable metadata field.',
    highlights: ['Checks the real file signature instead of trusting the extension.', 'Builds a readable summary and a complete native field ledger.', 'Calculates SHA-256 and MD5 while reading the file once.', 'Exports safe JSON and a concise PDF report.'],
    formats: 'JPEG · PNG · WebP · PDF · MP4 · MP3', accept: '.jpg,.jpeg,.png,.webp,.pdf,.mp4,.mp3', allowedTypes: ['jpeg','png','webp','pdf','mp4','mp3'],
    limitations: ['The 100 MB general limit keeps a damaged file from swallowing the tab.', 'Encrypted PDFs are reported, never brute-forced.', 'Metadata describes a file; it does not prove every field is accurate.'],
    faqs: [{ question: 'Does this upload my file?', answer: 'No. Parsing happens in browser memory and the static site has no file upload endpoint.' }, { question: 'Why does the detected type differ from the extension?', answer: 'The tool trusts the file signature first. A .jpg filename can still contain PNG or unrelated bytes.' }, { question: 'Can I inspect several files at once?', answer: 'Not in this MVP. One-file-at-a-time processing keeps memory use predictable and leaves no history.' }], related: inspectRelated,
  },
  image: {
    productionMetadataReport: true, metadataReportScope: 'image',
    title: 'Image Metadata Viewer', metaTitle: 'Image Metadata Viewer – View EXIF, GPS, PNG and WebP Metadata', path: '/image-metadata-viewer', eyebrow: 'Image evidence reader', icon: 'fileImage', mode: 'metadata', productionImageViewer: true,
    description: 'View EXIF, GPS, XMP, IPTC, ICC, PNG text chunks, WebP metadata, and stored AI prompts in JPEG, PNG, and WebP images. Everything stays in your browser.',
    shortDescription: 'Read EXIF, GPS, color, author, software, and AI data from one image.',
    highlights: ['Reads JPEG, PNG, and WebP container metadata.', 'Shows camera, GPS, color profile, authorship, and dates.', 'Keeps native ExifTool paths and unknown readable tags.', 'Links privacy-sensitive fields to the dedicated checker.'],
    formats: 'JPEG · PNG · WebP', accept: 'image/jpeg,image/png,image/webp', allowedTypes: ['jpeg','png','webp'],
    limitations: ['A field can be missing because the camera never wrote it or an editor already removed it.', 'Visible faces and text are pixels, not metadata, and are not analyzed.', 'Metadata can be edited or forged, so treat it as context rather than proof.'],
    faqs: [{ question: 'Can this show where a photo was taken?', answer: 'Yes, when valid latitude and longitude remain in EXIF GPS. The page makes no map request until you click the map link.' }, { question: 'Does a screenshot usually contain EXIF?', answer: 'Often very little, but software labels, dates, color profiles, PNG text, or AI settings can still remain.' }, { question: 'Can metadata be forged?', answer: 'Yes. Camera models, dates, authors, and coordinates are editable labels—not cryptographic proof.' }, { question: 'Does this upload my image?', answer: 'No. A Web Worker reads the bytes in browser memory. The page has no upload endpoint, file history, or metadata storage.' }], related: inspectRelated,
  },
  pdf: {
    title: 'PDF Metadata Viewer', metaTitle: 'PDF Metadata Viewer – Check Author, Dates and Document Properties', path: '/pdf-metadata-viewer', eyebrow: 'Document property reader', icon: 'fileText', mode: 'metadata',
    description: 'Check PDF title, author, creator, producer, dates, version, page count, and readable custom properties locally in your browser.',
    shortDescription: 'Open one PDF and read its author, dates, producer, pages, and custom properties.',
    highlights: ['Reads the document information dictionary and custom fields.', 'Reports the PDF version, page count, and encryption state.', 'Keeps the file in browser memory.', 'Exports the parsed result as structured JSON.'],
    formats: 'PDF', accept: '.pdf,application/pdf', allowedTypes: ['pdf'],
    limitations: ['Password-protected files are reported as encrypted; passwords are not bypassed.', 'This tool reads metadata and does not scan or extract page text.', 'A document producer can write inaccurate author or date values.'],
    faqs: [{ question: 'Will the PDF be sent to a server?', answer: 'No. The PDF library runs in the browser and receives the file from local memory.' }, { question: 'Can this remove PDF metadata?', answer: 'No. The remover MVP intentionally supports images only.' }, { question: 'Does it execute PDF JavaScript?', answer: 'No. Metadata inspection does not execute scripts embedded in the document.' }], related: inspectRelated,
  },
  video: {
    title: 'Video Metadata Viewer', metaTitle: 'Video Metadata Viewer – Inspect MP4 File Information', path: '/video-metadata-viewer', eyebrow: 'MP4 container inspector', icon: 'film', mode: 'metadata',
    description: 'Inspect MP4 duration, dimensions, codecs, tracks, brands, creation dates, and readable authoring details without uploading the video.',
    shortDescription: 'Read MP4 duration, dimensions, codecs, tracks, brands, and stored dates.',
    highlights: ['Inspects MP4 container boxes without analyzing frames.', 'Summarizes duration, dimensions, codecs, and tracks.', 'Reports compatible brands and stored authoring details.', 'Runs the parser away from the main UI thread.'],
    formats: 'MP4', accept: '.mp4,video/mp4', allowedTypes: ['mp4'],
    limitations: ['Only MP4 containers are in scope; MKV, MOV variants, and AVI are not promised.', 'Video frames and audio speech are never analyzed.', 'Metadata removal for video is not part of this MVP.'],
    faqs: [{ question: 'Does the tool watch the video?', answer: 'No. It reads container metadata and never performs pixel recognition.' }, { question: 'Why is a codec missing?', answer: 'Damaged or unusual track boxes may not expose a readable codec label.' }, { question: 'Can a large video freeze the page?', answer: 'Parsing runs off the main thread and is capped at 100 MB with a timeout.' }], related: inspectRelated,
  },
  audio: {
    title: 'Audio Metadata Viewer', metaTitle: 'Audio Metadata Viewer – View MP3 Tags and File Details', path: '/audio-metadata-viewer', eyebrow: 'ID3 tag reader', icon: 'audio', mode: 'metadata',
    description: 'Read MP3 title, artist, album, year, genre, track, comments, cover-art presence, duration, bitrate, and sample rate in your browser.',
    shortDescription: 'Read MP3 tags, duration, bitrate, sample rate, and cover-art presence.',
    highlights: ['Reads common ID3 tags and MPEG technical details.', 'Reports title, artist, album, dates, comments, and genre.', 'Detects embedded cover art without exporting its bytes.', 'Never plays or fingerprints the audio.'],
    formats: 'MP3', accept: '.mp3,audio/mpeg', allowedTypes: ['mp3'],
    limitations: ['This MVP supports MP3, not FLAC, WAV, AAC, or Ogg.', 'Lyrics and embedded artwork bytes are not rendered.', 'Audio metadata removal is intentionally not included.'],
    faqs: [{ question: 'Will this play or fingerprint the song?', answer: 'No. It only reads stored tags and technical header information.' }, { question: 'Why is the album art not shown?', answer: 'The MVP reports whether cover art exists but avoids decoding or persisting that embedded binary.' }, { question: 'Can ID3 tags be wrong?', answer: 'Absolutely. Tags are editable labels, so verify important claims elsewhere.' }], related: inspectRelated,
  },
  privacy: {
    title: 'Image Privacy Checker', metaTitle: 'Image Privacy Checker – Detect EXIF, GPS and Hidden Metadata', path: '/image-privacy-checker', eyebrow: 'Explainable risk scan', icon: 'shield', mode: 'privacy', productionPrivacyChecker: true,
    description: 'Check images for GPS coordinates, device identifiers, timestamps, author information, AI prompts and hidden metadata without uploading your files.',
    shortDescription: 'Check one image for location, identity, device, editing, thumbnail, and AI clues.',
    highlights: ['Shows a Quick report before the deeper ExifTool scan finishes.', 'Explains every score change with the matched metadata fields.', 'Checks standard tags and optional embedded content.', 'Creates, rescans, and compares a cleaned local copy.'],
    formats: 'JPEG · PNG · WebP', accept: 'image/jpeg,image/png,image/webp', allowedTypes: ['jpeg','png','webp'],
    limitations: ['A low score does not guarantee that an image is safe to share.', 'The checker does not inspect visible faces, text, reflections, or landmarks.', 'Rules explain likely exposure; they cannot know your personal threat model.'],
    faqs: [
      { question: 'Can an image reveal my location?', answer: 'Yes. Valid EXIF latitude and longitude can identify where a photo was taken, so exact GPS adds 40 points to this report.' },
      { question: 'Does this tool upload my image?', answer: 'No. A Web Worker reads the file in browser memory. The image, filename, coordinates, prompts, and report are not sent to a server.' },
      { question: 'What does the privacy score mean?', answer: 'It is a repeatable 0–100 total from visible rules. Low means fewer supported metadata signals; it never means the image is guaranteed safe.' },
      { question: 'Can screenshots contain metadata?', answer: 'Yes. Screenshots often have little EXIF, but software names, timestamps, PNG text, color data, or AI generation settings can remain.' },
    ], related: protectRelated,
  },
  remover: {
    productionMetadataRemover: true,
    title: 'Metadata Remover', metaTitle: 'Metadata Remover – Remove EXIF and Hidden Image Data', path: '/metadata-remover', eyebrow: 'Pixel-only re-encoder', icon: 'eraser', mode: 'remover',
    description: 'Remove EXIF, XMP, IPTC, PNG text, AI workflows, and other removable image metadata by re-encoding pixels locally in your browser.',
    shortDescription: 'Create a new image without removable metadata, then scan the copy again.',
    highlights: ['Leaves the original file unchanged.', 'Re-encodes pixels into a fresh local image.', 'Checks the generated copy before download.', 'Reports the before-and-after field and file-size change.'],
    formats: 'JPEG · PNG · WebP', accept: '.jpg,.jpeg,.png,.webp', allowedTypes: ['jpeg','png','webp'],
    limitations: ['JPEG and WebP re-encoding can make tiny visual changes.', 'Color profiles may be removed and file size can increase or decrease.', 'Metadata removal does not hide visible people, text, plates, or locations.'],
    faqs: [{ question: 'Does this selectively preserve some EXIF?', answer: 'No. The reliable MVP mode removes all removable metadata instead of pretending selective deletion is safe.' }, { question: 'Is PNG output lossy?', answer: 'No. PNG is encoded losslessly; the quality selector is disabled for it.' }, { question: 'Does the original file change?', answer: 'Never. The browser creates a new downloadable Blob and leaves the source untouched.' }], related: protectRelated,
  },
  prompt: {
    title: 'AI Image Prompt Reader', metaTitle: 'AI Image Prompt Reader – View Stable Diffusion and ComfyUI Metadata', path: '/ai-prompt-reader', eyebrow: 'Stored generation reader', icon: 'wand', mode: 'prompt',
    description: 'Read prompts, seeds, models, samplers, steps, LoRAs, and workflows stored by AUTOMATIC1111, ComfyUI, Fooocus, InvokeAI, and NovelAI.',
    shortDescription: 'Read prompts, seeds, models, samplers, LoRAs, and workflows stored inside an image.',
    highlights: ['Reads stored generation data without guessing from pixels.', 'Normalizes common AUTOMATIC1111 parameter lines.', 'Extracts useful values from ComfyUI workflow JSON.', 'Keeps the original workflow available for inspection.'],
    formats: 'PNG · JPEG · WebP', accept: '.png,.jpg,.jpeg,.webp',
    limitations: ['This does not reverse-engineer a prompt from pixels.', 'Social platforms often strip generation metadata during upload.', 'Complex or future ComfyUI nodes may remain visible only in raw JSON.'],
    faqs: [{ question: 'Can this guess a prompt from any image?', answer: 'No. It only reads prompt data stored inside the file.' }, { question: 'Does it execute a ComfyUI workflow?', answer: 'Never. Nodes are treated as inert JSON and only traversed for readable values.' }, { question: 'Why is no prompt shown?', answer: 'The metadata may have been stripped, disabled at generation time, or stored in an unsupported field.' }], related: aiRelated,
  },
  comfy: {
    title: 'ComfyUI Workflow Reader', metaTitle: 'ComfyUI Workflow Reader – Inspect Embedded Nodes and Prompts', path: '/comfyui-workflow-reader', eyebrow: 'Graph-safe workflow reader', icon: 'workflow', mode: 'prompt',
    description: 'Inspect ComfyUI nodes, KSamplers, prompts, models, LoRAs, seeds, and embedded workflow JSON without executing a single node.',
    shortDescription: 'Trace prompts, samplers, models, LoRAs, and seeds through a stored ComfyUI graph.',
    highlights: ['Follows positive and negative prompt connections.', 'Finds KSampler settings, checkpoints, and LoRA stacks.', 'Limits graph traversal and protects against cycles.', 'Treats every node as inert data and never executes it.'],
    formats: 'PNG · JPEG · WebP', accept: '.png,.jpg,.jpeg,.webp',
    limitations: ['Traversal stops at 5,000 nodes and protects against circular references.', 'Custom nodes may expose values only in raw JSON.', 'A workflow can reference local files that are not embedded in the image.'],
    faqs: [{ question: 'How does it choose the positive prompt?', answer: 'It starts at a KSampler positive input and follows the graph to the connected text encoder instead of grabbing the first text node.' }, { question: 'Can a workflow harm my computer?', answer: 'The reader never executes nodes, loads remote URLs, or opens referenced models.' }, { question: 'Are custom nodes supported?', answer: 'Unknown nodes are tolerated and preserved, but their special settings may not be normalized.' }], related: aiRelated,
  },
  c2pa: {
    title: 'C2PA Viewer', metaTitle: 'C2PA Viewer – Verify Content Credentials and Image Provenance', path: '/c2pa-viewer', eyebrow: 'Cryptographic provenance check', icon: 'badge', mode: 'c2pa',
    description: 'Verify embedded C2PA Content Credentials, inspect the active manifest, assertions, ingredients, actions, and validation status directly in your browser.',
    shortDescription: 'Check a file for signed Content Credentials and inspect the active manifest.',
    highlights: ['Uses the official browser C2PA verifier.', 'Reports manifest, assertion, ingredient, and action details.', 'Distinguishes verified, invalid, missing, and unsupported results.', 'Loads the verification engine only on this page.'],
    formats: 'JPEG · PNG · WebP · MP4 · PDF (library support varies)', accept: '.jpg,.jpeg,.png,.webp,.mp4,.pdf',
    limitations: ['No credential does not mean a file is fake.', 'A valid signature does not prove every visible or written claim is true.', 'Supported formats and trust behavior follow the current official WebAssembly library.'],
    faqs: [{ question: 'What does Verified mean?', answer: 'A manifest was found and cryptographically associated with the current file. It is evidence of integrity, not a universal truth stamp.' }, { question: 'What does Not Found mean?', answer: 'No C2PA manifest was detected. Many authentic files do not use Content Credentials.' }, { question: 'Is the file uploaded for validation?', answer: 'No. The verifier and its WASM code run in your browser and release the reader after the check.' }], related: protectRelated,
  },
};
