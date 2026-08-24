# 🎓 Student Academic Dashboard

A **production-quality full-stack Student Academic Management Dashboard** for a TY B.Tech Data Science student.

> Built with React + Node.js + Express + SQLite

---

## ✨ Features

| Section | Description |
|---|---|
| **Dashboard** | Welcome card, stats (Attendance %, SGPA, CGPA, Courses), attendance chart, quick links |
| **Courses** | 5 course cards with attendance, teacher, type, credits — interactive modal view |
| **Attendance** | Course-wise breakdown with progress bars, charts, threshold indicator |
| **Results** | Grade sheet, SGPA/CGPA cards, performance radar chart (sample/demo data) |
| **Student Details** | Profile card with editable form — persisted to SQLite via REST API |
| **Course Teachers** | Faculty cards with course assignment, abbreviations, department |
| **Timetable** | Full weekly table + day-card view based on institutional schedule |

**Plus:**
- 🌙 Light / Dark mode (persisted to localStorage)
- 🔍 Global search (courses, teachers, student)
- 📱 Responsive — collapsible sidebar, mobile hamburger menu
- 💀 Skeleton loaders on all data sections
- ⚠️ Error states with retry button
- 🔔 Notifications dropdown
- 👤 User dropdown (Profile / Settings / Logout)
- 📊 Recharts bar chart, radar chart, reference line

---

## 🛠 Tech Stack

**Frontend**
- React 18 + Vite
- React Router v6
- Axios
- Recharts
- Lucide React icons

**Backend**
- Node.js + Express
- better-sqlite3 (SQLite)
- CORS, dotenv, express-validator

**Architecture**
```
Browser (React) → Vite Proxy → Express API → SQLite DB
```

---

## 📁 Folder Structure

```
student-dashboard/
├── backend/
│   ├── controllers/        # Business logic per resource
│   ├── database/
│   │   ├── db.js           # DB connection + schema init
│   │   └── seed.js         # Initial data seeder
│   ├── routes/             # Express routers
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # useFetch, useToast
│   │   ├── layouts/        # Layout wrapper
│   │   ├── pages/          # One file per page/section
│   │   ├── services/       # api.js (Axios wrappers)
│   │   ├── styles/         # globals.css (CSS variables)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── package.json            # Root convenience scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 1. Install Dependencies

```bash
# Install both backend and frontend dependencies
npm run install:all
```

Or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

The backend uses `.env.example` as its config (no secrets required for dev):

```bash
# backend/.env.example (already configured for local dev)
PORT=5000
NODE_ENV=development
DB_PATH=./database/student_dashboard.db
CORS_ORIGIN=http://localhost:5173
ATTENDANCE_THRESHOLD=75
```

Copy to `.env` if needed:
```bash
cp backend/.env.example backend/.env
```

### 3. Seed the Database

```bash
npm run seed
# or:
cd backend && node database/seed.js
```

This creates the SQLite database and populates it with:
- Student: Sainath Ukirde (PRN: 202401120011)
- 5 courses (Full Stack, DAA, Agentic AI, Deep Learning, MDM)
- Teachers mapped to courses
- Sample attendance data
- **Demo/Sample** results (clearly marked)
- Full semester timetable (TY B.Tech DS Div A, AY 2026-27)

### 4. Start the Backend

```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

### 5. Start the Frontend

In a new terminal:
```bash
cd frontend
npm run dev
# App opens at http://localhost:5173
```

The Vite dev server proxies `/api` requests to `localhost:5000`.

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/student` | Get student profile |
| PUT | `/api/student/:id` | Update student profile |
| GET | `/api/courses` | Get all courses with attendance |
| GET | `/api/courses/:id` | Get course by ID |
| GET | `/api/attendance` | Get course-wise attendance |
| GET | `/api/attendance/summary` | Get overall attendance summary |
| POST | `/api/attendance` | Update attendance |
| GET | `/api/results` | Get results |
| GET | `/api/results/summary` | Get SGPA/CGPA |
| POST | `/api/results` | Upsert a result |
| GET | `/api/teachers` | Get all teachers |
| GET | `/api/timetable` | Get full weekly timetable |
| GET | `/api/timetable/today` | Get today's schedule |
| GET | `/api/settings` | Get app settings |
| PUT | `/api/settings/:key` | Update a setting |
| GET | `/api/search?q=` | Global search |
| GET | `/api/health` | Health check |

All responses are JSON. Errors return `{ error: "message" }`.

---

## 🎨 Theme

The app supports **Light** and **Dark** modes. Toggle via the moon/sun icon in the header. Preference is saved to `localStorage`.

---

## ⚠️ Data Disclaimer

Attendance and results shown are **sample/demo values** for demonstration purposes.  
They do **not** represent actual university academic records.  
The demo banner is shown on the Results page.

---

## 🗺 Routes

| URL | Page |
|---|---|
| `/dashboard` | Dashboard Home |
| `/courses` | Courses |
| `/attendance` | Attendance |
| `/results` | Results |
| `/student-details` | Student Details |
| `/teachers` | Course Teachers |
| `/timetable` | Semester Timetable |

---

## 📦 Production Build

```bash
cd frontend
npm run build
# Outputs to frontend/dist/
```

Serve the built frontend statically from the Express backend (add `express.static` middleware), or deploy separately.

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| `Cannot find module 'better-sqlite3'` | Run `npm install` in `backend/` |
| Port 5000 in use | Change `PORT` in `backend/.env` |
| CORS error | Ensure `CORS_ORIGIN` matches frontend URL |
| Database empty | Run `node database/seed.js` from `backend/` |
| Frontend can't reach API | Ensure backend is running on port 5000 |
| `vite: command not found` | Run `npm install` in `frontend/` |

---

## 👤 Student Information

| Field | Value |
|---|---|
| Name | Sainath Ukirde |
| PRN | 202401120011 |
| Roll No. | 5 |
| Batch | A-1 |
| Branch | Data Science |
| Year | 3rd Year |
| Address | Vasundhara Society, Flat No. A-502, Dudlgaon, Moshi |

---

## 👩‍🏫 Faculty

| Teacher | Course |
|---|---|
| Aparna Kulkarni (AK) | Full Stack · Class Coordinator |
| Ritu Dudhmal (RD) | Design and Analysis of Algorithms |
| Pankaj Vishwakarma (PV) | Agentic AI Foundation |
| Vaishali Wangikar (VW) | Deep Learning & LLM |
| Sayali Kalbhor (SK) | MDM |

---

*Built as an academic dashboard project. TY B.Tech Data Science · AY 2026–2027*
