# 🧾 Legal Document Editor

*A production-grade, print-accurate WYSIWYG editor for legal professionals*

A modern, distraction-free document editor built with **Next.js 14** and **Tiptap (ProseMirror)**.  
It delivers **true US Letter layout fidelity**, **real-time pagination**, and **print-perfect output**, making it ideal for drafting legal documents, contracts, and formal reports.

---

## project is live :
https://tiptap-based-document-editor.vercel.app/

## 🚀 Quickstart

### Install dependencies
npm install

### Start the development server
npm run dev

### Open the application
http://localhost:3000

---

## ✨ Features

### 📄 Pagination & Layout
- **True US Letter Standard** — 8.5" × 11" pages with fixed 1-inch margins  
- **Real-Time Pagination** — content flows automatically as you type or edit  
- **Smart Paragraph Splitting** — long paragraphs split using binary search (no clipped text)  
- **Margin-Aware Calculations** — accounts for line height, padding, and paragraph margins  
- **Visual Page Breaks** — subtle shadows and clean page separation  
- **Page Numbers** — bottom-center (screen-only by default)

---

### ✍️ Rich Text Formatting
- **Typography** — professional serif/sans-serif font stack  
- **Headings** — H1, H2, H3  
- **Basic Styling** — Bold, Italic, Underline  
- **Lists** — bulleted and numbered  
- **Text Alignment** — Left, Center, Right, Justify  
- **Blockquotes** — styled for legal citations  
- **History** — Undo / Redo  
- **Placeholder** — “Start typing…” for empty documents  

---

### 🛠️ Production Utilities
- **Document Title Management** — rename directly from the header  
- **Auto-Save**
  - Saves content and title to localStorage  
  - Status indicators: Saving…, Saved, Offline  
- **Zoom Controls**
  - 50% → 150%  
  - Affects only editor view, not print output  
- **Print / PDF Export**
  - Dedicated export button  
  - `@media print` ensures 1:1 screen-to-print accuracy  
  - UI hidden during print  
- **Overflow Protection**
  - Visual warnings if content exceeds printable bounds  

---

### 💻 Technical & Developer Experience
- **Type-Safe Codebase** — built with TypeScript  
- **Component-Oriented Architecture** — clear separation of concerns  
- **Custom Tiptap Extensions**
  - `PageBreak` — visual page separation node  
  - `Pagination` — ProseMirror plugin for layout logic  

---

## 🏗️ Architecture

**Tech Stack**
- Next.js 14 (App Router)  
- Tiptap (ProseMirror)  
- Tailwind CSS  
- TypeScript  

---

## 📁 Directory Structure
.
├── app/
│   └── globals.css        # Global styles & print rules
├── components/
│   ├── Editor.tsx         # Core editor & page backdrop logic
│   └── Toolbar.tsx        # Formatting toolbar
├── lib/
│   ├── pagination/
│   │   └── plugin.ts      # Pagination engine
│   └── extensions/
│       └── PageBreak.ts   # Custom page break node
└── README.md

---

## 🔍 How Pagination Works
- Measures a 1-inch DOM element to calculate screen DPI  
- Renders a true 8.5-inch wide page  
- Calculates layout after every editor transaction  
- Uses binary search to split overflowing content precisely  
- Renders visual page backdrops while keeping a single editor instance  

---

## 🤝 Contributing
1. Fork the repository  
2. Create a feature branch  
3. Commit your changes  
4. Submit a Pull Request  

---

*Built for the Legal Document Editor Assessment — focused on precision, usability, and production readiness.*
