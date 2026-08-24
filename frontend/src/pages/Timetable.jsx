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

      <div className="card" style={{ padding: 16, textAlign: 'center' }}>
        <img
          src={timetableImg}
          alt="Class Wise Time Table"
          style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, cursor: 'pointer' }}
          onClick={handleOpen}
        />
      </div>
    </div>
  );
}

export default Timetable;
