import { useEffect, useRef } from 'react';
import { takeToolFile } from './store';

export function useIncomingToolFile(onSelect: (file: File) => void): void {
  const select = useRef(onSelect);
  select.current = onSelect;
  useEffect(() => {
    const file = takeToolFile(window.location.pathname);
    if (file) select.current(file);
  }, []);
}
