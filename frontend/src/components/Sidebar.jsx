import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, BarChart2, Award, User,
  Users, Calendar, ChevronLeft, ChevronRight, GraduationCap, PenSquare
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
  { to: '/attendance', icon: BarChart2, label: 'Attendance' },
  { to: '/results', icon: Award, label: 'Results' },
  { to: '/quiz', icon: PenSquare, label: 'Quiz & Practice' },
  { to: '/student-details', icon: User, label: 'Student Details' },
  { to: '/teachers', icon: Users, label: 'Course Teachers' },
  { to: '/timetable', icon: Calendar, label: 'Timetable' },
];

function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay visible" onClick={onMobileClose} aria-hidden="true" />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <GraduationCap size={20} color="#fff" />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">EduPortal</span>
            <span className="sidebar-logo-sub">TY B.Tech DS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {!collapsed && (
            <div className="nav-section-label">Navigation</div>
          )}
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onMobileClose}
              aria-label={item.label}
            >
              <item.icon size={18} className="nav-item-icon" />
              <span className="nav-item-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer / Collapse toggle */}
        <div className="sidebar-footer">
          <button
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRight size={18} />
              : <><ChevronLeft size={18} /><span className="nav-item-label">Collapse</span></>
            }
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
