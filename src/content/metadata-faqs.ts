export const metadataViewerFaqs = [
  {
    question: 'Is this metadata viewer safe to use?',
    answer: 'Yes. The selected file stays in this browser tab. It is never uploaded or added to a file history, and the page forgets it when you clear, replace, or refresh.',
  },
  {
    question: 'What EXIF data can this viewer read?',
    answer: 'When those fields are present, it can read camera model, lens, ISO, aperture, shutter speed, timestamps, GPS coordinates, orientation, XMP, IPTC, and other available EXIF and file metadata.',
  },
  {
    question: 'Can this reveal where a photo was taken?',
    answer: 'If valid GPS tags exist, the report shows the stored coordinates. If no GPS tags exist, there is no metadata location to display.',
  },
  {
    question: 'Can metadata be wrong?',
    answer: 'Yes. Metadata can be edited, forged, outdated, or stripped, so treat it as useful context rather than guaranteed truth.',
  },
  {
    question: 'Can metadata restore blurred or redacted parts of an image?',
    answer: 'No. Metadata describes the file and cannot reconstruct pixels that were blurred, covered, cropped, or removed.',
  },
] as const;
