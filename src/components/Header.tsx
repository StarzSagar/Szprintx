import { Link, NavLink } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link${isActive ? ' active' : ''}`;

  return (
    <header className="site-header">
      <div className="brand-wrap">
        <Link to="/" className="brand" aria-label="STARz Print Studio home">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-text">
            <strong>STARz</strong>
            <small>Print Studio</small>
          </span>
        </Link>
      </div>

      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/" className={navClass} end>
          Home
        </NavLink>
        <NavLink to="/about" className={navClass}>
          About
        </NavLink>
        <NavLink to="/photo-pro" className={navClass}>
          Photo Pro
        </NavLink>
        <NavLink to="/booklet-maker" className={navClass}>
          A5 Booklet Maker
        </NavLink>
      </nav>

      <button type="button" className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}
