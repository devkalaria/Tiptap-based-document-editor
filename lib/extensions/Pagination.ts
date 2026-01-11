import { Extension } from '@tiptap/core';
import { paginationPlugin } from '@/lib/pagination/plugin';
import type { PageMetrics } from '@/lib/pagination/utils';

const Pagination = Extension.create<{ getMetrics: () => PageMetrics }>({
  name: 'pagination',
  addProseMirrorPlugins() {
    const getMetrics = this.options?.getMetrics;
    const initial = getMetrics ? getMetrics() : undefined;
    if (!initial) return [];
    return [paginationPlugin({ pageMetrics: initial })];
  },
  onTransaction({ transaction }) {
    const getMetrics = this.options?.getMetrics;
    const latest = getMetrics ? getMetrics() : undefined;
    if (!latest) return;
    // Ensure plugin sees latest metrics on each transaction
    transaction.setMeta('pagination:updateMetrics', latest);
  },
});

export default Pagination;
