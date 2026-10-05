import type { ToolEditorialLocaleCopy } from './tool-editorial-types';

export const toolEditorialEn: ToolEditorialLocaleCopy = {
  home: [],
  metadata: [
    { id: 'all-fields-context', title: 'Start with the field family, then read the value', paragraphs: [
      'A name such as Creator or Date does not have one meaning across every file. Start by reading the detected format and the source path beside a field. A photograph can hold both EXIF capture settings and XMP editing history. A PDF can carry an Info dictionary alongside XMP. Those records describe different parts of the same file, so a short summary should not replace the full field list.',
      'Choose the question before you search. To check a private location, search GPS and location fields. To check a document author, search author, creator, company and custom properties. To understand an audio or video export, compare its codec, duration and track details as well as its descriptive tags. A matching word is a starting point; the group and value tell you whether it matters.',
    ], fields: [
      { name: 'EXIF / XMP / IPTC', meaning: 'Image settings, descriptive labels and editing information can appear in separate families.', caveat: 'The same date or author can have several values. Keep the original group names.' },
      { name: 'PDF Info / Office properties', meaning: 'Document applications can save titles, authors, creation dates and custom properties.', caveat: 'Properties do not include all names written in the document body or comments.' },
      { name: 'ID3 / Vorbis / RIFF', meaning: 'Audio tags can store titles, performers, comments and software labels.', caveat: 'A tag is editable text; it does not identify the speaker or prove ownership.' },
      { name: 'Container / track fields', meaning: 'Video and audio headers describe timing, codecs and the tracks needed for playback.', caveat: 'A container creation date is not necessarily the time of recording.' },
    ] },
    { id: 'all-writers', title: 'Who put these details in the file?', paragraphs: [
      'Cameras, phones, recording applications, office suites and export tools all write metadata. A later editor can copy a value, replace it or remove it. A title that looks sensible may come from a previous template, while a software label may describe the last export rather than the original device. ViewExif reads what the selected copy contains now; it does not reconstruct the history of every program that touched it.',
      'Keep filesystem information separate from embedded records. A downloaded file can receive a new filesystem date without changing its embedded capture date. A library or sidecar can hold a caption that never travelled with the export. When two applications disagree, inspect the exact same file bytes before assuming either application is wrong. Compare the complete native fields and the route used to obtain that copy.',
    ] },
    { id: 'all-reading-limits', title: 'An absent value and an unfinished scan need different answers', paragraphs: [
      'Wait for the full scan and read its warnings. A field missing from a completed report was not found in this selected copy. That alone cannot tell you whether the device never recorded it, an editor removed it, or a separate catalog still holds it. Try another original that you own if you need to compare the export route, rather than renaming the extension or repeatedly choosing the same bytes.',
      'An interrupted scan, protected document or damaged container is a different situation. Keep the original, note the detected format and read the diagnostic detail. An empty summary during that state is not evidence that the file has no metadata. The format-specific viewers explain their supported containers and limits. A signed origin claim belongs in the C2PA tool; ordinary dates, names and coordinates are not a signature check.',
    ] },
    { id: 'all-controlled-example', title: 'Try a labelled example before checking a sensitive file', paragraphs: [
      'The optional image sample contains deliberately written demonstration values. In the image report, look for ViewExif as the maker, Demo Camera as the model and ViewExif Demo as the artist. Its sample capture time is 2026:01:15 10:30:00. The photograph-like image is AI-generated; those fields are teaching data, not evidence of a real camera capture. The public-landmark coordinates also demonstrate a field, not the actual place where a photograph was taken.',
      'For a repeatable check, search one of those values in the complete report, record its field path and export a report if you need it. Then compare a newly cleaned copy in the matching viewer. A changed hash tells you that bytes changed, not which fields disappeared. Read the remaining fields and verification limits separately. Your own file and report remain in this tab unless you explicitly download a copy.',
    ], figure: { src: '/editorial/image-sample.png', alt: 'Local image report for a labelled synthetic metadata demonstration', caption: 'Deliberately added sample fields demonstrate the source groups. They do not establish a real camera capture or photographer.' } },
  ],
  image: [
    { id: 'image-native-example', title: 'Follow a camera field through a controlled example', paragraphs: [
      'The labelled demonstration image uses Make = ViewExif, Model = Demo Camera and Artist = ViewExif Demo. These are deliberately added values on an AI-generated image. Read the field family and native path next to each value before interpreting it. A camera can write EXIF; an editor can add XMP; a publishing application can add IPTC. A completed scan that finds no camera model cannot tell you why it is absent.',
    ], fields: [
      { name: 'DateTimeOriginal', meaning: 'Usually intended as the capture date stored by a camera or application.', caveat: 'An editor can change it, and the timezone may be missing.' },
      { name: 'Artist / creator / by-line', meaning: 'Names may come from camera settings, an editor or a publishing workflow.', caveat: 'They are descriptive labels, not proof of authorship or consent.' },
      { name: 'Orientation / ICC', meaning: 'These describe how to display pixels and interpret their colors.', caveat: 'Their presence is different from a private location or owner note.' },
    ], figure: { src: '/editorial/image-sample.png', alt: 'ViewExif image report for a labelled synthetic metadata sample', caption: 'A controlled demonstration report. The image and camera values are sample data; they do not claim a real photographic capture.' } },
  ],
  document: [
    { id: 'document-property-table', title: 'Which document records should you compare?', paragraphs: [
      'A PDF title and an Office title are stored differently. PDF readers may show Info dictionary values, XMP values or a mixture. DOCX, PPTX and XLSX store core, application and optional custom properties inside a package. ViewExif keeps those source groups visible so you can compare them instead of silently choosing one author or date. The number saved in a property is not always a fresh count of the current body.',
    ], fields: [
      { name: 'Author / dc:creator', meaning: 'A PDF can carry an author in Info and a creator list in XMP.', caveat: 'Conflicting values may come from different export stages; neither proves authorship.' },
      { name: 'Creator / Producer', meaning: 'These often identify software involved in creating or exporting a PDF.', caveat: 'They do not necessarily identify the person who wrote its text.' },
      { name: 'Core / App / Custom', meaning: 'Office packages separate descriptive properties, application facts and custom fields.', caveat: 'A company or custom project value can remain after the visible title changes.' },
      { name: 'Revision / saved counts', meaning: 'Some Office applications store edit counters and document statistics.', caveat: 'These can be stale; they are not a complete edit log.' },
    ] },
    { id: 'document-writers-and-errors', title: 'Why an author can be wrong, missing or unreadable', paragraphs: [
      'An office suite may fill the author from an application profile or copy it from a template. A PDF exporter can carry those values forward while adding its own creator and producer labels. A collaborator can later change the title but leave a company or custom property untouched. If you are preparing a public copy, search all property groups rather than checking only the first author card.',
      'A completed report without an author means that author was not found in this copy. A password-protected file, damaged package or unsupported legacy format is a reading limit instead. ViewExif does not decrypt protected documents or accept old DOC, PPT and XLS merely because their filenames resemble supported Office files. Preserve the source and create a supported copy in your own application when you have permission to do so.',
    ] },
    { id: 'document-controlled-example', title: 'Use a harmless sample to learn the property paths', paragraphs: [
      'The controlled Office sample has the title Synthetic review copy, author Ada Example, company Example Studio and a custom Review status set to Draft. Open the DOCX report and compare its core, application and custom groups. Those values are deliberately written examples, not personal records. The screenshot shows this local package report, rather than a claim that every document application writes the same set of fields.',
      'After a cleanup, reopen the actual downloaded copy and compare the same paths. Check any residual warning before sharing. Names in paragraphs, signatures on the page, annotations, forms and attachments need a separate review. This viewer does not read the document body. Metadata properties can help you find a privacy clue, but they cannot certify that the entire document contains no personal information.',
    ], figure: { src: '/editorial/document-sample.png', alt: 'Local DOCX report with labelled demonstration properties', caption: 'A synthetic Office document for comparing core, application and custom properties. Visible text and attachments remain outside this property-only report.' } },
  ],
  video: [
    { id: 'video-writers-example', title: 'Do not turn a container timestamp into a filming claim', paragraphs: [
      'A camera app can write a location, while a later editor writes an encoder label or export date. The controlled MP4 example contains a time scale of 1000 and duration of 1000 units, but no actual media tracks. It demonstrates container reading, not playable footage. Keep its reading limits with your notes; a blank date card is not a completed absence check.',
    ], fields: [
      { name: 'CreateDate / creation time', meaning: 'A container or track can record a creation time.', caveat: 'It may reflect export rather than filming; timezone interpretation varies.' },
      { name: 'Encoder / handler', meaning: 'Applications can write software and track-handler labels.', caveat: 'These are editable or inherited labels, not a reliable device identity.' },
    ], figure: { src: '/editorial/video-sample.png', alt: 'Metadata report for a synthetic MP4 container without media tracks', caption: 'A container-only reading example, not a playable video. Header values do not establish a filming event or complete media validation.' } },
  ],
  audio: [
    { id: 'audio-tag-table', title: 'Read descriptive tags separately from the sound', paragraphs: [
      'An audio file can carry several layers of labels. MP3 commonly uses ID3, FLAC uses Vorbis comments, and WAV can hold RIFF INFO, broadcast fields or iXML. A music editor, recorder or export application may write those records. The title in a player can come from a tag or from the filename when no title exists. Compare embedded values in this report rather than treating a player label as proof of a stored field.',
    ], fields: [
      { name: 'Title / Artist / Album', meaning: 'Descriptive labels organize a recording in players and libraries.', caveat: 'An editor can change them without changing the voice or music.' },
      { name: 'Comment / software / date', meaning: 'Recorders and editors can save notes, export labels and dates.', caveat: 'A date can describe an export or tagging session rather than recording.' },
      { name: 'Pictures / artwork', meaning: 'A tag block may contain an embedded cover image.', caveat: 'The image can reveal information even when text labels are empty.' },
      { name: 'Sample rate / channels', meaning: 'These describe the encoded audio stream needed for playback.', caveat: 'They are technical facts, not ordinary private text labels.' },
    ] },
    { id: 'audio-reading-failures', title: 'What if the player and this report disagree?', paragraphs: [
      'First check that both applications opened the same copy. A library can remember an old title in its database, while the file contains a newer title or none at all. Some editors prefer one tag version over another. ViewExif reports readable native groups as well as a summary, so searching the full field list is more useful than relying on the first title card.',
      'Wait until parsing finishes. A complete scan that does not find Artist cannot establish who performed the recording. A damaged tag block, unsupported codec wrapper or interrupted parser should leave a reading warning instead. Try an authorized supported export if you need a comparison, and keep the original. This tool does not play the audio, transcribe speech or identify people from their voices.',
    ] },
    { id: 'audio-controlled-example', title: 'Make one tag easy to follow', paragraphs: [
      'The controlled WAV sample is titled Synthetic silence and carries Artist = Ada Example. Its technical report describes 1.00 second of mono PCM at 8 kHz and 16 bits. A quick-parser data-chunk size warning remains visible even when the full scan adds fields. This is a reading-limit example, not a warning-free recording. Search the demonstration label and keep its source group alongside that warning.',
      'If you then create a cleaned copy, reopen that output in this viewer. Compare descriptive tags and technical headers separately, and inspect any artwork that was intentionally preserved. The recording itself can still expose a name, conversation or location. Removing an Artist tag cannot make those audible details anonymous, and an unchanged technical header does not prove that all descriptive records were removed.',
    ], figure: { src: '/editorial/audio-sample.png', alt: 'Audio field report for a labelled controlled recording', caption: 'A generated audio example with demonstration tags. Read the actual groups and values rather than assuming a title shown by a player is embedded.' } },
  ],
  privacy: [
    { id: 'privacy-field-context', title: 'Decide which clues matter for this recipient', paragraphs: [
      'A precise coordinate can matter when you share a photograph taken at home. A camera serial or owner label may link several files to the same device or account. A timestamp can reveal a routine without revealing a street address. The checker groups these clues so you can inspect them, rather than giving you a number with no explanation. Higher scores mean more detected metadata concerns; the score is not a probability that someone will identify you.',
    ], fields: [
      { name: 'GPS coordinates', meaning: 'A recording device or application may store a precise location.', caveat: 'Coordinates can be edited or copied. They do not establish the actual place of capture.' },
      { name: 'Owner / serial / contact', meaning: 'Camera settings and editing workflows can add persistent identity clues.', caveat: 'A label can be old or inherited, but still deserves a check before public sharing.' },
      { name: 'Dates / software', meaning: 'These can describe capture, editing or export history.', caveat: 'The same-looking date can have a different meaning in another source group.' },
    ] },
    { id: 'privacy-controlled-example', title: 'Read the demonstration fields, then look beyond them', paragraphs: [
      'The labelled sample image contains synthetic camera and author values and coordinates for the public Eiffel Tower landmark. Use it to see where the checker explains a location or identity concern. Its image is AI-generated, and its tags were deliberately added. No camera, photographer or private address is identified by this teaching example. The screenshot is a concrete report from a sample, not a claim that the displayed score applies to your files.',
      'For your own file, wait for the full scan and read the coverage note. A damaged or uninspected block cannot receive a clean bill of health merely because the current score is low. Search the native fields when a clue seems missing. After cleanup, review residual fields and warnings, then inspect faces, reflections, labels, screens and the filename yourself. Those visible clues are outside this metadata-only check.',
    ], figure: { src: '/editorial/image-sample.png', alt: 'Synthetic image fields used to explain a metadata privacy check', caption: 'Demonstration metadata, including a public-landmark location. A field is a privacy clue, not proof of a real photographic event.' } },
  ],
  remover: [
    { id: 'remover-copy-check', title: 'Check the copy you will actually send', paragraphs: [
      'The controlled 320 × 180 PNG has Author = Ada Example and Comment = Synthetic metadata cleanup sample. Its actual cleanup reports 15 removed, 27 preserved and 29 residual fields, with the conclusion Verified with residual metadata. The output is a processed copy, not an all-clear result. Search the values in their original groups and read the remaining 29 fields. A smaller file or different hash alone does not prove removal.',
      'A document illustrates why those groups cannot be read as a single total. Company in an Office property is different from the same company name in a paragraph, spreadsheet cell or slide. Property cleanup leaves visible content alone. An audio Artist tag similarly differs from a name spoken in the recording. A recipient can learn the same information through a different layer after a targeted label disappears.',
    ], fields: [
      { name: 'Removed', meaning: 'The output scan did not find the same eligible input value.', caveat: 'The statement is limited to records that the parsers could inspect.' },
      { name: 'Preserved / Residual', meaning: 'The result distinguishes retained structure or content from writable-looking values that remain.', caveat: 'Read the actual values and warnings before sharing; the counts are not an anonymity certificate.' },
    ], figure: { src: '/editorial/cleanup-sample.png', alt: 'Controlled PNG cleanup with 15 removed, 27 preserved and 29 residual fields', caption: 'Verified with residual metadata: 29 fields remain. Review the actual values and warning before deciding whether this processed copy is suitable to share.' } },
  ],
  imageRemover: [
    { id: 'image-cleanup-example', title: 'Follow an identity label without breaking image display', paragraphs: [
      'Camera settings can write an artist or owner name; an editor can later write XMP or IPTC credits. The controlled cleanup uses a generated 320 × 180 PNG with Author = Ada Example and Comment = Synthetic metadata cleanup sample. Follow those labelled input values through the actual output report. Wait for the completed scan; an interrupted scan does not establish that a label disappeared.',
      'The same name can also appear in several families: Artist in EXIF and Creator in XMP can describe an author, while a PNG text chunk uses its own key. These records have different paths. A missing EXIF value does not show that its XMP counterpart disappeared. Conversely, an ICC profile is display information, so its presence alone says nothing about whether an author label survived.',
    ], fields: [
      { name: 'EXIF / XMP / IPTC labels', meaning: 'Writable camera, author and location records are cleanup targets when the format supports it.', caveat: 'Inspect every family; one missing summary card is not a full comparison.' },
      { name: 'Orientation / ICC / dimensions', meaning: 'Display and structural records can stay so the image still looks right.', caveat: 'They should not be confused with an unremoved private owner note.' },
    ], figure: { src: '/editorial/cleanup-sample.png', alt: 'Controlled PNG cleanup result that retains 29 residual fields', caption: 'This actual example reports 15 removed, 27 preserved and 29 residual fields. Its verification warning requires review; it does not certify a risk-free image.' } },
  ],
  videoRemover: [
    { id: 'video-cleanup-fields', title: 'Keep track structure separate from private labels', paragraphs: [
      'Recording apps and editors can add dates, location strings, titles and software labels. A controlled sample lets you follow one such value through cleanup without using private footage. Compare its source path before and after; do not mistake an incomplete scan for a removed tag. The video frames, sound, subtitles and attachments remain a separate privacy review.',
      'The screenshot is a minimal synthetic MP4 container with a time scale of 1000, duration of 1000 units and no actual media tracks. It demonstrates a reading limit, not successful cleanup of playable footage. For your own video, compare the actual descriptive fields, output warnings and playable copy; do not substitute this container demonstration for a completed media check.',
    ], fields: [
      { name: 'Writable title / location', meaning: 'Supported descriptive container records can be removed without recoding media.', caveat: 'A residual value needs review; the result does not promise every telemetry representation is supported.' },
      { name: 'Track timing / codec', meaning: 'Playback needs these structural records to remain valid.', caveat: 'Retained structure is different from a private descriptive tag that survived.' },
    ], figure: { src: '/editorial/video-sample.png', alt: 'Synthetic MP4 container without media tracks used to explain reading limits', caption: 'A container-only example. It is not playable footage or evidence of a completed video cleanup.' } },
  ],
  audioRemover: [
    { id: 'audio-cleanup-table', title: 'Which audio labels can a cleaner target?', paragraphs: [
      'A recorder may write a date and software name, while a library editor adds artist, album or comment fields later. The audio cleaner targets supported descriptive records. It does not record the sound again or turn a voice into anonymous audio. Before cleaning, search the full report for the labels you want to remove and note the tag family. A title alone does not tell you which block holds it.',
    ], fields: [
      { name: 'ID3 title / artist / comments', meaning: 'MP3 descriptive frames can contain names, notes, dates and links.', caveat: 'Read every reported source group; a player can hide a second tag version.' },
      { name: 'Vorbis / ASF / RIFF fields', meaning: 'Other supported containers store descriptive labels in their own structures.', caveat: 'The container determines the cleanup engine, not the text typed after the filename dot.' },
      { name: 'Pictures / chapters', meaning: 'The metadata-only policy preserves supported artwork and chapter content.', caveat: 'Cover images or chapter names may still identify a person or project.' },
      { name: 'Duration / channels / sample rate', meaning: 'Technical stream facts are retained and compared during verification.', caveat: 'Matching headers alone do not prove that every descriptive field was removed.' },
    ] },
    { id: 'audio-cleanup-limits', title: 'Why a remaining value needs its own explanation', paragraphs: [
      'Required audio headers should remain. Artwork and chapters also stay under the metadata-only policy. A writable-looking comment that survives is different: the result should list it as residual instead of hiding it. Read the value and decide whether that copy is suitable for your recipient. A privacy cleanup is not the same as rebuilding a music library with every cover, chapter and credit erased.',
      'If cleanup or verification is incomplete, keep the original and read the failed check. A corrupt tag block or unsupported structure cannot be declared clean from an empty panel. Do not rename a file to force a different engine. Use a supported export you are authorized to create, then repeat the comparison. The original recording stays unchanged; the tool creates a separate output only after your explicit action.',
    ] },
    { id: 'audio-cleanup-example', title: 'Run a small, repeatable tag check', paragraphs: [
      'The input example is a generated WAV titled Synthetic silence with Artist = Ada Example, mono PCM, 8 kHz, 16 bits and a reported duration of 1.00 second. It also has a data-chunk size warning. Keep that warning in the comparison; additional readable fields do not erase it. The screenshot is an input report, not proof of a successful audio cleanup or a real performer and studio session.',
      'Download the allowed output, reopen it in the audio viewer and check the actual file you plan to send. Listen in your own player and inspect preserved artwork separately. Save the receipt if you need a record of the limited checks performed. A changed hash is expected after tag changes, but it is not proof of silence, anonymity or ownership. Names spoken in the recording and information in the filename need another check.',
    ], figure: { src: '/editorial/audio-sample.png', alt: 'Controlled audio input used for a before and after tag check', caption: 'A synthetic recording with demonstration labels. The report supplies a repeatable search target; cleanup and content privacy still require separate checks.' } },
  ],
  documentRemover: [
    { id: 'document-cleanup-scope', title: 'Document properties and document redaction are different jobs', paragraphs: [
      'A Word template can carry an old author or company, and a PDF exporter can add its software label to the finished file. This cleaner targets writable PDF and Office properties. It does not inspect or erase names in the body, comments, tracked revisions, forms or attachments. Before a public handoff, decide whether you need property cleanup, content redaction or both. A clean author card answers only a narrow part of that question.',
    ], fields: [
      { name: 'PDF Info / top-level XMP', meaning: 'The PDF cleanup engine omits these descriptive records during a full rewrite.', caveat: 'Nested metadata and annotations still require review of the residual report and document content.' },
      { name: 'Office Core / App / Custom', meaning: 'Supported property XML parts can carry author, company, dates and custom values.', caveat: 'Changing a property does not change text, cells, slides or revision authors inside the body.' },
      { name: 'Pages / package structure', meaning: 'Required records remain so the resulting document can open.', caveat: 'Preserved structure is not a statement that the document contains no private information.' },
      { name: 'Digital signatures', meaning: 'A property rewrite can affect a signature bound to the original bytes.', caveat: 'Keep the signed original. Read the warning before making a separate unsigned sharing copy.' },
    ] },
    { id: 'document-cleanup-failures', title: 'Treat blocked and incomplete results honestly', paragraphs: [
      'A protected PDF or damaged Office package is not a successful cleanup. ViewExif does not crack passwords or accept legacy Office formats by changing their filename. Keep the original and read the error or verification detail. When you have permission, create a supported sharing copy in the authoring application and inspect that copy. A blank output summary while a parser fails cannot show that all author fields disappeared.',
      'After a completed cleanup, read removed, preserved and residual entries separately. A PDF can have both Info and XMP before cleanup; an Office file can have custom properties beyond the familiar title. Search the same groups in the downloaded output, not only the first author card. Then open that document in an ordinary reader to review appearance, comments, attachments and visible personal details yourself.',
    ] },
    { id: 'document-cleanup-example', title: 'Use a labelled property as your comparison target', paragraphs: [
      'The controlled DOCX sample uses title Synthetic review copy, author Ada Example, company Example Studio and custom Review status = Draft. Search its core, application and custom property groups and keep the input report. If you clean it, wait for verification and compare the actual output paths. The screenshot shows the synthetic input, not proof of a completed cleanup or a promise that every document application stores identical properties.',
      'A different output hash tells you that bytes changed. It does not establish which names were removed, whether a signature remains useful or whether the text is anonymous. The cleanup receipt records the available checks and field counts, with their limits. Keep it alongside your sharing copy if needed, and preserve the original separately. Never substitute a cleaned copy for signed evidence while claiming that its original signature is unchanged.',
    ], figure: { src: '/editorial/document-sample.png', alt: 'Synthetic DOCX properties used as cleanup comparison targets', caption: 'A controlled Office input report. Reinspect any downloaded output and review visible content separately from its descriptive properties.' } },
  ],
  c2pa: [
    { id: 'c2pa-state-table', title: 'Read each verification state as a separate check', paragraphs: [
      'A Content Credential contains signed claims about an asset. The application that creates or signs an asset writes those claims; ordinary EXIF software does not turn a camera label into a signature. ViewExif separates readable provenance, binding checks and the limits of local verification. Read the specific state and supporting detail instead of converting everything into one true-or-fake verdict.',
    ], fields: [
      { name: 'No readable credential', meaning: 'This local reader did not obtain an embedded credential it can inspect.', caveat: 'The file may never have been signed, lost its credential on export, or use an unsupported structure.' },
      { name: 'Binding / signature check', meaning: 'A reported check concerns the signed claim or its connection to these file bytes.', caveat: 'Failure needs its diagnostic context; it does not identify who changed a file or why.' },
      { name: 'Trust / revocation not checked', meaning: 'This verifier does not make external trust-list or certificate-revocation requests.', caveat: 'A local result must not be described as a completed external signer-trust assessment.' },
      { name: 'Assertions / ingredients', meaning: 'A manifest can describe actions, software and source materials.', caveat: 'A signed statement is not independent proof that a scene or narrative is true.' },
    ] },
    { id: 'c2pa-reading-limits', title: 'Keep missing, unreadable and invalid apart', paragraphs: [
      'Start with the detected format and the reader status. If the file cannot be parsed or uses an unsupported credential structure, preserve that warning. An unfinished reader is different from a completed search that found no embedded credential. ViewExif does not contact a remote manifest service to recover a credential that is only linked elsewhere. Keep the original when investigating an export that appears to have lost its provenance.',
      'Do not resize, transcode or rewrite the signed sample merely to make it easier to upload. Protected bytes and credential records participate in validation. A resulting failure would describe the modified copy, not the original file. If you need a comparison, label the copies and their transformations clearly, inspect both, and avoid claiming a particular failure until the actual verifier reports it.',
    ] },
    { id: 'c2pa-controlled-example', title: 'Compare a signed sample with an unsigned demonstration', paragraphs: [
      'The screenshot uses an unsigned demonstration JPEG and records the local no-credential result. It does not show a failed signature check, an authenticated camera original or an AI classification. The ordinary ViewExif metadata demo is AI-generated and has deliberately added camera fields. Those labels do not create a signed asset. Read the explanation and next step before opening the technical diagnostic detail.',
      'For a separate signed example, the optional C2PA sample is an attributed Adobe test image from the public C2PA test-file repository, kept byte-for-byte intact. Open that sample and read its actual manifest and verification states. Keep it separate from the unsigned screenshot. A missing credential is not an AI detector, and an EXIF artist value is not an authenticated identity. A signed claim also does not prove every visible scene.',
    ], figure: { src: '/editorial/c2pa-sample.png', alt: 'Local no-credential result for an unsigned demonstration JPEG', caption: 'An unsigned sample with no readable credential. This result is distinct from a failed signature check and makes no claim about whether the image is authentic.' } },
  ],
};
