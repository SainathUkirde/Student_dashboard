require('dotenv').config({ path: require('path').join(__dirname, '../.env.example') });
const { getDb } = require('./db');

const db = getDb();

console.log('🌱 Seeding database...\n');

// Clear existing data and reset auto-increment counters
db.exec(`
  DELETE FROM quiz_answers;
  DELETE FROM quiz_attempts;
  DELETE FROM quiz_questions;
  DELETE FROM results;
  DELETE FROM attendance;
  DELETE FROM timetable;
  DELETE FROM courses;
  DELETE FROM teachers;
  DELETE FROM students;
  DELETE FROM settings;
  DELETE FROM sqlite_sequence WHERE name IN ('students','courses','teachers','attendance','results','timetable','settings','quiz_questions','quiz_attempts','quiz_answers');
`);

// Seed settings
const settingsStmt = db.prepare(`INSERT OR REPLACE INTO settings (key, value, description) VALUES (?, ?, ?)`);
settingsStmt.run('attendance_threshold', '75', 'Minimum attendance percentage required');
settingsStmt.run('current_semester', '5', 'Current active semester');
settingsStmt.run('academic_year', '2026-2027', 'Current academic year');
settingsStmt.run('cgpa', '8.75', 'Cumulative GPA (demo value)');
console.log('✅ Settings seeded');

// Seed teachers
const teacherStmt = db.prepare(`INSERT INTO teachers (name, abbreviation, designation, department, linkedin_url) VALUES (?, ?, ?, ?, ?)`);
const teachers = [
  { name: 'Aparna Kulkarni', abbr: 'AK', designation: 'Assistant Professor', dept: 'Computer Science', linkedin: 'https://www.linkedin.com/in/aparna-kulkarni-73a50521/' },
  { name: 'Ritu Dudhmal', abbr: 'RD', designation: 'Assistant Professor', dept: 'Computer Science', linkedin: 'https://www.linkedin.com/in/ritu-dudhmal-6733ab32a/' },
  { name: 'Pankaj Vishwakarma', abbr: 'PV', designation: 'Assistant Professor', dept: 'Computer Science', linkedin: 'https://www.linkedin.com/in/pankaj-kumar-vishwakarma-991541207/' },
  { name: 'Vaishali Wangikar', abbr: 'VW', designation: 'Assistant Professor', dept: 'Computer Science', linkedin: 'https://www.linkedin.com/in/dr-vaishali-wangikar-8a31a219/' },
  { name: 'Sayali Kalbhor', abbr: 'SK', designation: 'Assistant Professor', dept: 'Computer Science', linkedin: 'https://www.linkedin.com/in/sayali-kalbhor-92196b109/' },
  { name: 'Laxmi Kale', abbr: 'LK', designation: 'Assistant Professor', dept: 'Computer Science', linkedin: null },
  { name: 'S. Bidkar', abbr: 'SB', designation: 'Assistant Professor', dept: 'Computer Science', linkedin: null },
  { name: 'A. Joshi', abbr: 'AJ', designation: 'Assistant Professor', dept: 'Computer Science', linkedin: null },
];
const teacherIds = {};
teachers.forEach(t => {
  const result = teacherStmt.run(t.name, t.abbr, t.designation, t.dept, t.linkedin);
  teacherIds[t.abbr] = result.lastInsertRowid;
});
console.log('✅ Teachers seeded');

// Seed courses (dashboard courses mapped to teachers)
const courseStmt = db.prepare(`INSERT INTO courses (course_code, course_name, abbreviation, teacher_id, credits, course_type, description) VALUES (?, ?, ?, ?, ?, ?, ?)`);
const courses = [
  { code: 'FS301', name: 'Full Stack', abbr: 'FS', teacher: 'AK', credits: 4, type: 'Theory + Lab', desc: 'Full Stack Web Development including frontend and backend technologies' },
  { code: 'DAA301', name: 'Design and Analysis of Algorithms', abbr: 'DAA', teacher: 'RD', credits: 4, type: 'Theory', desc: 'Analysis and design of algorithms, complexity theory' },
  { code: 'AGAI301', name: 'Agentic AI', abbr: 'AgAI', teacher: 'PV', credits: 3, type: 'Theory', desc: 'Foundations of Agentic AI and autonomous systems' },
  { code: 'DL301', name: 'Deep Learning', abbr: 'DL', teacher: 'VW', credits: 4, type: 'Theory + Lab', desc: 'Deep Learning architectures and Large Language Models' },
  { code: 'MDM301', name: 'MDM', abbr: 'MDM', teacher: 'SK', credits: 3, type: 'Theory', desc: 'Mobile Device Management and enterprise mobility solutions' },
];
const courseIds = {};
courses.forEach(c => {
  const result = courseStmt.run(c.code, c.name, c.abbr, teacherIds[c.teacher], c.credits, c.type, c.desc);
  courseIds[c.abbr] = result.lastInsertRowid;
});
console.log('✅ Courses seeded');

