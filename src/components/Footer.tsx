import { Camera, Code2, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-contact" aria-label="Contact the developer">
        <div className="footer-contact-heading">
          <span className="footer-contact-eyebrow">SAY HELLO</span>
          <span className="footer-contact-title">Contact the developer</span>
        </div>
        <div className="footer-contact-links">
          <a href="https://github.com/starzsagar" target="_blank" rel="noreferrer">
            <span className="footer-contact-icon"><Code2 size={18} aria-hidden="true" /></span>
            <span className="footer-contact-copy"><b>GitHub</b><small>@starzsagar</small></span>
          </a>
          <a href="https://www.instagram.com/starz_sagar/" target="_blank" rel="noreferrer">
            <span className="footer-contact-icon"><Camera size={18} aria-hidden="true" /></span>
            <span className="footer-contact-copy"><b>Instagram</b><small>@starz_sagar</small></span>
          </a>
          <a href="mailto:starzsagar07@gmail.com">
            <span className="footer-contact-icon"><Mail size={18} aria-hidden="true" /></span>
            <span className="footer-contact-copy"><b>Email</b><small>starzsagar07@gmail.com</small></span>
          </a>
        </div>
      </div>
    </footer>
  );
}
