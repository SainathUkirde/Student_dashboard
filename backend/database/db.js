const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'student_dashboard.db');

// Ensure the database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      prn TEXT UNIQUE NOT NULL,
      roll_no INTEGER NOT NULL,
      batch TEXT NOT NULL,
      branch TEXT NOT NULL,
      year TEXT NOT NULL,
      address TEXT,
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_code TEXT UNIQUE NOT NULL,
      course_name TEXT NOT NULL,
      abbreviation TEXT,
      teacher_id INTEGER,
      credits INTEGER NOT NULL DEFAULT 3,
      course_type TEXT DEFAULT 'Theory',
      description TEXT,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      abbreviation TEXT,
      designation TEXT DEFAULT 'Faculty',
      department TEXT DEFAULT 'Computer Science'
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      total_classes INTEGER NOT NULL DEFAULT 0,
      classes_attended INTEGER NOT NULL DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (course_id) REFERENCES courses(id),
      UNIQUE(student_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      grade TEXT,
      grade_point REAL,
      credits INTEGER,
      result_status TEXT DEFAULT 'Pass',
      semester INTEGER DEFAULT 5,
      is_demo INTEGER DEFAULT 1,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (course_id) REFERENCES courses(id),
      UNIQUE(student_id, course_id, semester)
    );

    CREATE TABLE IF NOT EXISTS timetable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL,
      period_no INTEGER,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      course_name TEXT,
      course_code TEXT,
      teacher TEXT,
      teacher_abbreviation TEXT,
      room TEXT,
      entry_type TEXT DEFAULT 'lecture',
      batch TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      description TEXT
    );
  `);

  // ── Optional migrations (idempotent) ─────────────────────────
  try { db.exec(`ALTER TABLE teachers ADD COLUMN photo_url TEXT`); } catch (_) { /* already exists */ }
  try { db.exec(`ALTER TABLE teachers ADD COLUMN linkedin_url TEXT`); } catch (_) { /* already exists */ }
  try { db.exec(`ALTER TABLE students ADD COLUMN linkedin_url TEXT`); } catch (_) { /* already exists */ }

  // Backfill student LinkedIn URL for existing rows that have no value yet
  db.prepare(`UPDATE students SET linkedin_url = ? WHERE name = ? AND (linkedin_url IS NULL OR linkedin_url = '')`)
    .run('https://www.linkedin.com/in/sainath-ukirde-07463a373/', 'Sainath Ukirde');

  // Backfill LinkedIn URLs for existing rows that have no value yet
  const linkedinData = [
    { name: 'Aparna Kulkarni',    url: 'https://www.linkedin.com/in/aparna-kulkarni-73a50521/' },
    { name: 'Ritu Dudhmal',       url: 'https://www.linkedin.com/in/ritu-dudhmal-6733ab32a/' },
    { name: 'Pankaj Vishwakarma', url: 'https://www.linkedin.com/in/pankaj-kumar-vishwakarma-991541207/' },
    { name: 'Vaishali Wangikar',  url: 'https://www.linkedin.com/in/dr-vaishali-wangikar-8a31a219/' },
    { name: 'Sayali Kalbhor',     url: 'https://www.linkedin.com/in/sayali-kalbhor-92196b109/' },
  ];
  const backfillStmt = db.prepare(`UPDATE teachers SET linkedin_url = ? WHERE name = ? AND (linkedin_url IS NULL OR linkedin_url = '')`);
  linkedinData.forEach(({ name, url }) => backfillStmt.run(url, name));

  // ── Quiz & Practice Zone ─────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id      INTEGER NOT NULL,
      topic           TEXT NOT NULL,
      difficulty      TEXT NOT NULL CHECK(difficulty IN ('easy','medium','hard')),
      question        TEXT NOT NULL,
      option_a        TEXT NOT NULL,
      option_b        TEXT NOT NULL,
      option_c        TEXT NOT NULL,
      option_d        TEXT NOT NULL,
      correct_answer  TEXT NOT NULL CHECK(correct_answer IN ('A','B','C','D')),
      explanation     TEXT,
      FOREIGN KEY (subject_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id       INTEGER NOT NULL,
      subject_id       INTEGER,
      difficulty       TEXT DEFAULT 'mixed',
      quiz_mode        TEXT NOT NULL,
      total_questions  INTEGER NOT NULL DEFAULT 0,
      correct_answers  INTEGER NOT NULL DEFAULT 0,
      incorrect_answers INTEGER NOT NULL DEFAULT 0,
      unanswered       INTEGER NOT NULL DEFAULT 0,
      score            INTEGER NOT NULL DEFAULT 0,
      percentage       REAL NOT NULL DEFAULT 0,
      accuracy         REAL NOT NULL DEFAULT 0,
      time_taken       INTEGER NOT NULL DEFAULT 0,
      started_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at     DATETIME,
      status           TEXT DEFAULT 'in_progress',
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (subject_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS quiz_answers (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id       INTEGER NOT NULL,
      question_id      INTEGER NOT NULL,
      selected_answer  TEXT,
      is_correct       INTEGER NOT NULL DEFAULT 0,
      time_spent       INTEGER NOT NULL DEFAULT 0,
      marked_for_review INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id),
      FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
    );
  `);
}

module.exports = { getDb };
