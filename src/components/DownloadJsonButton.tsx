import { downloadJson } from '../lib/metadata/utils';

export function DownloadJsonButton({ data, filename }: { data: unknown; filename: string }) {
  return <button type="button" className="button button-secondary" onClick={() => downloadJson(data, filename)}>Download JSON</button>;
}