// Seed student
const studentStmt = db.prepare(`INSERT INTO students (name, prn, roll_no, batch, branch, year, address, email, phone, linkedin_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const studentResult = studentStmt.run(
  'Sainath Ukirde',
  '202401120011',
  5,
  'A-1',
  'Data Science',
  '3rd Year',
  'Vasundhara Society, Flat No. A-502, Dudlgaon, Moshi',
  'sainath.ukirde@student.edu',
  '+91 9876543210',
  'https://www.linkedin.com/in/sainath-ukirde-07463a373/'
);
const studentId = studentResult.lastInsertRowid;
console.log('✅ Student seeded');

// Seed attendance (demo/sample values)
const attendanceStmt = db.prepare(`INSERT INTO attendance (student_id, course_id, total_classes, classes_attended) VALUES (?, ?, ?, ?)`);
const attendanceData = [
  { abbr: 'FS', total: 42, attended: 35 },    // ~83%
  { abbr: 'DAA', total: 44, attended: 34 },   // ~77%
  { abbr: 'AgAI', total: 38, attended: 35 },  // ~92%
  { abbr: 'DL', total: 40, attended: 30 },    // ~75%
  { abbr: 'MDM', total: 36, attended: 29 },   // ~80%
];
attendanceData.forEach(a => {
  attendanceStmt.run(studentId, courseIds[a.abbr], a.total, a.attended);
});
console.log('✅ Attendance seeded');

// Seed results (clearly marked as DEMO data)
const resultStmt = db.prepare(`INSERT INTO results (student_id, course_id, grade, grade_point, credits, result_status, semester, is_demo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
const resultsData = [
  { abbr: 'FS', grade: 'A', grade_point: 9.0, credits: 4, status: 'Pass' },
  { abbr: 'DAA', grade: 'A+', grade_point: 10.0, credits: 4, status: 'Pass' },
  { abbr: 'AgAI', grade: 'A', grade_point: 9.0, credits: 3, status: 'Pass' },
  { abbr: 'DL', grade: 'B+', grade_point: 8.0, credits: 4, status: 'Pass' },
  { abbr: 'MDM', grade: 'A', grade_point: 9.0, credits: 3, status: 'Pass' },
];
resultsData.forEach(r => {
  resultStmt.run(studentId, courseIds[r.abbr], r.grade, r.grade_point, r.credits, r.status, 5, 1);
});
console.log('✅ Results seeded (DEMO data)');

// Seed timetable (from uploaded document: TY B.Tech CSE Data Science Division A, AY 2026-2027, Sem 11)
// Periods: 1(8:00-9:00), 2(9:00-10:00), 3(10:00-11:00), Break, 4(11:15-12:15), 5(12:15-1:15), Lunch, 6(2:00-3:00), 7(3:00-4:00)
const timetableStmt = db.prepare(`
  INSERT INTO timetable (day, period_no, start_time, end_time, course_name, course_code, teacher, teacher_abbreviation, room, entry_type, batch, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const timetableData = [
  // MONDAY
  { day: 'Monday', period: 1, start: '08:00', end: '09:00', course: 'Design and Analysis of Algorithms', code: 'DAA', teacher: 'Ritu Dudhmal', abbr: 'RD', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Monday', period: 2, start: '09:00', end: '10:00', course: 'Agentic AI Foundation', code: 'AgAI', teacher: 'Pankaj Vishwakarma', abbr: 'PV', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Monday', period: 3, start: '10:00', end: '11:00', course: 'Full Stack', code: 'FS', teacher: 'Aparna Kulkarni', abbr: 'AK', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Monday', period: 4, start: '11:15', end: '12:15', course: 'Deep Learning & LLM Lab', code: 'DL', teacher: 'Vaishali Wangikar', abbr: 'VW', room: 'Lab-2', type: 'lab', batch: 'A1', notes: 'DL Lab' },
  { day: 'Monday', period: 5, start: '12:15', end: '13:15', course: 'Deep Learning & LLM Lab', code: 'DL', teacher: 'Vaishali Wangikar', abbr: 'VW', room: 'Lab-2', type: 'lab', batch: 'A1', notes: 'DL Lab' },
  { day: 'Monday', period: 6, start: '14:00', end: '15:00', course: 'MDM', code: 'MDM', teacher: 'Sayali Kalbhor', abbr: 'SK', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Monday', period: 7, start: '15:00', end: '16:00', course: 'Library / Self Study', code: '-', teacher: '-', abbr: '-', room: 'Library', type: 'activity', batch: 'A', notes: '' },

  // TUESDAY
  { day: 'Tuesday', period: 1, start: '08:00', end: '09:00', course: 'Full Stack Lab', code: 'FS', teacher: 'Aparna Kulkarni', abbr: 'AK', room: 'Lab-1', type: 'lab', batch: 'A1', notes: 'FS Lab' },
  { day: 'Tuesday', period: 2, start: '09:00', end: '10:00', course: 'Full Stack Lab', code: 'FS', teacher: 'Aparna Kulkarni', abbr: 'AK', room: 'Lab-1', type: 'lab', batch: 'A1', notes: 'FS Lab' },
  { day: 'Tuesday', period: 3, start: '10:00', end: '11:00', course: 'Design and Analysis of Algorithms', code: 'DAA', teacher: 'Ritu Dudhmal', abbr: 'RD', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Tuesday', period: 4, start: '11:15', end: '12:15', course: 'Agentic AI Foundation', code: 'AgAI', teacher: 'Pankaj Vishwakarma', abbr: 'PV', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Tuesday', period: 5, start: '12:15', end: '13:15', course: 'MDM', code: 'MDM', teacher: 'Sayali Kalbhor', abbr: 'SK', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Tuesday', period: 6, start: '14:00', end: '15:00', course: 'Deep Learning & LLM', code: 'DL', teacher: 'Vaishali Wangikar', abbr: 'VW', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Tuesday', period: 7, start: '15:00', end: '16:00', course: 'DAA Tutorial', code: 'DAA', teacher: 'Ritu Dudhmal', abbr: 'RD', room: '301', type: 'tutorial', batch: 'A1', notes: 'Tutorial' },

  // WEDNESDAY
  { day: 'Wednesday', period: 1, start: '08:00', end: '09:00', course: 'Deep Learning & LLM', code: 'DL', teacher: 'Vaishali Wangikar', abbr: 'VW', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Wednesday', period: 2, start: '09:00', end: '10:00', course: 'Full Stack', code: 'FS', teacher: 'Aparna Kulkarni', abbr: 'AK', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Wednesday', period: 3, start: '10:00', end: '11:00', course: 'Agentic AI Foundation', code: 'AgAI', teacher: 'Pankaj Vishwakarma', abbr: 'PV', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Wednesday', period: 4, start: '11:15', end: '12:15', course: 'Agentic AI Lab', code: 'AgAI', teacher: 'Pankaj Vishwakarma', abbr: 'PV', room: 'Lab-3', type: 'lab', batch: 'A1', notes: 'AgAI Lab' },
  { day: 'Wednesday', period: 5, start: '12:15', end: '13:15', course: 'Agentic AI Lab', code: 'AgAI', teacher: 'Pankaj Vishwakarma', abbr: 'PV', room: 'Lab-3', type: 'lab', batch: 'A1', notes: 'AgAI Lab' },
  { day: 'Wednesday', period: 6, start: '14:00', end: '15:00', course: 'Design and Analysis of Algorithms', code: 'DAA', teacher: 'Ritu Dudhmal', abbr: 'RD', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Wednesday', period: 7, start: '15:00', end: '16:00', course: 'Sports / Activity', code: '-', teacher: '-', abbr: '-', room: 'Ground', type: 'activity', batch: 'A', notes: '' },

  // THURSDAY
  { day: 'Thursday', period: 1, start: '08:00', end: '09:00', course: 'MDM', code: 'MDM', teacher: 'Sayali Kalbhor', abbr: 'SK', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Thursday', period: 2, start: '09:00', end: '10:00', course: 'Design and Analysis of Algorithms', code: 'DAA', teacher: 'Ritu Dudhmal', abbr: 'RD', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Thursday', period: 3, start: '10:00', end: '11:00', course: 'Full Stack', code: 'FS', teacher: 'Aparna Kulkarni', abbr: 'AK', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Thursday', period: 4, start: '11:15', end: '12:15', course: 'Deep Learning & LLM', code: 'DL', teacher: 'Vaishali Wangikar', abbr: 'VW', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Thursday', period: 5, start: '12:15', end: '13:15', course: 'Agentic AI Foundation', code: 'AgAI', teacher: 'Pankaj Vishwakarma', abbr: 'PV', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Thursday', period: 6, start: '14:00', end: '15:00', course: 'Full Stack Lab', code: 'FS', teacher: 'Aparna Kulkarni', abbr: 'AK', room: 'Lab-1', type: 'lab', batch: 'A2', notes: 'FS Lab Batch A2' },
  { day: 'Thursday', period: 7, start: '15:00', end: '16:00', course: 'Full Stack Lab', code: 'FS', teacher: 'Aparna Kulkarni', abbr: 'AK', room: 'Lab-1', type: 'lab', batch: 'A2', notes: 'FS Lab Batch A2' },

  // FRIDAY
  { day: 'Friday', period: 1, start: '08:00', end: '09:00', course: 'Full Stack', code: 'FS', teacher: 'Aparna Kulkarni', abbr: 'AK', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Friday', period: 2, start: '09:00', end: '10:00', course: 'MDM Lab', code: 'MDM', teacher: 'Sayali Kalbhor', abbr: 'SK', room: 'Lab-4', type: 'lab', batch: 'A1', notes: 'MDM Lab' },
  { day: 'Friday', period: 3, start: '10:00', end: '11:00', course: 'MDM Lab', code: 'MDM', teacher: 'Sayali Kalbhor', abbr: 'SK', room: 'Lab-4', type: 'lab', batch: 'A1', notes: 'MDM Lab' },
  { day: 'Friday', period: 4, start: '11:15', end: '12:15', course: 'Deep Learning & LLM', code: 'DL', teacher: 'Vaishali Wangikar', abbr: 'VW', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Friday', period: 5, start: '12:15', end: '13:15', course: 'Design and Analysis of Algorithms', code: 'DAA', teacher: 'Ritu Dudhmal', abbr: 'RD', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Friday', period: 6, start: '14:00', end: '15:00', course: 'FS Tutorial', code: 'FS', teacher: 'Aparna Kulkarni', abbr: 'AK', room: '301', type: 'tutorial', batch: 'A1', notes: 'Tutorial' },
  { day: 'Friday', period: 7, start: '15:00', end: '16:00', course: 'Project / Seminar', code: 'PRJ', teacher: 'Aparna Kulkarni', abbr: 'AK', room: '301', type: 'activity', batch: 'A', notes: 'Class Coordinator: Aparna Kulkarni' },

  // SATURDAY
  { day: 'Saturday', period: 1, start: '08:00', end: '09:00', course: 'Agentic AI Foundation', code: 'AgAI', teacher: 'Pankaj Vishwakarma', abbr: 'PV', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Saturday', period: 2, start: '09:00', end: '10:00', course: 'Deep Learning & LLM Lab', code: 'DL', teacher: 'Vaishali Wangikar', abbr: 'VW', room: 'Lab-2', type: 'lab', batch: 'A2', notes: 'DL Lab Batch A2' },
  { day: 'Saturday', period: 3, start: '10:00', end: '11:00', course: 'Deep Learning & LLM Lab', code: 'DL', teacher: 'Vaishali Wangikar', abbr: 'VW', room: 'Lab-2', type: 'lab', batch: 'A2', notes: 'DL Lab Batch A2' },
  { day: 'Saturday', period: 4, start: '11:15', end: '12:15', course: 'MDM', code: 'MDM', teacher: 'Sayali Kalbhor', abbr: 'SK', room: '301', type: 'lecture', batch: 'A1', notes: '' },
  { day: 'Saturday', period: 5, start: '12:15', end: '13:15', course: 'Agentic AI Lab', code: 'AgAI', teacher: 'Pankaj Vishwakarma', abbr: 'PV', room: 'Lab-3', type: 'lab', batch: 'A2', notes: 'AgAI Lab Batch A2' },
];

timetableData.forEach(t => {
  timetableStmt.run(t.day, t.period, t.start, t.end, t.course, t.code, t.teacher, t.abbr, t.room, t.type, t.batch, t.notes);
});
console.log('✅ Timetable seeded');

console.log('\n🎉 Database seeded successfully!');
console.log('ℹ️  Note: Attendance and Results contain DEMO/SAMPLE data for demonstration purposes.\n');
