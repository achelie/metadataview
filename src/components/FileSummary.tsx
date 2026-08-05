import type { FileSummary as FileSummaryType } from '../lib/metadata/types';

const size = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function FileSummary({ file }: { file: FileSummaryType }) {
  return (
    <div className="file-summary" aria-label="Selected file summary">
      <div><span>File</span><strong>{file.name}</strong></div>
      <div><span>Detected</span><strong>{file.detectedType.toUpperCase()}</strong></div>
      <div><span>Size</span><strong>{size(file.size)}</strong></div>
      <div><span>MIME</span><strong>{file.mime}</strong></div>
    </div>
  );
}
