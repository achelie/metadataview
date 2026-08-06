import { Icon } from '@iconify/react';
import cameraIcon from '@iconify-icons/lucide/camera';
import clockIcon from '@iconify-icons/lucide/clock';
import fileIcon from '@iconify-icons/lucide/file-text';
import historyIcon from '@iconify-icons/lucide/history';
import imageIcon from '@iconify-icons/lucide/image';
import mapIcon from '@iconify-icons/lucide/map-pin';
import userIcon from '@iconify-icons/lucide/user';
import usersIcon from '@iconify-icons/lucide/users';
import type { PrivacyReport } from '../../lib/privacy/types';

export function PrivacySummary({ report }: { report: PrivacyReport }) {
  const has = (...ids: string[]) => report.risks.some((risk) => ids.includes(risk.id));
  const items = [
    { label: 'Location', found: report.summary.hasPreciseLocation || report.summary.hasApproximateLocation, note: report.summary.hasPreciseLocation ? 'Exact coordinates' : 'Named place', icon: mapIcon, risk: report.summary.hasPreciseLocation ? 'precise-location' : 'approximate-location' },
    { label: 'Device fingerprint', found: has('device-model', 'device-identifier'), note: report.summary.hasDeviceIdentifier ? 'Unique identifier' : 'Make or model', icon: cameraIcon, risk: report.summary.hasDeviceIdentifier ? 'device-identifier' : 'device-model' },
    { label: 'Capture time', found: report.summary.hasCaptureTime, note: 'Embedded date, not file time', icon: clockIcon, risk: 'capture-time' },
    { label: 'Author or contact', found: report.summary.hasIdentityInformation, note: 'Name, owner, or contact', icon: userIcon, risk: has('contact-details') ? 'contact-details' : has('creator-identity') ? 'creator-identity' : 'device-owner' },
    { label: 'Named people', found: report.summary.hasNamedPeople, note: 'XMP/IPTC person labels', icon: usersIcon, risk: 'named-people' },
    { label: 'Thumbnail or preview', found: report.summary.hasEmbeddedThumbnail, note: 'Independent embedded image', icon: imageIcon, risk: 'embedded-thumbnail' },
    { label: 'Editing trail', found: report.summary.hasEditingHistory, note: 'History or persistent IDs', icon: historyIcon, risk: 'editing-history' },
    { label: 'Original filename', found: report.summary.hasOriginalFileReference, note: 'Preserved source reference', icon: fileIcon, risk: 'original-file-reference' },
  ];
  return <section className="privacy-summary" aria-labelledby="privacy-summary-heading">
    <header><span className="section-index">FAST READ / EIGHT SIGNALS</span><h2 id="privacy-summary-heading">What turned up</h2></header>
    <div>{items.map((item) => item.found ? <a href={`#risk-${item.risk}`} className="is-found" key={item.label}><Icon icon={item.icon} width="19" /><span><strong>{item.label}</strong><small>{item.note}</small></span><b>Found</b></a> : <div key={item.label}><Icon icon={item.icon} width="19" /><span><strong>{item.label}</strong><small>{item.note}</small></span><b>Not detected</b></div>)}</div>
    <p>“Not detected” means the current scan did not find a supported metadata signal. It is not a promise of anonymity.</p>
  </section>;
}
