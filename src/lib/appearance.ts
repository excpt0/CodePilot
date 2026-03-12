export type FontSizeKey = 'small' | 'default' | 'large' | 'extra-large';

interface FontSizeOption {
  px: number;
}

export const FONT_SIZES: Record<FontSizeKey, FontSizeOption> = {
  small:         { px: 14 },
  default:       { px: 16 },
  large:         { px: 18 },
  'extra-large': { px: 20 },
};

export const DEFAULT_FONT_SIZE: FontSizeKey = 'default';

/** Type guard: returns true if value is a valid FontSizeKey */
export function isValidFontSize(value: string | undefined | null): value is FontSizeKey {
  return typeof value === 'string' && value in FONT_SIZES;
}

/** Returns px value for a font size key, falling back to default if invalid */
export function getFontSizePx(key: FontSizeKey | string): number {
  if (isValidFontSize(key)) return FONT_SIZES[key].px;
  return FONT_SIZES[DEFAULT_FONT_SIZE].px;
}

export const APPEARANCE_STORAGE_KEY = 'codepilot_appearance_font_size';

/** Read font size from localStorage, returning DEFAULT_FONT_SIZE if missing or invalid. */
export function readFontSizeFromStorage(storage?: Storage): FontSizeKey {
  if (!storage) {
    if (typeof window === 'undefined') return DEFAULT_FONT_SIZE;
    storage = localStorage;
  }
  try {
    const raw = storage.getItem(APPEARANCE_STORAGE_KEY);
    return isValidFontSize(raw) ? raw : DEFAULT_FONT_SIZE;
  } catch {
    return DEFAULT_FONT_SIZE;
  }
}

/** Write font size to localStorage. */
export function writeFontSizeToStorage(size: FontSizeKey, storage?: Storage): void {
  if (!storage) {
    if (typeof window === 'undefined') return;
    storage = localStorage;
  }
  try {
    storage.setItem(APPEARANCE_STORAGE_KEY, size);
  } catch {
    // localStorage may be unavailable (SSR, private browsing quota)
  }
}
