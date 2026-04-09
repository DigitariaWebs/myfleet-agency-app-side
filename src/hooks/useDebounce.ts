/**
 * Generic debounce hook.
 *
 * Returns a debounced copy of `value` that only updates after the
 * caller has stopped changing it for `delay` milliseconds.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchText, 300);
 */

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
