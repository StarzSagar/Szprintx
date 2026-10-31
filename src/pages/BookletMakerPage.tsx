import { Link } from 'react-router-dom';
import BookletMakerApp from '../modules/booklet-maker/BookletMakerApp';

export default function BookletMakerPage() {
  return (
    <div className="tool-page booklet-page">
      <div className="tool-topbar">
        <Link to="/" className="back-link">← Back home</Link>
        <Link to="/photo-pro" className="alt-link">Photo Pro</Link>
      </div>
      <BookletMakerApp />
    </div>
  );
}
