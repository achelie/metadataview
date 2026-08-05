import { useEffect, useRef, useState } from 'react';

export async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(value); return; } catch { /* secure-context fallback below */ }
  }
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed'; textarea.style.opacity = '0';
  document.body.appendChild(textarea); textarea.select();
  const legacyCopy = (document as unknown as { ['execCommand']: (command: string) => boolean })['execCommand'];
  const copied = legacyCopy.call(document, 'copy');
  textarea.remove();
  if (!copied) throw new Error('Copy is unavailable in this browser.');
}

export function CopyButton({ value, label = 'Copy' }: { value: unknown; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const copy = async () => {
    try {
      await copyText(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
      setFailed(false); setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1_500);
    } catch { setCopied(false); setFailed(true); }
  };
  return <button className="text-button" type="button" onClick={copy} aria-live="polite">{failed ? 'Copy blocked' : copied ? 'Copied' : label}</button>;
}
