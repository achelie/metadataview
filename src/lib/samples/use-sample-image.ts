import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSampleImage, sampleImageId, type SampleImageId } from './catalog';

export function useSampleImage(id: SampleImageId) {
  const request = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const cancel = useCallback(() => {
    request.current?.abort();
    request.current = null;
    setLoading(false);
    setError(false);
  }, []);

  useEffect(() => () => {
    request.current?.abort();
    request.current = null;
  }, []);

  const load = async (onSelect: (file: File) => void) => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(false);
    try {
      const file = await fetchSampleImage(id, controller.signal);
      if (request.current !== controller || controller.signal.aborted) return;
      request.current = null;
      setLoading(false);
      onSelect(file);
    } catch {
      if (request.current !== controller || controller.signal.aborted) return;
      request.current = null;
      setLoading(false);
      setError(true);
    }
  };

  return { id, loading, error, load, cancel, sampleId: sampleImageId, isSample: (file: File | null) => sampleImageId(file) !== undefined };
}

export type SampleImageState = ReturnType<typeof useSampleImage>;
