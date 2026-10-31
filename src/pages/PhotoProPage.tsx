import { Link } from 'react-router-dom';
import PhotoProApp from '../modules/photo-pro/App';
import '../modules/photo-pro/styles.css';

export default function PhotoProPage() {
  return (
    <div className="tool-page photo-pro-page">
      <div className="tool-topbar">
        <Link to="/" className="back-link">← Back home</Link>
        <Link to="/booklet-maker" className="alt-link">Booklet maker</Link>
      </div>
      <PhotoProApp />
    </div>
  );
}
