import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import './styles.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

type ThemeChoice = 'light' | 'dark' | 'system';

const accentOptions = [
  '#3478F6',
  '#8250DF',
  '#159957',
  '#0F9D9A',
  '#E64980',
  '#D97706',
  '#DC2626',
  '#4F46E5',
];

const gradientAccents = new Map([
  ['#00B4DB', ['#00B4DB', '#0083B0']],
  ['#FF5F6D', ['#FF5F6D', '#FFC371']],
  ['#00B09B', ['#00B09B', '#96C93D']],
  ['#8E2DE2', ['#8E2DE2', '#4A00E0']],
  ['#F12711', ['#F12711', '#F5AF19']],
  ['#F953C6', ['#F953C6', '#B91D73']],
]);

function arrangeBooklet(selectedPages: number[]) {
  const pages: Array<number | null> = [...selectedPages];

  while (pages.length % 4 !== 0) {
    pages.push(null);
  }

  const output: Array<[number | null, number | null, number | null, number | null]> = [];
  const total = pages.length;

  for (let index = 0; index < total / 4; index += 1) {
    output.push([
      pages[total - 1 - 2 * index],
      pages[2 * index],
      pages[2 * index + 1],
      pages[total - 2 - 2 * index],
    ]);
  }

  return output;
}

function parseRange(input: string) {
  const entries = input.split(',');

  if (!input.trim() || entries.some((entry) => !entry.trim())) {
    throw new Error('Enter page numbers or ranges, for example 1-8, 11, 14-16.');
  }

  const pages = new Set<number>();

  for (const entry of entries) {
    const value = entry.trim();
    const match = value.match(/^(\d+)(?:\s*-\s*(\d+))?$/);

    if (!match) {
      throw new Error(`“${value}” is not a valid page selection.`);
    }

    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;

    if (end < start) {
      throw new Error(`“${value}” has an invalid range order.`);
    }

    for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
      pages.add(pageNumber);
    }
  }

  return [...pages].sort((a, b) => a - b);
}

function toSortedList(value: number[]) {
  return [...new Set(value)].sort((a, b) => a - b);
}

async function renderThumbnail(page: pdfjsLib.PDFPageProxy, quality: number) {
  const scale = quality / 100;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Unable to render the PDF preview.');
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvas,
    canvasContext: context,
    viewport,
  }).promise;

  return canvas.toDataURL('image/png');
}

