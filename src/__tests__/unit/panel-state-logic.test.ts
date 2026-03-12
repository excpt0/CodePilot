/**
 * Tests for panel open/close state logic on route changes.
 *
 * Bug: panel always re-opens when switching between chats,
 * ignoring user's manual close.
 *
 * Run with: npx tsx --test src/__tests__/unit/panel-state-logic.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { computePanelOpenOnRouteChange } from '../../lib/panel-state-logic';

describe('computePanelOpenOnRouteChange', () => {
  // --- Navigating away from chat ---

  it('closes panel when navigating away from chat detail route', () => {
    const result = computePanelOpenOnRouteChange(
      /* isChatDetailRoute */ false,
      /* previousPanelOpen */ true,
      /* wasChatDetailRoute */ true,
    );
    assert.equal(result, false);
  });

  it('keeps panel closed when already closed and navigating away', () => {
    const result = computePanelOpenOnRouteChange(false, false, true);
    assert.equal(result, false);
  });

  // --- Entering chat from non-chat route ---

  it('opens panel when entering chat detail from non-chat route', () => {
    const result = computePanelOpenOnRouteChange(
      /* isChatDetailRoute */ true,
      /* previousPanelOpen */ false,
      /* wasChatDetailRoute */ false,
    );
    assert.equal(result, true);
  });

  // --- Switching between chats (the bug scenario) ---

  it('preserves closed state when switching between chats', () => {
    // User manually closed the panel, then clicks another chat
    const result = computePanelOpenOnRouteChange(
      /* isChatDetailRoute */ true,
      /* previousPanelOpen */ false,
      /* wasChatDetailRoute */ true,
    );
    assert.equal(result, false, 'panel should stay closed when user closed it');
  });

  it('preserves open state when switching between chats', () => {
    // User has panel open, clicks another chat
    const result = computePanelOpenOnRouteChange(
      /* isChatDetailRoute */ true,
      /* previousPanelOpen */ true,
      /* wasChatDetailRoute */ true,
    );
    assert.equal(result, true, 'panel should stay open when user left it open');
  });

  // --- Edge cases ---

  it('opens panel when navigating from non-chat to chat even if previously closed', () => {
    // From settings to a chat — panel should open regardless of previous state
    const result = computePanelOpenOnRouteChange(true, false, false);
    assert.equal(result, true);
  });

  it('keeps panel closed when on non-chat route regardless of previous state', () => {
    const result = computePanelOpenOnRouteChange(false, false, false);
    assert.equal(result, false);
  });
});
