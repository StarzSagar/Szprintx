import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Print workflow, simplified</span>
          <h1>Your Complete Printing Workspace.</h1>
          <p>
            Thoughtful tools for photo sheets, print-ready booklets, and more.
          </p>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="visual-card card-1">
            <Sparkles size={20} />
            <span>Photo Pro</span>
          </div>
          <div className="visual-card card-2">
            <span>A5</span>
            <small>Booklet Maker</small>
          </div>
          <div className="visual-orb orb-1" />
          <div className="visual-orb orb-2" />
        </div>
      </section>

      <section className="tools-grid" aria-label="Application tools">
        <article className="tool-card photo-card">
          <div className="tool-icon photo-icon">P</div>
          <div className="card-body">
            <h2>Photo Pro</h2>
            <p>
              Create passport photo sheets, arrange photographs, edit images and export print-ready PDFs.
            </p>
          </div>
          <Link to="/photo-pro" className="tool-link">
            Open Photo Pro <ArrowRight size={16} />
          </Link>
        </article>

        <article className="tool-card booklet-card">
          <div className="tool-icon booklet-icon">B</div>
          <div className="card-body">
            <h2>A5 Booklet Maker</h2>
            <p>
              Turn your PDF documents into perfectly arranged, print-ready A5 booklets.
            </p>
          </div>
          <Link to="/booklet-maker" className="tool-link">
            Open Booklet Maker <ArrowRight size={16} />
          </Link>
        </article>

        <article className="tool-card three-sp-card">
          <div className="tool-icon three-sp-icon">3</div>
          <div className="card-body">
            <h2>3SP</h2>
            <p>Three Step Printing</p>
          </div>
          <button type="button" className="tool-link module-disabled" disabled>
            Explore 3SP <ArrowRight size={16} />
          </button>
        </article>
      </section>
    </div>
  );
}
