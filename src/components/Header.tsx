import { Link, NavLink } from 'react-router-dom';

interface HeaderProps {
  theme: 'light' | 'dark' | 'emerald';
  onThemeChange: (theme: HeaderProps['theme']) => void;
}

export default function Header({ theme, onThemeChange }: HeaderProps) {
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

      <label className="theme-picker">
        <span className="sr-only">Choose color theme</span>
        <select
          className="theme-select"
          value={theme}
          onChange={(event) => onThemeChange(event.target.value as HeaderProps['theme'])}
          aria-label="Choose color theme"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="emerald">Emerald Glow</option>
        </select>
      </label>
    </header>
  );
}
