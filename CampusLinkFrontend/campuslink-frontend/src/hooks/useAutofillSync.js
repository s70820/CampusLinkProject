import { useCallback, useEffect } from 'react';

/** Sync browser-autofilled values into React state so MUI labels shrink correctly. */
export function useAutofillSync(setFormData) {
  const syncFromDom = useCallback(() => {
    const inputs = document.querySelectorAll('.auth-glass-card input[name]');
    const updates = {};

    inputs.forEach((input) => {
      if (input.name && input.value) {
        updates[input.name] = input.value;
      }
    });

    if (Object.keys(updates).length > 0) {
      setFormData((prev) => ({ ...prev, ...updates }));
    }
  }, [setFormData]);

  useEffect(() => {
    syncFromDom();
    const timers = [100, 300, 600].map((delay) => window.setTimeout(syncFromDom, delay));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [syncFromDom]);

  return syncFromDom;
}

export default useAutofillSync;
