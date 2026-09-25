export interface WindowRect {
  id: string;
  isOpen: boolean;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  x: number;
  y: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export const WINDOW_WIDTH = 450;
export const VIEWPORT_MARGIN = 8;
export const TASKBAR_HEIGHT = 30;
export const TITLEBAR_CLEARANCE = 80;

export interface ZOrderState<T extends WindowRect> {
  windows: T[];
  topZIndex: number;
}

export function clampToViewport<T extends WindowRect>(win: T, viewport: Viewport): T {
  const maxX = Math.max(VIEWPORT_MARGIN, viewport.width - WINDOW_WIDTH - VIEWPORT_MARGIN);
  const maxY = Math.max(VIEWPORT_MARGIN, viewport.height - TASKBAR_HEIGHT - TITLEBAR_CLEARANCE);
  return {
    ...win,
    x: Math.min(Math.max(VIEWPORT_MARGIN, win.x), maxX),
    y: Math.min(Math.max(VIEWPORT_MARGIN, win.y), maxY)
  };
}

export function bringToFront<T extends WindowRect>(windows: T[], id: string, topZIndex: number): ZOrderState<T> {
  const nextZ = topZIndex + 1;
  return {
    windows: windows.map((w) => (w.id === id ? { ...w, zIndex: nextZ } : w)),
    topZIndex: nextZ
  };
}

export interface OpenWindowResult<T extends WindowRect> extends ZOrderState<T> {
  opened: boolean;
}

export function openWindow<T extends WindowRect>(
  windows: T[],
  id: string,
  topZIndex: number,
  viewport?: Viewport
): OpenWindowResult<T> {
  const idx = windows.findIndex((w) => w.id === id);
  if (idx === -1) return { windows, topZIndex, opened: false };
  let win: T = { ...windows[idx], isOpen: true, minimized: false };
  if (viewport) win = clampToViewport(win, viewport);
  const nextZ = topZIndex + 1;
  win = { ...win, zIndex: nextZ };
  const nextWindows = windows.map((w, i) => (i === idx ? win : w));
  return { windows: nextWindows, topZIndex: nextZ, opened: true };
}

export interface CloseWindowResult<T extends WindowRect> {
  windows: T[];
  closed: boolean;
}

export function closeWindow<T extends WindowRect>(windows: T[], id: string): CloseWindowResult<T> {
  const idx = windows.findIndex((w) => w.id === id);
  if (idx === -1) return { windows, closed: false };
  const nextWindows = windows.map((w, i) =>
    i === idx ? { ...w, isOpen: false, minimized: false, maximized: false } : w
  );
  return { windows: nextWindows, closed: true };
}

export function minimizeWindow<T extends WindowRect>(windows: T[], id: string): T[] {
  return windows.map((w) => (w.id === id ? { ...w, minimized: true } : w));
}

export function toggleMaximize<T extends WindowRect>(windows: T[], id: string, topZIndex: number): ZOrderState<T> {
  const toggled = windows.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w));
  return bringToFront(toggled, id, topZIndex);
}

// Clicking the taskbar item: restore if minimized, otherwise minimize if it's
// already on top, else bring it to front.
export function taskbarClick<T extends WindowRect>(windows: T[], id: string, topZIndex: number): ZOrderState<T> {
  const win = windows.find((w) => w.id === id);
  if (!win) return { windows, topZIndex };
  if (win.minimized) {
    const restored = windows.map((w) => (w.id === id ? { ...w, minimized: false } : w));
    return bringToFront(restored, id, topZIndex);
  }
  if (win.zIndex === topZIndex) {
    return { windows: windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)), topZIndex };
  }
  return bringToFront(windows, id, topZIndex);
}

// A shrinking viewport can leave an already-open window hanging off-screen;
// pull any free (non-maximised) windows back inside.
export function clampOpenWindows<T extends WindowRect>(windows: T[], viewport: Viewport): T[] {
  return windows.map((w) => (w.isOpen && !w.maximized ? clampToViewport(w, viewport) : w));
}
