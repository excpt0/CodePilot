/**
 * Unit tests for appearance settings constants, validation, and lookup helpers.
 *
 * Run with: npx tsx --test src/__tests__/unit/appearance-settings.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  FONT_SIZES,
  DEFAULT_FONT_SIZE,
  isValidFontSize,
  getFontSizePx,
  APPEARANCE_STORAGE_KEY,
  readFontSizeFromStorage,
  writeFontSizeToStorage,
} from '../../lib/appearance';
import type { FontSizeKey } from '../../lib/appearance';

describe('Appearance Settings Constants', () => {
  it('should have 4 font size presets', () => {
    assert.equal(Object.keys(FONT_SIZES).length, 4);
  });

  it('should have all sizes in ascending order', () => {
    const pxValues = Object.values(FONT_SIZES).map(s => s.px);
    for (let i = 1; i < pxValues.length; i++) {
      assert.ok(pxValues[i] > pxValues[i - 1], `${pxValues[i]} should be > ${pxValues[i - 1]}`);
    }
  });

  it('should have default font size as a valid key', () => {
    assert.ok(DEFAULT_FONT_SIZE in FONT_SIZES);
  });

  it('default font size should map to 16px', () => {
    assert.equal(FONT_SIZES[DEFAULT_FONT_SIZE].px, 16);
  });
});

describe('Appearance Settings Validation', () => {
  it('should validate known font size keys', () => {
    assert.equal(isValidFontSize('small'), true);
    assert.equal(isValidFontSize('default'), true);
    assert.equal(isValidFontSize('large'), true);
    assert.equal(isValidFontSize('extra-large'), true);
  });

  it('should reject invalid font size keys', () => {
    assert.equal(isValidFontSize('huge'), false);
    assert.equal(isValidFontSize(''), false);
    assert.equal(isValidFontSize(undefined as unknown as string), false);
  });
});

describe('Appearance Settings Lookup Helpers', () => {
  it('should return px for valid font size', () => {
    assert.equal(getFontSizePx('large'), 18);
  });

  it('should fall back to default for invalid font size', () => {
    assert.equal(getFontSizePx('huge' as FontSizeKey), FONT_SIZES[DEFAULT_FONT_SIZE].px);
  });
});

describe('Appearance Settings localStorage helpers', () => {
  let store: Record<string, string> = {};
  const mockStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
  } as unknown as Storage;

  it('APPEARANCE_STORAGE_KEY should be a namespaced string', () => {
    store = {};
    assert.ok(APPEARANCE_STORAGE_KEY.startsWith('codepilot_'));
  });

  it('writeFontSizeToStorage should write valid key', () => {
    store = {};
    writeFontSizeToStorage('large', mockStorage);
    assert.equal(store[APPEARANCE_STORAGE_KEY], 'large');
  });

  it('readFontSizeFromStorage should return stored value', () => {
    store = { [APPEARANCE_STORAGE_KEY]: 'small' };
    assert.equal(readFontSizeFromStorage(mockStorage), 'small');
  });

  it('readFontSizeFromStorage should return default for missing key', () => {
    store = {};
    assert.equal(readFontSizeFromStorage(mockStorage), DEFAULT_FONT_SIZE);
  });

  it('readFontSizeFromStorage should return default for invalid value', () => {
    store = { [APPEARANCE_STORAGE_KEY]: 'huge' };
    assert.equal(readFontSizeFromStorage(mockStorage), DEFAULT_FONT_SIZE);
  });
});

describe('Anti-FOUC font-size map consistency', () => {
  it('FONT_SIZES px values should match the anti-FOUC inline map', () => {
    const expected: Record<string, number> = {
      small: 14,
      default: 16,
      large: 18,
      'extra-large': 20,
    };
    for (const [key, opt] of Object.entries(FONT_SIZES)) {
      assert.equal(opt.px, expected[key], `FONT_SIZES[${key}].px should be ${expected[key]}`);
    }
    assert.equal(Object.keys(FONT_SIZES).length, Object.keys(expected).length);
  });
});
