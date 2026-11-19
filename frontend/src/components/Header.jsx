import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, Search, Menu, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useTheme } from '../App';
import { searchAPI } from '../services/api';

function StudentAvatar() {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="user-avatar" aria-hidden="true">SU</div>;
  return (
    <div className="user-avatar" aria-hidden="true" style={{ overflow: 'hidden', position: 'relative', fontSize: 0 }}>
      <img
        src="/student-photo/sainath-ukirde.jpg"
        alt="Sainath Ukirde"
        onError={() => setFailed(true)}
        style={{
          position: 'absolute',
          width: '180%',
          height: '180%',
          objectFit: 'cover',
          objectPosition: 'center 28%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'block',
        }}
      />
    </div>
  );
}

function Header({ pageTitle, onMobileMenuToggle }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults(null);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults(null); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchAPI.search(query);
        setResults(data);
      } catch { setResults(null); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (item) => {
    setQuery('');
    setResults(null);
    if (item.type === 'course') navigate('/courses');
    else if (item.type === 'teacher') navigate('/teachers');
    else if (item.type === 'student') navigate('/student-details');
  };

  const hasResults = results && (results.courses?.length || results.teachers?.length || results.student);

  const notifications = [
    { id: 1, text: 'Attendance updated for Full Stack', time: '2h ago' },
    { id: 2, text: 'New result posted for DAA', time: '1d ago' },
    { id: 3, text: 'Timetable for Sem 5 available', time: '3d ago' },
  ];

  return (
    <header className="header">
      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={onMobileMenuToggle} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="header-left">
        <h1 className="header-page-title">{pageTitle}</h1>

        {/* Search */}
        <div className="header-search" ref={searchRef}>
          <Search size={15} className="header-search-icon" />
          <input
            className="header-search-input"
            type="search"
            placeholder="Search courses, teachers..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Global search"
            autoComplete="off"
          />
          {(hasResults || searching) && (
            <div className="search-results-dropdown">
              {searching && (
                <div style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 13 }}>Searching...</div>
              )}
              {results?.courses?.map(c => (
                <div key={c.id} className="search-result-item" onClick={() => handleResultClick(c)}>
                  <span className="search-result-type course">Course</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.teacher_name}</div>
                  </div>
                </div>
              ))}
              {results?.teachers?.map(t => (
                <div key={t.id} className="search-result-item" onClick={() => handleResultClick(t)}>
                  <span className="search-result-type teacher">Teacher</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.course_name}</div>
                  </div>
                </div>
              ))}
              {results?.student && (
                <div className="search-result-item" onClick={() => handleResultClick(results.student)}>
                  <span className="search-result-type student">Student</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{results.student.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PRN: {results.student.prn}</div>
                  </div>
                </div>
              )}
              {results && !hasResults && !searching && (
                <div style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 13 }}>No results found</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        {/* Theme Toggle */}
        <button
          className="header-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="header-btn"
            onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span className="notification-badge" aria-label="3 notifications" />
          </button>
          {notifOpen && (
            <div className="user-dropdown" style={{ minWidth: 280 }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                Notifications
              </div>
              {notifications.map(n => (
                <div key={n.id} className="user-dropdown-item" onClick={() => setNotifOpen(false)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="user-dropdown-wrapper" ref={dropdownRef}>
          <button
            className="user-avatar-btn"
            onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            <StudentAvatar />
            <span className="user-name">Sainath Ukirde</span>
            <ChevronDown size={13} color="var(--text-muted)" />
          </button>

          {dropdownOpen && (
            <div className="user-dropdown">
              <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Sainath Ukirde</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>TY B.Tech Data Science</div>
              </div>
              <button className="user-dropdown-item" onClick={() => { navigate('/student-details'); setDropdownOpen(false); }}>
                <User size={15} /> Profile
              </button>
              <button className="user-dropdown-item" onClick={() => { navigate('/student-details'); setDropdownOpen(false); }}>
                <Settings size={15} /> Settings
              </button>
              <div className="user-dropdown-divider" />
              <button className="user-dropdown-item danger" onClick={() => {
                setDropdownOpen(false);
                alert('Logout functionality — connect your auth provider to enable.');
              }}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
