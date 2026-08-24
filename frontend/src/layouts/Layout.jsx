import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { ToastContainer } from '../components/Toast';
import useToast from '../hooks/useToast';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/courses': 'Courses',
  '/attendance': 'Attendance',
  '/results': 'Results',
  '/student-details': 'Student Details',
  '/teachers': 'Course Teachers',
  '/timetable': 'Semester Timetable',
};

// Toast context
export const ToastCtx = React.createContext(null);

function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const toast = useToast();

  const title = PAGE_TITLES[location.pathname] || 'Dashboard';

  return (
    <ToastCtx.Provider value={toast}>
      <div className="app-layout">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className={`main-area ${collapsed ? 'sidebar-collapsed' : ''}`}>
          <Header
            pageTitle={title}
            onMobileMenuToggle={() => setMobileOpen(m => !m)}
          />

          <main className="page-content">
            <Outlet />
          </main>

          <footer className="footer">
            Student Academic Dashboard &nbsp;•&nbsp; TY B.Tech Data Science &nbsp;•&nbsp; Academic Year 2026–2027
            <br />
            <span style={{ fontSize: 11 }}>Built as an academic dashboard project. Data shown is for demonstration purposes.</span>
          </footer>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} />
    </ToastCtx.Provider>
  );
}

export default Layout;
