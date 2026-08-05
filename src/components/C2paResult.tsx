import type { C2paResult as Result } from '../lib/c2pa/verify';
import { JsonViewer } from './JsonViewer';

const copy = {
  verified: ['Verified', 'The credential is cryptographically associated with this file.'],
  invalid: ['Invalid', 'A credential was found, but its signature or file binding did not validate.'],
  'not-found': ['Not found', 'No Content Credentials were detected in this file.'],
  unsupported: ['Unsupported', 'The C2PA library cannot inspect this file format in the browser.'],
  error: ['Could not verify', 'The credential check could not be completed.'],
} as const;

export function C2paResult({ result }: { result: Result }) {
  const [title, description] = copy[result.status];
  return <div className="c2pa-result">
    <div className={`status-banner status-${result.status}`}><span>Manifest status</span><h3>{title}</h3><p>{description}</p></div>
    {result.status === 'not-found' && <p className="notice">The absence of Content Credentials does not mean that a file is fake.</p>}
    {result.status === 'verified' && <p className="notice">A valid C2PA manifest confirms that the credentials are cryptographically associated with this file. It does not prove that every visible claim in the content is true.</p>}
    {result.activeManifest && <JsonViewer title="Active manifest" data={result.activeManifest} />}
    {result.manifest && <JsonViewer title="Raw manifest JSON" data={result.manifest} />}
  </div>;
}
