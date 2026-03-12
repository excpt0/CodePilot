'use client';

import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import {
  type FontSizeKey,
  DEFAULT_FONT_SIZE,
  isValidFontSize,
  getFontSizePx,
  readFontSizeFromStorage,
  writeFontSizeToStorage,
} from '@/lib/appearance';

interface AppearanceContextValue {
  fontSize: FontSizeKey;
  setFontSize: (size: FontSizeKey) => void;
}

export const AppearanceContext = createContext<AppearanceContextValue>({
  fontSize: DEFAULT_FONT_SIZE,
  setFontSize: () => {},
});

function applyToDocument(size: FontSizeKey) {
  document.documentElement.style.fontSize = `${getFontSizePx(size)}px`;
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage (sync — matches anti-FOUC script)
  const [fontSize, setFontSizeState] = useState<FontSizeKey>(() => readFontSizeFromStorage());

  // On mount: fetch from API in case localStorage is stale, then reconcile.
  // API is the source of truth — if it disagrees with localStorage, API wins.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/settings/app');
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        const savedSize = data.settings?.appearance_font_size;
        const apiSize = isValidFontSize(savedSize) ? savedSize : DEFAULT_FONT_SIZE;
        const localSize = readFontSizeFromStorage();

        // Only update if API disagrees with localStorage
        if (apiSize !== localSize) {
          writeFontSizeToStorage(apiSize);
          applyToDocument(apiSize);
          setFontSizeState(apiSize);
        }
      } catch {
        // ignore — localStorage value already applied by anti-FOUC script
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const setFontSize = useCallback((size: FontSizeKey) => {
    setFontSizeState(size);
    writeFontSizeToStorage(size);
    applyToDocument(size);
    // Persist to API (fire and forget)
    fetch('/api/settings/app', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: { appearance_font_size: size } }),
    }).catch(() => {});
  }, []);

  const value = useMemo(() => ({ fontSize, setFontSize }), [fontSize, setFontSize]);

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}
