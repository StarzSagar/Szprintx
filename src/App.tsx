import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Header, { type ThemeMode, type ThemeSelection } from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PhotoProPage from './pages/PhotoProPage';
import BookletMakerPage from './pages/BookletMakerPage';
import BookletHowToPage from './pages/BookletHowToPage';

const themeModes: ThemeMode[] = [
  'light',
  'dark',
  'emerald',
  'nether-crimson',
  'nether-warped',
  'deep-ocean',
];

const darkThemeModes = themeModes.filter((theme) => theme !== 'light');

function isThemeMode(theme: string | null): theme is ThemeMode {
  return themeModes.includes(theme as ThemeMode);
}

function isThemeSelection(theme: string | null): theme is ThemeSelection {
  return isThemeMode(theme) || theme === 'nether' || theme === 'auto-dark' || theme === 'auto-light' || theme === 'auto-all';
}

function getInitialThemeSelection(): ThemeSelection {
  const stored = localStorage.getItem('starz-main-theme');
  if (stored === 'nether-crimson' || stored === 'nether-warped') return 'nether';
  return isThemeSelection(stored) ? stored : 'nether';
}

function App() {
  const [themeSelection, setThemeSelection] = useState<ThemeSelection>(getInitialThemeSelection);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const selection = localStorage.getItem('starz-main-theme');
    const stored = localStorage.getItem('starz-current-theme');

    if (selection === 'nether-crimson' || selection === 'nether-warped') return selection;
    if (selection === 'nether') {
      return stored === 'nether-warped' ? 'nether-warped' : 'nether-crimson';
    }
    if (isThemeMode(selection)) return selection;
    if (!isThemeSelection(selection)) return 'nether-crimson';
    if (isThemeMode(stored)) return stored;
    return 'nether-crimson';
  });

  const handleThemeSelectionChange = (selection: ThemeSelection) => {
    document.documentElement.classList.remove('theme-fading');
    setThemeSelection(selection);
    if (selection === 'nether') {
      setTheme('nether-crimson');
    } else if (isThemeMode(selection)) {
      setTheme(selection);
    }
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('starz-current-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('starz-main-theme', themeSelection);

    const isNetherCycle = themeSelection === 'nether';
    if (!isNetherCycle && themeSelection !== 'auto-dark' && themeSelection !== 'auto-light' && themeSelection !== 'auto-all') return;

    const availableThemes: ThemeMode[] = isNetherCycle
      ? ['nether-crimson', 'nether-warped']
      : themeSelection === 'auto-light'
        ? ['light']
        : themeSelection === 'auto-dark'
          ? darkThemeModes
          : themeModes;

    let intervalId = 0;
    let fadeTimeoutId = 0;
    const switchTheme = () => {
      if (availableThemes.length < 2) return;

      document.documentElement.classList.add('theme-fading');
      window.clearTimeout(fadeTimeoutId);
      fadeTimeoutId = window.setTimeout(() => {
        document.documentElement.classList.remove('theme-fading');
      }, 3000);

      setTheme((currentTheme) => {
        const nextThemes = availableThemes.filter((candidate) => candidate !== currentTheme);
        return nextThemes[Math.floor(Math.random() * nextThemes.length)];
      });
    };

    const firstSwitchTimeoutId = window.setTimeout(() => {
      switchTheme();
      intervalId = window.setInterval(switchTheme, isNetherCycle ? 15000 : 10000);
    }, isNetherCycle ? 12000 : 7000);

    return () => {
      window.clearTimeout(firstSwitchTimeoutId);
      window.clearInterval(intervalId);
      window.clearTimeout(fadeTimeoutId);
      document.documentElement.classList.remove('theme-fading');
    };
  }, [themeSelection]);

  return (
    <BrowserRouter>
      <AppLayout theme={theme} themeSelection={themeSelection} onThemeChange={handleThemeSelectionChange} />
    </BrowserRouter>
  );
}

function AppLayout({
  theme,
  themeSelection,
  onThemeChange,
}: {
  theme: ThemeMode;
  themeSelection: ThemeSelection;
  onThemeChange: (theme: ThemeSelection) => void;
}) {
  const { pathname } = useLocation();
  const isHomePage = pathname === '/';
  const isLandingPage = isHomePage || pathname === '/about';
  const isPhotoProPage = pathname === '/photo-pro';

  return (
    <div className={`site-shell${isPhotoProPage ? ' editor-shell' : ''}${isLandingPage ? ' pixel-shell' : ''}`}>
      {isLandingPage && theme === 'deep-ocean' && <OceanScene />}
      {isLandingPage && (theme === 'nether-crimson' || theme === 'nether-warped') && (
        <div className="nether-scene" aria-hidden="true">
          <div className="nether-ghast">
            <span className="ghast-face"><i /><i /><i /></span>
            <span className="ghast-tentacles" />
          </div>
          <div className="nether-island island-left"><span className="nether-enderman"><i /><b /></span></div>
          <div className="nether-island island-center"><span className="nether-enderman"><i /><b /></span></div>
          <div className="nether-island island-right"><span className="nether-enderman"><i /><b /></span></div>
        </div>
      )}
      {isLandingPage && <Header theme={themeSelection} onThemeChange={onThemeChange} />}
      <main className="site-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/photo-pro" element={<PhotoProPage />} />
          <Route path="/booklet-maker" element={<BookletMakerPage />} />
          <Route path="/booklet-maker/how-to-use" element={<BookletHowToPage />} />
        </Routes>
      </main>
      {isLandingPage && <Footer />}
    </div>
  );
}

function OceanScene() {
  const [guardianVisible, setGuardianVisible] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(max-width: 600px)').matches
    ) {
      return;
    }

    let appearanceTimeout = 0;
    let disappearanceTimeout = 0;
    let cancelled = false;

    const scheduleAppearance = () => {
      appearanceTimeout = window.setTimeout(() => {
        if (cancelled) return;
        setGuardianVisible(true);
        disappearanceTimeout = window.setTimeout(() => {
          setGuardianVisible(false);
          scheduleAppearance();
        }, 4000);
      }, 20000 + Math.random() * 40000);
    };

    scheduleAppearance();

    return () => {
      cancelled = true;
      window.clearTimeout(appearanceTimeout);
      window.clearTimeout(disappearanceTimeout);
    };
  }, []);

  return (
    <div className="ocean-scene" aria-hidden="true">
      <div className="ocean-rays" />
      <div className="ocean-particles" />
      <div className="ocean-bubbles" />
      <div className="ocean-monument">
        <span className="monument-roof" />
        <span className="monument-body" />
        <span className="monument-pillar monument-pillar-left" />
        <span className="monument-pillar monument-pillar-right" />
        <span className="monument-core">
          <span className="heart-of-sea" />
        </span>
      </div>
      <span className="ocean-fish fish-one"><i /></span>
      <span className="ocean-fish fish-two"><i /></span>
      <span className="ocean-fish fish-three"><i /></span>
      <span className="ocean-school"><i /><i /><i /><i /></span>
      <div className={`ocean-guardian${guardianVisible ? ' guardian-visible' : ''}`}>
        <span className="guardian-eye" />
        <i /><i /><i /><i /><i /><i /><i /><i />
      </div>
    </div>
  );
}

export default App;
