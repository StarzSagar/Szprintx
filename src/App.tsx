import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PhotoProPage from './pages/PhotoProPage';
import BookletMakerPage from './pages/BookletMakerPage';
import BookletHowToPage from './pages/BookletHowToPage';

type ThemeMode = 'light' | 'dark';

function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('starz-main-theme');
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('starz-main-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <BrowserRouter>
      <AppLayout theme={theme} onToggleTheme={toggleTheme} />
    </BrowserRouter>
  );
}

function AppLayout({
  theme,
  onToggleTheme,
}: {
  theme: ThemeMode;
  onToggleTheme: () => void;
}) {
  const { pathname } = useLocation();
  const isHomePage = pathname === '/';
  const isLandingPage = isHomePage || pathname === '/about';
  const isPhotoProPage = pathname === '/photo-pro';

  return (
    <div className={`site-shell${isPhotoProPage ? ' editor-shell' : ''}${isLandingPage ? ' pixel-shell' : ''}`}>
      {isLandingPage && <Header theme={theme} onToggleTheme={onToggleTheme} />}
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

export default App;
