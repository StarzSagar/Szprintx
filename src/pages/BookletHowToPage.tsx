import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  FileUp,
  Printer,
  RotateCw,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import '../modules/booklet-maker/styles.css';
import './booklet-guide.css';

type DuplexMode = 'automatic' | 'manual';

function FoldIllustration() {
  return (
    <svg className="guide-illustration" viewBox="0 0 520 230" role="img" aria-labelledby="fold-title">
      <title id="fold-title">A4 landscape sheets fold into an A5 booklet</title>
      <defs>
        <marker id="fold-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="#3478f6" />
        </marker>
      </defs>
      <rect x="34" y="46" width="166" height="118" rx="8" fill="#fff" stroke="#b8c5d8" strokeWidth="2" />
      <path d="M117 47v116" stroke="#92a6c1" strokeDasharray="5 5" strokeWidth="2" />
      <text x="75" y="105" fill="#3478f6" fontSize="18" fontWeight="700">A4</text>
      <text x="126" y="105" fill="#3478f6" fontSize="18" fontWeight="700">A4</text>
      <text x="58" y="137" fill="#65758b" fontSize="11">landscape sheet</text>
      <path d="M216 105h72" stroke="#3478f6" strokeWidth="3" markerEnd="url(#fold-arrow)" />
      <path d="M316 68 390 48l72 21v117l-73 20-73-20Z" fill="#eaf2ff" stroke="#9eb5d3" strokeWidth="2" />
      <path d="m389 49 1 156" stroke="#c2d0e2" strokeWidth="2" />
      <path d="m390 49 72 20v117l-72 19Z" fill="#dbe9ff" />
      <path d="M408 89h35M408 102h35M408 115h26" stroke="#8ba4c3" strokeWidth="3" strokeLinecap="round" />
      <text x="332" y="129" fill="#3478f6" fontSize="18" fontWeight="700">A5</text>
      <text x="322" y="151" fill="#65758b" fontSize="11">folded booklet</text>
      <path d="M131 178c28 24 68 24 95 3" fill="none" stroke="#7ea7e8" strokeWidth="2" markerEnd="url(#fold-arrow)" />
    </svg>
  );
}

function PageSelectionIllustration() {
  return (
    <svg className="guide-illustration guide-selection-art" viewBox="0 0 520 190" role="img" aria-labelledby="selection-title">
      <title id="selection-title">PDF page thumbnails with selected pages highlighted</title>
      <rect x="68" y="28" width="84" height="126" rx="8" fill="#fff" stroke="#3478f6" strokeWidth="3" />
      <rect x="84" y="48" width="52" height="46" rx="4" fill="#dceaff" />
      <path d="M85 107h48M85 117h38M85 127h43" stroke="#c3ccda" strokeWidth="4" strokeLinecap="round" />
      <circle cx="139" cy="144" r="13" fill="#3478f6" />
      <path d="m133 144 4 4 8-9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="178" y="28" width="84" height="126" rx="8" fill="#fff" stroke="#3478f6" strokeWidth="3" />
      <rect x="194" y="48" width="52" height="46" rx="4" fill="#e7f4ff" />
      <path d="M195 107h48M195 117h38M195 127h43" stroke="#c3ccda" strokeWidth="4" strokeLinecap="round" />
      <circle cx="249" cy="144" r="13" fill="#3478f6" />
      <path d="m243 144 4 4 8-9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="288" y="28" width="84" height="126" rx="8" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="304" y="48" width="52" height="46" rx="4" fill="#f1f5f9" />
      <path d="M305 107h48M305 117h38M305 127h43" stroke="#d3dbe6" strokeWidth="4" strokeLinecap="round" />
      <circle cx="359" cy="144" r="13" fill="#e8edf4" />
      <path d="M354 144h10" stroke="#8392a7" strokeWidth="2" strokeLinecap="round" />
      <text x="391" y="88" fill="#3478f6" fontSize="14" fontWeight="700">KEEP</text>
      <text x="391" y="108" fill="#65758b" fontSize="11">selected pages</text>
      <text x="391" y="127" fill="#65758b" fontSize="11">are included</text>
    </svg>
  );
}

