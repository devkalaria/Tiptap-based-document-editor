import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import type { PageMetrics } from './utils';

const key = new PluginKey('pagination');

// Helper: find DOM positions for block nodes
function getBlockDomRects(view: any): { pos: number; node: any; top: number; bottom: number; height: number; marginTop: number; marginBottom: number }[] {
  const rects: { pos: number; node: any; top: number; bottom: number; height: number; marginTop: number; marginBottom: number }[] = [];
  const { state } = view;
  const { doc } = state;
  let pos = 0;
  doc.descendants((node: any, posHere: number) => {
    if (node.isBlock) {
      const dom = view.nodeDOM(posHere) as HTMLElement | null;
      if (dom && dom instanceof HTMLElement) {
        const r = dom.getBoundingClientRect();
        const style = window.getComputedStyle(dom);
        rects.push({ 
          pos: posHere, 
          node, 
          top: r.top + window.scrollY, 
          bottom: r.bottom + window.scrollY, 
          height: r.height,
          marginTop: parseFloat(style.marginTop) || 0,
          marginBottom: parseFloat(style.marginBottom) || 0
        });
      }
      pos = posHere + node.nodeSize;
      return false;
    }
    return true;
  });
  return rects;
}

// Try to split an oversized paragraph inside to fit remaining space
function splitParagraphToFit(view: any, pos: number, remainingPx: number): boolean {
  const { state } = view;
  const $pos = state.doc.resolve(pos);
  const node = $pos.nodeAfter;
  if (!node || node.type.name !== 'paragraph') return false;

  const dom = view.nodeDOM(pos) as HTMLElement | null;
  if (!dom) return false;
  const textContent = node.textContent || '';
  if (textContent.length === 0) return false;

  // Binary search by character offset using range rect height
  let lo = 1, hi = textContent.length, best = 0;
  const textNode = dom.querySelector('p') ? dom.querySelector('p') : dom; // safety
  if (!textNode) return false;

  const measure = (count: number) => {
    // Create a range on the DOM paragraph and measure first N chars height
    const walker = document.createTreeWalker(dom, NodeFilter.SHOW_TEXT, null);
    let remaining = count;
    let startNode: Text | null = null;
    let endNode: Text | null = null;
    let startOffset = 0;
    let endOffset = 0;
    // Find start (first text node)
    while (walker.nextNode()) {
      const t = walker.currentNode as Text;
      if (t.nodeValue && t.nodeValue.length > 0) { startNode = t; startOffset = 0; break; }
    }
    if (!startNode) return 0;
    // Find where count ends
    const walker2 = document.createTreeWalker(dom, NodeFilter.SHOW_TEXT, null);
    while (walker2.nextNode()) {
      const t = walker2.currentNode as Text;
      const len = t.nodeValue ? t.nodeValue.length : 0;
      if (remaining <= len) { endNode = t; endOffset = remaining; break; }
      remaining -= len;
    }
    if (!endNode) return 0;
    const range = document.createRange();
    try {
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
    } catch {
      return 0;
    }
    const rect = range.getBoundingClientRect();
    return rect.height;
  };

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const h = measure(mid);
    if (h === 0) break;
    if (h <= remainingPx) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
  }

  if (best > 0 && best < textContent.length) {
    // Map char offset to document position inside the paragraph
    const startPos = pos + 1; // inside paragraph
    const splitPos = startPos + best;
    const tr = state.tr.split(splitPos);
    view.dispatch(tr);
    return true;
  }
  return false;
}

export function paginationPlugin({ pageMetrics }: { pageMetrics: PageMetrics }) {
  return new Plugin({
    key,
    state: {
      init() { return { metrics: pageMetrics }; },
      apply(tr: any, pluginState: any) {
        const updated = tr.getMeta('pagination:updateMetrics');
        if (updated) {
          return { ...pluginState, metrics: updated };
        }
        return pluginState;
      },
    },
    view(editorView: any) {
      let raf = 0;
      const recalc = () => {
        const pluginState: any = key.getState(editorView.state);
        const { contentHeightPx } = pluginState.metrics as PageMetrics;
        const rects = getBlockDomRects(editorView);
        if (rects.length === 0) return;

        const { state } = editorView;
        let tr = state.tr;
        let pageHeight = 0;
        let prevBottom = 0;

        for (let i = 0; i < rects.length; i++) {
          const r = rects[i];
          
          if (r.node.type.name === 'pageBreak') {
            // Check if this break is unnecessary (i.e., next block could fit on previous page)
            if (i + 1 < rects.length) {
              const next = rects[i + 1];
              // Use a small buffer (e.g. 1px) to avoid flickering on exact fits
              // Approximation: check if next block height + margins fits
              // We use next.height + next.marginTop (worst case non-collapsed) or just next.height
              if (pageHeight + next.height + next.marginTop <= contentHeightPx - 1) {
                // Remove the break
                tr = tr.deleteRange(r.pos, r.pos + r.node.nodeSize);
                editorView.dispatch(tr);
                return; // Restart logic next frame
              }
            }
            pageHeight = 0; // Reset for new page
            prevBottom = 0;
            continue;
          }

          let addedHeight = r.height;
          
          if (pageHeight === 0) {
             // First block on page: include its top margin
             addedHeight += r.marginTop;
          } else {
             // Subsequent block: add gap from previous
             // Gap = currentTop - prevBottom
             // This implicitly captures the collapsed margin between them
             const gap = r.top - prevBottom;
             addedHeight += Math.max(0, gap);
          }

          if (pageHeight + addedHeight > contentHeightPx) {
            // Overflow detected
            const isStartOfPage = pageHeight === 0;

            if (isStartOfPage) {
              // Block is larger than a single page
              // Try to split it to fit the whole page
              if (splitParagraphToFit(editorView, r.pos, contentHeightPx)) {
                return; // Split happened
              }
              // If can't split (e.g. image or heading), let it overflow
              pageHeight += addedHeight;
              prevBottom = r.bottom;
            } else {
              // Standard overflow: try to split to fit remaining space
              const remaining = contentHeightPx - pageHeight;
              // Note: splitParagraphToFit uses character measurement which is roughly linear.
              // It doesn't know about margins. But `remaining` is pixel space.
              if (splitParagraphToFit(editorView, r.pos, remaining)) {
                return; // Split happened
              }
              
              // If can't split, insert page break before this block
              tr = tr.insert(r.pos, editorView.state.schema.nodes.pageBreak.create());
              editorView.dispatch(tr);
              return; // Restart logic next frame
            }
          } else {
            pageHeight += addedHeight;
            prevBottom = r.bottom;
          }
        }
      };

      const schedule = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(recalc);
      };

      schedule();
      return {
        update() { schedule(); },
        destroy() { if (raf) cancelAnimationFrame(raf); },
      };
    },
  });
}
