/**
 * Pure logic for computing panel open/close state on route changes.
 *
 * Extracted from AppShell so it can be unit-tested without React.
 */

/**
 * Determines what the panel open state should be after a route change.
 *
 * Rules:
 * - Navigating away from a chat detail route → close the panel
 * - Navigating between chat detail routes (switching chats) → preserve user's preference
 * - Navigating to a chat detail route from a non-chat route → open the panel
 *
 * @param isChatDetailRoute  Whether the new route is a chat detail route (/chat/[id])
 * @param previousPanelOpen  Whether the panel was open before the route change
 * @param wasChatDetailRoute Whether the previous route was also a chat detail route
 * @returns The new panelOpen value
 */
export function computePanelOpenOnRouteChange(
  isChatDetailRoute: boolean,
  previousPanelOpen: boolean,
  wasChatDetailRoute: boolean,
): boolean {
  if (!isChatDetailRoute) {
    return false;
  }
  // Switching between chats → preserve user's preference
  if (wasChatDetailRoute) {
    return previousPanelOpen;
  }
  // Entering chat from non-chat route → open
  return true;
}
