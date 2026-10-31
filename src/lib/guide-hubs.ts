export interface GuideLink { label: string; href: string; note: string }
export interface GuideGroup { title: string; intro: string; links: GuideLink[] }
export interface GuideHub { slug: string; title: string; description: string; intro: string; groups: GuideGroup[]; next: { title: string; text: string; href: string; label: string } }

const article = (slug: string, label: string, note: string): GuideLink => ({ href: `/blog/${slug}/`, label, note });
const tool = (slug: string, label: string, note: string): GuideLink => ({ href: `/${slug}/`, label, note });

export const guideHubs: GuideHub[] = [
  {
    slug: 'sharing-metadata',
    title: 'What happens to metadata when you share?',
    description: 'Find out how sharing routes can affect photo metadata, and choose a platform guide to check the file a recipient receives.',
    intro: 'A photo sent in a chat, an original file attachment, and a link can reach someone as different copies. Choose the service and route you use. Then inspect the file the recipient actually saves.',
    groups: [
      { title: 'Messages and attachments', intro: 'A photo sent as media may be handled differently from a file sent as an attachment. The app and the chosen route both matter.', links: [
        article('does-whatsapp-remove-exif-data', 'WhatsApp', 'Compare sending a photo with sending it as a document.'),
        article('does-telegram-remove-exif-data', 'Telegram', 'See why photo and file options can produce different copies.'),
        article('does-discord-remove-exif-data', 'Discord', 'Check the limits of reports about photos, PNGs and video.'),
        article('does-gmail-remove-exif-data', 'Gmail', 'Treat attachments as capable of carrying the original metadata.'),
      ] },
      { title: 'Posts and social sharing', intro: 'A public download can differ from the uploaded file. Older tests and reports do not guarantee how every current post or message is handled.', links: [
        article('does-reddit-remove-exif-data', 'Reddit', 'Consider the upload route and the copy someone can download.'),
        article('does-instagram-remove-exif-data', 'Instagram', 'Understand what a historical download test did and did not show.'),
      ] },
      { title: 'Before you share', intro: 'Keep the original. Inspect a sharing copy, remove private fields if needed, and check the output and any warnings. Filenames and visible details can disclose information too.', links: [
        tool('image-privacy-checker', 'Check image privacy', 'Review available GPS and other sensitive fields locally.'),
        article('how-to-remove-metadata-from-a-photo', 'Remove photo metadata', 'Create a cleaner copy before sending it.'),
        article('verify-metadata-removal', 'Verify metadata removal', 'Reopen the output and review what remains.'),
      ] },
    ],
    next: { title: 'Working with another kind of file?', text: 'Choose a guide for images, video, documents or audio.', href: '/guides/metadata-by-file-type/', label: 'Browse by file type' },
  },
  {
    slug: 'metadata-by-file-type',
    title: 'Check and clean metadata by file type',
    description: 'Choose practical metadata guides and tools for images, screenshots, video, documents and audio.',
    intro: 'Start with the file you plan to share. EXIF mostly describes images; video, documents and audio can use different metadata and technical fields. What you find depends on the individual file.',
    groups: [
      { title: 'Images and screenshots', intro: 'Photos may contain GPS, capture dates or camera details. Screenshots can have their own metadata and still show private information in the pixels.', links: [
        article('how-to-check-metadata-of-an-image', 'Check image metadata', 'Find the fields stored in the image.'),
        article('do-screenshots-have-metadata', 'Understand screenshots', 'See what a new screenshot can carry.'),
        article('how-to-remove-metadata-from-a-photo', 'Remove photo metadata', 'Make a cleaner sharing copy.'),
        tool('image-metadata-viewer', 'Open the image viewer', 'Inspect supported images locally.'),
        tool('image-metadata-remover', 'Open the image remover', 'Remove eligible fields and review the result.'),
      ] },
      { title: 'Video', intro: 'A video can carry dates, device details, location or track information, depending on the file.', links: [
        article('remove-metadata-from-mp4', 'Remove metadata from MP4', 'Learn what to check in the saved copy.'),
        tool('video-metadata-viewer', 'Open the video viewer', 'Inspect available video metadata.'),
        tool('video-metadata-remover', 'Open the video remover', 'Clean supported video files and review warnings.'),
      ] },
      { title: 'Documents', intro: 'Document properties can include author names, dates and application details. Review the visible content as well.', links: [
        article('how-to-view-pdf-metadata', 'View PDF metadata', 'Find available document properties.'),
        article('remove-metadata-from-pdf', 'Remove PDF metadata', 'Prepare and check a cleaner PDF.'),
        article('remove-metadata-from-word-document', 'Remove Word metadata', 'Review document properties before sharing.'),
        tool('document-metadata-viewer', 'Open the document viewer', 'Inspect supported document properties.'),
        tool('document-metadata-remover', 'Open the document remover', 'Clean supported documents and check the result.'),
      ] },
      { title: 'Audio', intro: 'Audio files can include artist names, comments, embedded artwork and other tags.', links: [
        article('remove-metadata-from-mp3', 'Remove MP3 metadata', 'Review audio tags and the output file.'),
        tool('audio-metadata-viewer', 'Open the audio viewer', 'Inspect available audio tags.'),
        tool('audio-metadata-remover', 'Open the audio remover', 'Clean supported audio files and review the result.'),
      ] },
    ],
    next: { title: 'Sharing through an app?', text: 'The sending route can change which copy reaches the recipient.', href: '/guides/sharing-metadata/', label: 'Browse sharing guides' },
  },
];

export function hubsForPost(id: string): GuideHub[] {
  return guideHubs.filter((hub) => hub.groups.some((group) => group.links.some((link) => link.href === `/blog/${id}/`)));
}
