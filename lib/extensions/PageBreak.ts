import { Node, mergeAttributes } from '@tiptap/core';

const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: false,
  isolating: false,
  parseHTML() {
    return [
      { tag: 'hr[data-page-break]' },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['hr', mergeAttributes(HTMLAttributes, { 'data-page-break': 'true', class: 'page-break' })];
  },
});

export default PageBreak;
