import {
  ArrowRight,
  BookOpen,
  Check,
  FileImage,
  FileText,
  Layers,
  LockKeyhole,
  Printer,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const tools = [
  {
    icon: FileImage,
    title: 'Photo Pro',
    description:
      'Prepare photo sheets with flexible layouts, image adjustments, and styling options, then export a print-ready PDF.',
    to: '/photo-pro',
    action: 'Explore Photo Pro',
    className: 'about-feature-photo',
    status: null,
  },
  {
    icon: BookOpen,
    title: 'A5 Booklet Maker',
    description:
      'Arrange the pages of a PDF into booklet order so it can be printed, folded, and read as an A5 booklet.',
    to: '/booklet-maker',
    action: 'Explore Booklet Maker',
    className: 'about-feature-booklet',
    status: null,
  },
  {
    icon: Printer,
    title: '3SP (Three Step Printing)',
    description:
      'A streamlined three-step printing workflow to help prepare a print job from start to finish.',
    to: null,
    action: null,
    className: 'about-feature-three-sp',
    status: 'Coming soon',
  },
];

const workflow = [
  {
    icon: FileText,
    title: 'Choose a tool',
    description: 'Open the photo workspace or the booklet maker for the job at hand.',
  },
  {
    icon: Layers,
    title: 'Prepare your layout',
    description: 'Adjust the content and layout in the editor, with a preview as you work.',
  },
  {
    icon: Printer,
    title: 'Export for print',
    description: 'Download a PDF that is ready to take to your printer or print at home.',
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <span className="eyebrow"><Sparkles size={14} /> About the studio</span>
          <h1>Print preparation, made more straightforward.</h1>
          <p>
            STARz Print Studio brings focused print tools together in one place:
            prepare photo sheets, turn PDFs into print-ready booklets, and more.
          </p>
          <div className="about-hero-actions">
            <Link to="/photo-pro" className="primary-action">
              Open Photo Pro <ArrowRight size={16} />
            </Link>
            <span className="about-hero-note"><Check size={15} /> Made for everyday print jobs</span>
          </div>
        </div>
        <div className="about-hero-art" aria-hidden="true">
          <div className="about-art-glow" />
          <div className="about-art-sheet about-art-sheet-back"><span /></div>
          <div className="about-art-sheet about-art-sheet-front">
            <div className="about-art-photo" />
            <span />
            <span />
            <span />
          </div>
          <div className="about-art-label"><Printer size={16} /> Print-ready workflow</div>
        </div>
      </section>

      <section className="about-tools-section" aria-labelledby="about-tools-heading">
        <div className="about-section-heading">
          <span className="eyebrow">What you can do</span>
          <h2 id="about-tools-heading">Print tools, all in one workspace.</h2>
          <p>Choose the tool that matches what you need to prepare.</p>
        </div>
        <div className="about-feature-grid">
          {tools.map(({ icon: Icon, title, description, to, action, className, status }) => (
            <article className={`about-feature-card ${className}`} key={title}>
              {status && <span className="about-feature-status">{status}</span>}
              <span className="about-feature-icon"><Icon size={22} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
              {to && action && (
                <Link to={to} className="about-feature-link">
                  {action} <ArrowRight size={16} />
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="about-workflow-section" aria-labelledby="about-workflow-heading">
        <div className="about-section-heading">
          <span className="eyebrow">A simple flow</span>
          <h2 id="about-workflow-heading">From your files to a finished PDF.</h2>
        </div>
        <div className="about-workflow-grid">
          {workflow.map(({ icon: Icon, title, description }, index) => (
            <article className="about-workflow-step" key={title}>
              <span className="about-step-number">0{index + 1}</span>
              <span className="about-step-icon"><Icon size={20} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-privacy">
        <span className="about-privacy-icon"><LockKeyhole size={22} /></span>
        <div>
          <span className="eyebrow">Your files</span>
          <h2>Work with your documents in the browser.</h2>
          <p>
            STARz Print Studio processes your selected photos and PDFs in the
            browser for editing and export. Your files are not uploaded to a
            STARz account as part of the editing workflow.
          </p>
        </div>
      </section>

      <section className="about-closing">
        <div>
          <span className="eyebrow">Ready when you are</span>
          <h2>Make your next print job a little easier.</h2>
        </div>
        <div className="about-closing-links">
          <Link to="/photo-pro" className="tool-link">Open Photo Pro <ArrowRight size={16} /></Link>
          <Link to="/booklet-maker" className="back-link">Open Booklet Maker</Link>
        </div>
      </section>
    </div>
  );
}
