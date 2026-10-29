"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Modern React hook to subscribe to browser localStorage using useSyncExternalStore.
 *
 * Mentoring Note:
 * In React 18 & 19, `useSyncExternalStore` is the recommended standard for subscribing
 * to external stores like browser APIs (localStorage, matchMedia, etc.).
 * Unlike `useEffect` + `setState` which can trigger cascading renders and hydration
 * flashes, `useSyncExternalStore` safely defines a server snapshot and a client snapshot.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Subscribe to storage changes across tabs and local dispatches
  const subscribe = useCallback(
    (callback: () => void) => {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === key) callback();
      };
      window.addEventListener("storage", handleStorage);
      window.addEventListener("local-storage-change", callback);
      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("local-storage-change", callback);
      };
    },
    [key]
  );

  const getSnapshot = useCallback((): string => {
    try {
      const item = window.localStorage.getItem(key);
      return item ?? JSON.stringify(initialValue);
    } catch {
      return JSON.stringify(initialValue);
    }
  }, [key, initialValue]);

  const getServerSnapshot = useCallback((): string => {
    return JSON.stringify(initialValue);
  }, [initialValue]);

  const rawValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  let parsedValue: T;
  try {
    parsedValue = JSON.parse(rawValue);
  } catch {
    parsedValue = initialValue;
  }

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const currentItem = window.localStorage.getItem(key);
        const currentParsed: T = currentItem ? JSON.parse(currentItem) : initialValue;
        const valueToStore =
          value instanceof Function ? value(currentParsed) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(new Event("local-storage-change"));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, initialValue]
  );

  return [parsedValue, setValue];
}
