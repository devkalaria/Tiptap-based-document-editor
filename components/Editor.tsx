"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import PageBreak from '@/lib/extensions/PageBreak';
import { computePageMetrics } from '@/lib/pagination/utils';
import clsx from 'clsx';
import Pagination from '@/lib/extensions/Pagination';
import PageBackdrop from '@/components/PageBackdrop';
import Toolbar from '@/components/Toolbar';
import { Check, Cloud, CloudOff } from 'lucide-react';
import { ZoomControl } from '@/components/ZoomControl';
import { PrintButton } from '@/components/PrintButton';
import { OverflowWarning } from '@/components/OverflowWarning';
import { saveToCloud, fetchFromCloud } from '@/lib/cloud';

const defaultContent = `\n      <h1>Untitled Document</h1>\n      <p>Type to see automatic pagination. This editor aims for US Letter print accuracy with 1 inch margins.</p>\n      <p><strong>Formatting:</strong> Headings, bold, italic, bullet lists are supported. Try pasting longer content to see reflow.</p>\n      <ul>\n        <li>First point</li>\n        <li>Second point</li>\n        <li>Third point</li>\n      </ul>\n    `;

export default function Editor() {
  const [scale, setScale] = useState(1.0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [dpi, setDpi] = useState<number | null>(null);
  const [pageMetrics, setPageMetrics] = useState<import('@/lib/pagination/utils').PageMetrics | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [hasOverflow, setHasOverflow] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [title, setTitle] = useState("Untitled Document");
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Measure DPI from CSS inch for print-accurate px
  useEffect(() => {
    const el = document.createElement('div');
    el.style.width = '1in';
    el.style.height = '1in';
    el.style.position = 'absolute';
    el.style.left = '-1000in';
    document.body.appendChild(el);
    const dpiMeasured = el.offsetWidth; // pixels per inch
    document.body.removeChild(el);
    setDpi(dpiMeasured || 96);
  }, []);

  useEffect(() => {
    if (!dpi) return;
    setPageMetrics(computePageMetrics(dpi));
  }, [dpi]);

  // Load from localStorage if exists otherwise default content
  const [loadedContent, setLoadedContent] = useState<string|undefined>(undefined);

  useEffect(() => {
    // Prefer cloud content if present, fallback to local
    async function loadCloud() {
      const savedTitle = localStorage.getItem('doc-title');
      if (savedTitle) setTitle(savedTitle);

      const cloud = await fetchFromCloud();
      if (cloud && cloud.content) setLoadedContent(cloud.content);
      else {
        const stored = localStorage.getItem('doc-content');
        if (stored) setLoadedContent(stored);
        else setLoadedContent(defaultContent);
      }
    }
    loadCloud();
  }, []);



  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1,2,3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start typing your legal document...',
      }),
      PageBreak,
      Pagination.configure({ getMetrics: () => pageMetrics! }),
    ],
    content: loadedContent || defaultContent, // Ensures document loads from localStorage or default

    onUpdate: ({ editor }) => {
      if (!pageMetrics) return;

      setSaveStatus('saving');
      // Auto-save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        const html = editor.getHTML();
        localStorage.setItem('doc-content', html);
        saveToCloud(html).then(() => setSaveStatus('saved')).catch(() => setSaveStatus('error'));
      }, 800);

      // Recalculate page count based on pageBreak nodes
      let breaks = 0;
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'pageBreak') breaks++;
        return true; 
      });
      setPageCount(breaks + 1);
      setHasOverflow(false);
    },
    editorProps: {
      attributes: { class: 'prose-doc focus:outline-none' },
    },
  }, [pageMetrics]);

  // Recompute pages on mount and after any change
  useEffect(() => {
    if (!editor) return;
    let breaks = 0;
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'pageBreak') breaks++;
      return true;
    });
    setPageCount(breaks + 1);
  }, [editor, editor?.state.doc]);

  if (!pageMetrics) {
    return (
      <div className="text-sm text-gray-500">Measuring display DPI…</div>
    );
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    localStorage.setItem('doc-title', newTitle);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      {/* Header Bar */}
      <div className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Document Title */}
            <input 
              value={title}
              onChange={handleTitleChange}
              className="text-lg font-medium text-ink placeholder:text-gray-400 border-none focus:ring-0 p-0 bg-transparent w-full max-w-md truncate"
              placeholder="Untitled Document"
            />
            {/* Save Status */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 select-none">
              {saveStatus === 'saved' && <><Check size={14} className="text-green-600" /> Saved</>}
              {saveStatus === 'saving' && <><Cloud size={14} className="animate-pulse" /> Saving...</>}
              {saveStatus === 'error' && <><CloudOff size={14} className="text-red-500" /> Offline</>}
            </div>
          </div>

          <div className="flex items-center gap-3">
             <ZoomControl scale={scale} setScale={setScale} />
             <PrintButton />
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="max-w-[1200px] mx-auto px-4 pb-2">
           <Toolbar editor={editor} />
        </div>
      </div>

      <div ref={containerRef} className="relative w-full flex justify-center my-6">
        {/* Backdrop pages */}
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.15s' }}>
          <PageBackdrop pageMetrics={pageMetrics} pageCount={pageCount} />
          {/* Editable layer */}
          <div
            className="absolute pointer-events-auto"
            style={{
              width: `${pageMetrics.contentWidthPx}px`,
              minHeight: `${pageMetrics.contentHeightPx}px`,
              top: `${pageMetrics.marginPx}px`,
              left: `${pageMetrics.marginPx}px`,
              ['--page-break-height' as string]: `${pageMetrics.marginPx * 2 + 24}px`,
            }}
          >
            <div ref={contentRef}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
      <OverflowWarning active={hasOverflow} />
    </div>
  );
}