function PrinterIllustration({ mode }: { mode: 'auto' | 'front' | 'remove' | 'reload' | 'back' }) {
  const isFront = mode === 'front';
  const isBack = mode === 'back';
  const isReload = mode === 'reload';
  const isRemove = mode === 'remove';

  return (
    <svg className="guide-illustration printer-art" viewBox="0 0 480 230" role="img" aria-label={
      mode === 'auto' ? 'Printer automatically prints both sides of the sheet' :
        mode === 'front' ? 'Printer prints the first side of each sheet' :
          mode === 'remove' ? 'Remove the printed stack without changing its order' :
            mode === 'reload' ? 'Reinsert the paper stack following the printer feed direction' :
              'Printer prints the reverse side of each sheet'
    }>
      <defs>
        <marker id={`printer-arrow-${mode}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="#3478f6" />
        </marker>
      </defs>
      <path d="M145 73V36h190v37" fill="#fff" stroke="#9aabc0" strokeWidth="3" />
      <path d="M160 45h160v21H160z" fill="#edf4ff" stroke="#c7d7eb" strokeWidth="2" />
      <path d="M118 86q0-16 17-16h210q17 0 17 16v72H118z" fill="#dce6f2" stroke="#8296b1" strokeWidth="3" />
      <rect x="145" y="101" width="190" height="66" rx="8" fill="#fff" stroke="#9aabc0" strokeWidth="2" />
      <circle cx="317" cy="88" r="5" fill="#3478f6" />
      <path d="M175 114h125M175 126h95" stroke="#cad4e1" strokeWidth="4" strokeLinecap="round" />
      <path d="M198 167v22h85v-22" fill="#fff" stroke="#9aabc0" strokeWidth="2" />
      <path d="M226 156v27" stroke="#3478f6" strokeWidth="3" markerEnd={`url(#printer-arrow-${mode})`} />
      {mode === 'auto' ? (
        <>
          <path d="M363 94c35 6 42 23 35 42-7 18-21 27-44 27" fill="none" stroke="#3478f6" strokeWidth="3" markerEnd={`url(#printer-arrow-${mode})`} />
          <text x="355" y="78" fill="#3478f6" fontSize="12" fontWeight="700">both sides</text>
          <text x="37" y="119" fill="#3478f6" fontSize="13" fontWeight="700">A4 landscape</text>
          <text x="45" y="138" fill="#65758b" fontSize="11">duplex on</text>
        </>
      ) : (
        <>
          <rect x="372" y={isReload ? '82' : '112'} width="55" height="76" rx="5" fill={isBack ? '#e4efff' : '#fff'} stroke="#a9b8cb" strokeWidth="2" />
          <path d="M382 127h34M382 138h28M382 149h30" stroke={isFront ? '#3478f6' : '#bac5d3'} strokeWidth="3" strokeLinecap="round" />
          <text x="372" y="201" fill="#65758b" fontSize="11" fontWeight="700">
            {isFront ? 'ODD PAGES' : isBack ? 'EVEN PAGES' : isReload ? 'REINSERT' : 'KEEP ORDER'}
          </text>
          {isRemove && <path d="M351 123h26" stroke="#3478f6" strokeWidth="3" markerEnd={`url(#printer-arrow-${mode})`} />}
          {isReload && <path d="M398 72v35" stroke="#3478f6" strokeWidth="3" markerEnd={`url(#printer-arrow-${mode})`} />}
          {isBack && <path d="M364 116c-15-17-24-15-32-3" fill="none" stroke="#3478f6" strokeWidth="3" markerEnd={`url(#printer-arrow-${mode})`} />}
        </>
      )}
      <path d="M63 181h72" stroke="#a7b6c8" strokeWidth="2" strokeDasharray="5 5" />
      <path d="M345 181h20" stroke="#a7b6c8" strokeWidth="2" strokeDasharray="5 5" />
    </svg>
  );
}

function PaddingIllustration() {
  return (
    <svg className="guide-illustration padding-art" viewBox="0 0 500 150" role="img" aria-labelledby="padding-title">
      <title id="padding-title">Blank pages pad a booklet to a multiple of four</title>
      {[0, 1, 2, 3].map((page) => (
        <g key={page} transform={`translate(${48 + page * 92} 25)`}>
          <rect width="66" height="96" rx="7" fill={page > 1 ? '#f2f5f9' : '#fff'} stroke={page > 1 ? '#cbd5e1' : '#8db2ef'} strokeWidth="2" strokeDasharray={page > 1 ? '5 4' : undefined} />
          <text x="33" y="42" textAnchor="middle" fill={page > 1 ? '#94a3b8' : '#3478f6'} fontSize="12" fontWeight="700">{page < 2 ? `p${page + 1}` : 'blank'}</text>
          <text x="33" y="66" textAnchor="middle" fill="#7b8ba1" fontSize="10">{page > 1 ? 'padding' : 'content'}</text>
        </g>
      ))}
      <path d="M35 134h394" stroke="#d7e1ef" strokeWidth="2" />
    </svg>
  );
}

const manualSteps = [
  {
    title: 'Print the odd PDF pages',
    description: 'In the print dialog, choose odd pages only. These are the first-side pages in the booklet PDF.',
    image: 'front' as const,
  },
  {
    title: 'Remove the stack without changing its order',
    description: 'Take the printed sheets from the output tray and keep them in exactly the same order. Do not shuffle or turn individual sheets.',
    image: 'remove' as const,
  },
  {
    title: 'Reinsert the stack for your printer',
    description: 'Put the stack back in the input tray according to the printer’s paper-feed direction. The correct face-up/down and edge-first orientation depends on your printer.',
    image: 'reload' as const,
  },
  {
    title: 'Print the even PDF pages',
    description: 'Choose even pages only to print the reverse sides. Check page order and orientation on a small test before printing the complete booklet.',
    image: 'back' as const,
  },
];

const faq = [
  {
    question: 'Why does the booklet PDF use A4 landscape pages?',
    answer: 'Each output page is one A4 landscape sheet with two A5 pages side by side. Fold the printed sheets at the center to form the A5 booklet.',
  },
  {
    question: 'Should I select booklet mode in my printer settings?',
    answer: 'No. STARz Booklet Maker has already arranged the pages. Print the generated PDF as A4 landscape and do not apply booklet mode again in the printer driver.',
  },
  {
    question: 'Why are blank pages added?',
    answer: 'A folded sheet makes four booklet pages. The maker adds blank padding pages when needed so the selected content fills a whole number of sheets.',
  },
  {
    question: 'Which edge should I choose for duplex printing?',
    answer: 'A4 landscape with short-edge flip is a good starting setting for automatic duplex. Printer drivers vary, so make a small test print and confirm the back side is upright before printing everything.',
  },
];

export default function BookletHowToPage() {
  const [duplexMode, setDuplexMode] = useState<DuplexMode>('automatic');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="booklet-guide-page">
      <header className="guide-topbar">
        <Link to="/booklet-maker" className="guide-back-link"><ArrowLeft size={16} /> Back to Booklet Maker</Link>
        <div className="guide-brand"><span className="guide-brand-icon">S</span><span><b>STARz</b><small>BOOKLET MAKER GUIDE</small></span></div>
      </header>

      <main className="booklet-guide">
        <section className="guide-hero">
          <div className="guide-hero-copy">
            <span className="guide-eyebrow">A SIMPLE PRINTING GUIDE</span>
            <h1>Create your A5 booklet in just a few steps.</h1>
            <p>Turn selected pages from a PDF into an A5 booklet. STARz arranges the pages on A4 landscape sheets so you can print, fold, and read them in order.</p>
            <a className="guide-primary-link" href="#quick-start">Start with the quick guide <ArrowRight size={16} /></a>
          </div>
          <div className="guide-hero-visual"><FoldIllustration /></div>
        </section>

        <section className="guide-section" id="quick-start">
          <div className="guide-section-heading">
            <span className="guide-eyebrow">QUICK START</span>
            <h2>From PDF to folded booklet</h2>
            <p>Four simple steps to prepare your booklet for printing.</p>
          </div>
          <div className="guide-quick-grid">
            <article className="guide-quick-card">
              <span className="guide-step-index">01</span><FileUp size={21} />
              <h3>Import your PDF</h3><p>Choose the PDF you want to turn into a booklet.</p>
            </article>
            <article className="guide-quick-card guide-quick-selection">
              <span className="guide-step-index">02</span><Check size={21} />
              <h3>Select pages to KEEP</h3><p>Click the pages you want included. Selected pages are the ones that will be printed.</p>
              <PageSelectionIllustration />
            </article>
            <article className="guide-quick-card">
              <span className="guide-step-index">03</span><BookOpen size={21} />
              <h3>Generate booklet PDF</h3><p>Generate the arranged A4 landscape PDF from your selected pages.</p>
            </article>
            <article className="guide-quick-card">
              <span className="guide-step-index">04</span><Printer size={21} />
              <h3>Print the output</h3><p>Use automatic duplex or follow the manual duplex steps below.</p>
            </article>
          </div>
        </section>

        <section className="guide-section guide-duplex-section" id="duplex">
          <div className="guide-section-heading">
            <span className="guide-eyebrow">PRINT BOTH SIDES</span>
            <h2>Choose your duplex method</h2>
            <p>Use automatic duplex if your printer supports it, or print the two sides in separate passes.</p>
          </div>
          <div className="guide-tabs" role="tablist" aria-label="Duplex printing method">
            <button type="button" role="tab" aria-selected={duplexMode === 'automatic'} aria-controls="automatic-panel" onClick={() => setDuplexMode('automatic')}>
              <Printer size={17} /> Automatic Duplex
            </button>
            <button type="button" role="tab" aria-selected={duplexMode === 'manual'} aria-controls="manual-panel" onClick={() => setDuplexMode('manual')}>
              <RotateCw size={17} /> Manual Duplex
            </button>
          </div>

          {duplexMode === 'automatic' ? (
            <div className="guide-duplex-panel" id="automatic-panel" role="tabpanel">
              <div className="guide-duplex-copy">
                <span className="guide-panel-kicker">AUTOMATIC DOUBLE-SIDED PRINTING</span>
                <h3>Let the printer turn the sheets for you.</h3>
                <p>If your printer has automatic duplex, it can print both sides of each A4 sheet in one job. The printer feeds the sheet through, turns it internally, and prints the reverse side.</p>
                <ol className="guide-check-list">
                  <li><Check size={16} /> Set paper size to <b>A4</b> and orientation to <b>Landscape</b>.</li>
                  <li><Check size={16} /> Enable two-sided / duplex printing; use <b>short-edge flip</b> as the starting setting.</li>
                  <li><Check size={16} /> Print a small test and check that the reverse side is upright after folding.</li>
                </ol>
              </div>
              <div className="guide-diagram-card"><PrinterIllustration mode="auto" /><span className="guide-diagram-caption">A4 landscape · duplex enabled · short-edge flip</span></div>
            </div>
          ) : (
            <div className="guide-duplex-panel" id="manual-panel" role="tabpanel">
              <div className="guide-manual-intro">
                <div>
                  <span className="guide-panel-kicker">MANUAL DOUBLE-SIDED PRINTING</span>
                  <h3>The PDF already alternates front and back sides.</h3>
                  <p>Print odd PDF pages first, reload the sheets, then print even PDF pages. Keep the stack order unchanged between passes.</p>
                </div>
                <div className="guide-manual-warning"><ShieldAlert size={20} /><span><b>Test paper orientation first.</b> Printers feed paper differently. Print a small test before printing a complete booklet.</span></div>
              </div>
              <div className="guide-manual-steps">
                {manualSteps.map((step, index) => (
                  <article className="guide-manual-step" key={step.title}>
                    <div className="guide-manual-step-heading"><span>{index + 1}</span><div><h4>{step.title}</h4><p>{step.description}</p></div></div>
                    <div className="guide-manual-visual"><PrinterIllustration mode={step.image} /></div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="guide-section guide-padding-section">
          <div className="guide-section-heading">
            <span className="guide-eyebrow">WHY ARE THERE BLANK PAGES?</span>
            <h2>Booklet page counts come in fours</h2>
            <p>Each folded A4 sheet holds four A5 pages. The booklet maker automatically pads your selection with blank pages until the total is a multiple of four.</p>
          </div>
          <div className="guide-padding-card">
            <PaddingIllustration />
            <div className="guide-padding-table-wrap">
              <table className="guide-padding-table">
                <thead><tr><th>Selected pages</th><th>Blank pages added</th><th>Booklet total</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td>3</td><td>4</td></tr>
                  <tr><td>5</td><td>3</td><td>8</td></tr>
                  <tr><td>8</td><td>0</td><td>8</td></tr>
                  <tr><td>10</td><td>2</td><td>12</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="guide-section guide-tips-section">
          <div className="guide-section-heading">
            <span className="guide-eyebrow">BEFORE YOU PRINT</span>
            <h2>Printing tips</h2>
          </div>
          <div className="guide-tips-grid">
            <article><span>01</span><h3>Use A4 paper</h3><p>The output PDF uses A4 landscape sheets with two A5 pages on each side.</p></article>
            <article><span>02</span><h3>Print at Actual Size</h3><p>Choose Actual Size or 100% scale. Avoid “Fit to page” if it changes the intended page size.</p></article>
            <article><span>03</span><h3>Do not add booklet mode</h3><p>The pages are already imposed. Do not apply booklet mode again in the printer driver.</p></article>
            <article><span>04</span><h3>Test before a large job</h3><p>Check page order, paper feed direction, and back-side orientation on a small print first.</p></article>
          </div>
        </section>

        <section className="guide-section guide-faq-section">
          <div className="guide-section-heading">
            <span className="guide-eyebrow">NEED A HAND?</span>
            <h2>Frequently asked questions</h2>
          </div>
          <div className="guide-faq-list">
            {faq.map((item) => (
              <details key={item.question}>
                <summary>{item.question}<ArrowDown size={16} /></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="guide-bottom">
          <div><span className="guide-eyebrow">READY TO MAKE A BOOKLET?</span><h2>Back to your print workspace.</h2></div>
          <Link to="/booklet-maker" className="guide-primary-link"><ArrowLeft size={16} /> Back to Booklet Maker</Link>
        </footer>
      </main>
    </div>
  );
}
