import React from 'react';
import { ExternalLink, Download } from 'lucide-react';
import timetableImg from '../assets/timetable.png';

function Timetable() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = timetableImg;
    link.download = 'timetable.png';
    link.click();
  };

  const handleOpen = () => {
    window.open(timetableImg, '_blank');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Semester Timetable</h1>
          <p>TY B.Tech CSE (Data Science) · Division A · AY 2026–2027 · Semester 5 · W.E.F. 27-07-2026</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={handleOpen}>
            <ExternalLink size={15} />
            Open
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={15} />
            Download
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '14px 14px 10px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{
          background: 'var(--bg-surface)', borderRadius: 10, overflow: 'hidden',
          border: '1.5px solid var(--border-color)',
          cursor: 'pointer', transition: 'box-shadow 0.2s ease',
        }}
          onClick={handleOpen}
          title="Click to open full size"
        >
          <img
            src={timetableImg}
            alt="Class Wise Time Table"
            style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
          />
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Click image to open full size · Right-click to save
        </div>
      </div>
    </div>
  );
}

export default Timetable;