export default function BookletMakerApp() {
  const [theme, setTheme] = useState<ThemeChoice>(() => {
    const stored = localStorage.getItem('starz-booklet-theme');
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });
  const [accent, setAccent] = useState(() => localStorage.getItem('starz-booklet-accent') ?? '#3478F6');
  const [fileName, setFileName] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeText, setRangeText] = useState('');
  const [thumbnails, setThumbnails] = useState<Array<{ pageNumber: number; src: string }>>([]);
  const [thumbnailQuality, setThumbnailQuality] = useState(60);
  const [columns, setColumns] = useState(3);
  const [notice, setNotice] = useState('');
  const [processing, setProcessing] = useState(false);

  const pdfBytesRef = useRef<Uint8Array | null>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    document.documentElement.style.setProperty('--booklet-accent', accent);
    document.documentElement.style.setProperty(
      '--booklet-accent-gradient',
      gradientAccents.get(accent)
        ? `linear-gradient(110deg, ${gradientAccents.get(accent)![0]}, ${gradientAccents.get(accent)![1]})`
        : accent,
    );
    document.documentElement.style.setProperty('--booklet-accent-hover', accent);
    localStorage.setItem('starz-booklet-theme', theme);
    localStorage.setItem('starz-booklet-accent', accent);
  }, [theme, accent]);

  const updateSelection = (pages: number[]) => {
    setSelectedPages(toSortedList(pages));
  };

  const handleLoadPdf = async (file: File | null) => {
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setNotice('PDFs must be 50 MB or smaller.');
      return;
    }

    try {
      setProcessing(true);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
      const allPages = Array.from({ length: pdf.numPages }, (_, index) => index + 1);

      const previews = await Promise.all(
        allPages.map(async (pageNumber) => {
          const page = await pdf.getPage(pageNumber);
          return {
            pageNumber,
            src: await renderThumbnail(page, thumbnailQuality),
          };
        }),
      );

      pdfBytesRef.current = bytes;
      pdfDocRef.current = pdf;
      setFileName(file.name);
      setPageCount(pdf.numPages);
      setThumbnails(previews);
      updateSelection(allPages);
      setNotice('PDF loaded successfully. Choose the pages you want in the booklet.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'This file could not be opened.');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!pdfDocRef.current || !pageCount) return;

    const refreshPreviews = async () => {
      const pdf = pdfDocRef.current;
      if (!pdf) return;

      const previews = await Promise.all(
        Array.from({ length: pageCount }, (_, index) => index + 1).map(async (pageNumber) => {
          const page = await pdf.getPage(pageNumber);
          return {
            pageNumber,
            src: await renderThumbnail(page, thumbnailQuality),
          };
        }),
      );

      setThumbnails(previews);
    };

    void refreshPreviews();
  }, [thumbnailQuality, pageCount]);

  const togglePage = (pageNumber: number) => {
    setSelectedPages((current) => {
      const next = current.includes(pageNumber)
        ? current.filter((page) => page !== pageNumber)
        : [...current, pageNumber];
      return [...new Set(next)].sort((a, b) => a - b);
    });
  };

  const applyRange = () => {
    try {
      const nextPages = parseRange(rangeText);
      const validPages = nextPages.filter((page) => page >= 1 && page <= pageCount);
      if (!validPages.length) {
        throw new Error('No valid page numbers were found in that range.');
      }
      updateSelection(validPages);
      setNotice(`${validPages.length} page(s) selected.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'The page selection could not be applied.');
    }
  };

  const selectAll = () => updateSelection(Array.from({ length: pageCount }, (_, index) => index + 1));
  const clearSelection = () => updateSelection([]);
  const selectOdd = () => updateSelection(Array.from({ length: pageCount }, (_, index) => index + 1).filter((page) => page % 2 === 1));
  const selectEven = () => updateSelection(Array.from({ length: pageCount }, (_, index) => index + 1).filter((page) => page % 2 === 0));

  const generateBooklet = async () => {
    if (!pdfBytesRef.current || !selectedPages.length) {
      setNotice('Upload a PDF and choose at least one page before generating.');
      return;
    }

    try {
      setProcessing(true);
      const sourceDoc = await PDFDocument.load(pdfBytesRef.current);
      const outputDoc = await PDFDocument.create();
      const arranged = arrangeBooklet(selectedPages.map((page) => page - 1));
      const pageWidth = 841.8898;
      const pageHeight = 595.2756;
      const halfWidth = pageWidth / 2;

      for (const [frontLeft, frontRight, backLeft, backRight] of arranged) {
        for (const [leftPage, rightPage] of [
          [frontLeft, frontRight],
          [backLeft, backRight],
        ]) {
          const sheetPage = outputDoc.addPage([pageWidth, pageHeight]);

          if (leftPage !== null) {
            const sourcePage = await sourceDoc.getPage(leftPage);
            const embeddedLeft = await outputDoc.embedPage(sourcePage);
            const size = sourcePage.getSize();
            const scale = Math.min(halfWidth / size.width, pageHeight / size.height);
            const width = size.width * scale;
            const height = size.height * scale;
            sheetPage.drawPage(embeddedLeft, {
              x: (halfWidth - width) / 2,
              y: (pageHeight - height) / 2,
              width,
              height,
            });
          }

          if (rightPage !== null) {
            const sourcePage = await sourceDoc.getPage(rightPage);
            const embeddedRight = await outputDoc.embedPage(sourcePage);
            const size = sourcePage.getSize();
            const scale = Math.min(halfWidth / size.width, pageHeight / size.height);
            const width = size.width * scale;
            const height = size.height * scale;
            sheetPage.drawPage(embeddedRight, {
              x: halfWidth + (halfWidth - width) / 2,
              y: (pageHeight - height) / 2,
              width,
              height,
            });
          }
        }
      }

      const bytes = await outputDoc.save();
      const pdfBuffer = bytes.slice().buffer as ArrayBuffer;
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `${fileName.replace(/\.[^/.]+$/, '') || 'booklet'}-a5.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice('Your print-ready booklet PDF has been generated successfully.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'The booklet export failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="booklet-app-shell" style={{ ['--accent' as string]: accent }}>
      <header className="booklet-topbar">
        <div className="brand-block">
          <span className="brand-badge">S</span>
          <div>
            <strong>STARz</strong>
            <span>Booklet Maker</span>
          </div>
        </div>

        <div className="booklet-controls">
          <Link className="booklet-help-link" to="/booklet-maker/how-to-use">
            How to use
          </Link>
          <label className="appearance-control">
            <span>Theme</span>
            <select value={theme} onChange={(event) => setTheme(event.target.value as ThemeChoice)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System default</option>
            </select>
          </label>

          <label className="appearance-control accent-control">
            <span>Accent</span>
            <select value={accent} onChange={(event) => setAccent(event.target.value)}>
              {accentOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <section className="booklet-intro">
        <div>
          <p className="eyebrow">YOUR PRINT WORKFLOW, SIMPLIFIED</p>
          <h1>
            Make a booklet.<br />
            <span>Page by page.</span>
          </h1>
          <p className="intro-copy">Choose the pages you need. We’ll arrange them in the right order for folding and printing.</p>
        </div>
        <div className="paper-preview" aria-hidden="true">
          <div className="booklet-paper paper-back" />
          <div className="booklet-paper paper-front">
            <span>8</span>
            <i />
            <span>1</span>
          </div>
          <div className="fold-line" />
        </div>
      </section>

      <section className="booklet-workspace">
        <div className="upload-panel" hidden={Boolean(fileName)}>
          <label className="upload-box" htmlFor="booklet-pdf-input">
            <span className="upload-icon" aria-hidden="true">⇪</span>
            <span>Choose PDF</span>
          </label>
          <input
            id="booklet-pdf-input"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] ?? null;
              void handleLoadPdf(selectedFile);
              event.target.value = '';
            }}
          />
          <small>PDF only · Up to 50 MB</small>
        </div>

        {fileName && (
          <div className="editor-panel">
            <div className="document-bar">
              <div className="document-info">
                <span className="pdf-pill">PDF</span>
                <div>
                  <strong>{fileName}</strong>
                  <span>{pageCount} pages</span>
                </div>
              </div>
              <label className="upload-link">
                <span>Change PDF</span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0] ?? null;
                    void handleLoadPdf(selectedFile);
                    event.target.value = '';
                  }}
                />
              </label>
            </div>

            <div className="selection-toolbar">
              <div className="selection-count">
                <strong>{selectedPages.length}</strong>
                <span>of {pageCount} pages selected</span>
              </div>
              <div className="selection-actions">
                <button type="button" onClick={selectAll}>Select all</button>
                <button type="button" onClick={clearSelection}>Clear</button>
                <button type="button" onClick={selectOdd}>Odd</button>
                <button type="button" onClick={selectEven}>Even</button>
              </div>
            </div>

            <div className="range-form">
              <label htmlFor="page-range">Select pages</label>
              <input
                id="page-range"
                value={rangeText}
                onChange={(event) => setRangeText(event.target.value)}
                placeholder="e.g. 1-8, 11, 14-16"
              />
              <button type="button" onClick={applyRange}>Apply range</button>
            </div>

            <div className="pages-heading">
              <div>
                <h2>Your pages</h2>
                <p>Click a page to include or remove it.</p>
              </div>
              <span>{pageCount}</span>
            </div>

            <div className="preview-controls">
              <label htmlFor="columns-select">Thumbnails per row</label>
              <select value={columns} onChange={(event) => setColumns(Number(event.target.value))}>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
              </select>
              <label htmlFor="quality-slider">Thumbnail quality</label>
              <input
                id="quality-slider"
                type="range"
                min="10"
                max="100"
                step="10"
                value={thumbnailQuality}
                onChange={(event) => setThumbnailQuality(Number(event.target.value))}
              />
              <output htmlFor="quality-slider">{thumbnailQuality}%</output>
            </div>

            <div className="page-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {thumbnails.map(({ pageNumber, src }) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`page-card${selectedPages.includes(pageNumber) ? ' selected' : ''}`}
                  onClick={() => togglePage(pageNumber)}
                >
                  <img src={src} alt={`Page ${pageNumber}`} />
                  <span className="card-check">✓</span>
                  <span className="page-number">Page {pageNumber}</span>
                </button>
              ))}
            </div>

            <div className="generate-bar">
              <div className="output-note">
                <span className="check-icon">✓</span>
                <span>
                  <strong>Ready for print</strong>
                  <small>A4 landscape · Blank pages added as needed</small>
                </span>
              </div>
              <button type="button" className="button-primary" disabled={!selectedPages.length || processing} onClick={() => void generateBooklet()}>
                {processing ? 'Generating...' : 'Generate booklet'}
              </button>
            </div>
          </div>
        )}
      </section>

      {notice && (
        <div className="booklet-notice" role="status">
          {notice}
        </div>
      )}
    </div>
  );
}
