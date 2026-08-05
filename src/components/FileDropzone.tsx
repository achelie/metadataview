import { Icon } from '@iconify/react';
import uploadIcon from '@iconify-icons/lucide/upload-cloud';
import { forwardRef, useRef, useState } from 'react';

interface Props {
  accept: string;
  formats: string;
  onFile: (file: File) => void;
  disabled?: boolean;
}

export const FileDropzone = forwardRef<HTMLButtonElement, Props>(function FileDropzone({ accept, formats, onFile, disabled = false }, buttonRef) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const pick = (files: FileList | null) => { const file = files?.[0]; if (file) onFile(file); };
  const openPicker = () => {
    if (disabled || !input.current) return;
    input.current.value = '';
    input.current.click();
  };
  return (
    <div
      className={`dropzone ${dragging ? 'is-dragging' : ''} ${disabled ? 'is-disabled' : ''}`}
      onDragEnter={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); if (!disabled) pick(event.dataTransfer.files); }}
    >
      <input ref={input} type="file" accept={accept} className="sr-only" disabled={disabled} onChange={(event) => pick(event.currentTarget.files)} />
      <span className="dropzone-icon" aria-hidden="true"><Icon icon={uploadIcon} width="30" /></span>
      <div className="dropzone-copy"><strong>Drop a file here</strong><span id="file-dropzone-help">{formats}</span><button ref={buttonRef} className="button button-primary" type="button" onClick={openPicker} disabled={disabled} aria-describedby="file-dropzone-help">Choose a file</button></div>
      <small>Processed in this tab. Nothing is uploaded.</small>
    </div>
  );
});
