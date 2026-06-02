type DragOptions = {
  handle?: string;
  disabled?: boolean;
  /** Reports the new top-left (px) on every move so the caller can keep its own
   *  state in sync — otherwise a re-render would snap the node back to its bound
   *  start position. */
  onMove?: (x: number, y: number) => void;
};
type DragParam = string | DragOptions;

export function draggable(node: HTMLElement, param: DragParam = {}) {
  let handle: string | undefined;
  let disabled = false;
  let onMove: ((x: number, y: number) => void) | undefined;

  function apply(p: DragParam) {
    if (typeof p === 'string') {
      handle = p;
      disabled = false;
      onMove = undefined;
    } else {
      handle = p?.handle;
      disabled = !!p?.disabled;
      onMove = p?.onMove;
    }
  }
  apply(param);

  // Pointer position at the last move, plus the node's own current top-left. We
  // track left/top internally (seeded from the computed style on mousedown) rather
  // than re-reading getComputedStyle each move, so a re-render mid-drag can't make
  // the deltas drift.
  let pointerX = 0;
  let pointerY = 0;
  let left = 0;
  let top = 0;

  function handleMousedown(event: MouseEvent) {
    if (disabled) return; // e.g. on mobile, where windows are fixed/maximised

    if (handle) {
      const el = node.querySelector(handle);
      if (el && !el.contains(event.target as Node)) {
        return;
      }
    }

    pointerX = event.clientX;
    pointerY = event.clientY;

    const style = window.getComputedStyle(node);
    top = parseInt(style.top, 10) || 0;
    left = parseInt(style.left, 10) || 0;

    window.addEventListener('mousemove', handleMousemove);
    window.addEventListener('mouseup', handleMouseup);
  }

  function handleMousemove(event: MouseEvent) {
    const dx = event.clientX - pointerX;
    const dy = event.clientY - pointerY;

    pointerX = event.clientX;
    pointerY = event.clientY;

    // Constrain to the viewport so a window can never be dragged fully off-screen
    // and lost: the title bar must always stay reachable.
    const margin = 60; // px of the window that must remain visible horizontally
    const taskbar = 30; // bottom bar height reserved for WinXP
    const minLeft = margin - node.offsetWidth;
    const maxLeft = window.innerWidth - margin;
    const minTop = 0; // never let the title bar go above the top edge
    const maxTop = window.innerHeight - taskbar - 30; // keep the title bar above the taskbar

    left = Math.min(Math.max(left + dx, minLeft), maxLeft);
    top = Math.min(Math.max(top + dy, minTop), maxTop);

    node.style.left = `${left}px`;
    node.style.top = `${top}px`;
    onMove?.(left, top); // keep the caller's bound state in sync
  }

  function handleMouseup() {
    window.removeEventListener('mousemove', handleMousemove);
    window.removeEventListener('mouseup', handleMouseup);
  }

  node.addEventListener('mousedown', handleMousedown);

  return {
    update(p: DragParam) {
      apply(p);
    },
    destroy() {
      node.removeEventListener('mousedown', handleMousedown);
      handleMouseup();
    }
  };
}
