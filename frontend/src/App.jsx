import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Attendance from './pages/Attendance';
import Results from './pages/Results';
import StudentDetails from './pages/StudentDetails';
import Teachers from './pages/Teachers';
import Timetable from './pages/Timetable';
import NotFound from './pages/NotFound';
import QuizHome from './pages/Quiz/QuizHome';
import QuizAttempt from './pages/Quiz/QuizAttempt';
import QuizResult from './pages/Quiz/QuizResult';
import QuizAnalysis from './pages/Quiz/QuizAnalysis';
import QuizHistory from './pages/Quiz/QuizHistory';
import ErrorBoundary from './components/ErrorBoundary';

// Theme context
export const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dashboard_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dashboard_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/results" element={<Results />} />
            <Route path="/student-details" element={<StudentDetails />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/quiz" element={<ErrorBoundary><QuizHome /></ErrorBoundary>} />
            <Route path="/quiz/attempt/:attemptId" element={<ErrorBoundary><QuizAttempt /></ErrorBoundary>} />
            <Route path="/quiz/result/:attemptId" element={<ErrorBoundary><QuizResult /></ErrorBoundary>} />
            <Route path="/quiz/analysis/:attemptId" element={<ErrorBoundary><QuizAnalysis /></ErrorBoundary>} />
            <Route path="/quiz/history" element={<ErrorBoundary><QuizHistory /></ErrorBoundary>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;
