import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Response interceptor for global error handling
api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.error || err.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export const studentAPI = {
  get: () => api.get('/student'),
  update: (id, data) => api.put(`/student/${id}`, data)
};

export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`)
};

export const attendanceAPI = {
  getAll: () => api.get('/attendance'),
  getSummary: () => api.get('/attendance/summary'),
  update: (data) => api.post('/attendance', data)
};

export const resultsAPI = {
  getAll: () => api.get('/results'),
  getSummary: () => api.get('/results/summary'),
  upsert: (data) => api.post('/results', data)
};

export const teachersAPI = {
  getAll: () => api.get('/teachers')
};

export const timetableAPI = {
  getAll: () => api.get('/timetable'),
  getToday: () => api.get('/timetable/today')
};

export const settingsAPI = {
  getAll: () => api.get('/settings'),
  update: (key, value) => api.put(`/settings/${key}`, { value })
};

export const searchAPI = {
  search: (q) => api.get(`/search?q=${encodeURIComponent(q)}`)
};

export const quizAPI = {
  getSubjects:       ()               => api.get('/quizzes/subjects'),
  getStatistics:     ()               => api.get('/quizzes/statistics'),
  getPerformance:    ()               => api.get('/quizzes/performance'),
  getSubjectAnalysis:()               => api.get('/quizzes/subject-analysis'),
  getTopicAnalysis:  ()               => api.get('/quizzes/topic-analysis'),
  getInsights:       ()               => api.get('/quizzes/insights'),
  getHistory:        (params = {})    => api.get('/quizzes/history', { params }),
  getHistoryFn:      ()               => api.get('/quizzes/history'),
  startQuiz:         (data)           => api.post('/quizzes/start', data),
  saveAnswer:        (id, data)       => api.post(`/quizzes/${id}/answer`, data),
  submitQuiz:        (id, data)       => api.post(`/quizzes/${id}/submit`, data),
  getResult:         (id)             => api.get(`/quizzes/${id}/result`),
  getAnalysis:       (id)             => api.get(`/quizzes/${id}/analysis`),
  retakeQuiz:        (id)             => api.post(`/quizzes/${id}/retake`),
  getAttemptQuestions: (id)           => api.get(`/quizzes/${id}/questions`),
};

export default api;
