# StudentHub — Students Database CRUD Application

**Internship Project for EWB Edu Tech Pvt. Ltd.**

A modern, professional, responsive SaaS dashboard web application for managing student database records, academic enrollments, course distributions, and database queries.

Built with **React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, and Axios** on the frontend, powered by a **Python FastAPI, SQLite, and SQLAlchemy** backend.

---

## 🚀 Quick Start Guide (Windows Terminal Commands)

To run the application locally on Windows, open **two separate terminal windows** (Command Prompt or PowerShell).

### Terminal 1: Start the Python FastAPI Backend

```cmd
# 1. Navigate to the backend directory
cd backend

# 2. Create Python virtual environment
python -m venv venv

# 3. Activate the virtual environment
# In Command Prompt (cmd.exe):
venv\Scripts\activate.bat
# OR in PowerShell:
# venv\Scripts\Activate.ps1

# 4. Install backend dependencies
pip install -r requirements.txt

# 5. (Optional) Populate sample student records
python -m backend.seed

# 6. Run automated CRUD test suite
python -m backend.test_api

# 7. Launch the FastAPI server on port 8000
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be running at:
- **API URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`

---

### 🌐 Optional: Connecting with Cloud Preview (Development Tunnel)
If viewing the frontend from Google AI Studio cloud preview, expose port 8000 via a secure tunnel:
```cmd
ngrok http 8000
```
Then paste the HTTPS forwarding URL (e.g. `https://your-tunnel.ngrok-free.app`) in the StudentHub **Settings** page and click **Save & Connect**.

---

### Terminal 2: Start the React Frontend

In the project root directory:

```cmd
# 1. Install frontend npm dependencies
npm install

# 2. Start the Vite development server
npm run dev
```

Frontend will be running at:
- **Local URL**: `http://localhost:3000`

Open your web browser and navigate to `http://localhost:3000`.

---

## Deploying to Vercel

The root [`vercel.json`](./vercel.json) configures two Vercel services:

- `app` builds the Vite frontend and serves public page routes.
- `backend` runs the FastAPI application. Requests under `/api/` are routed to it.

The browser calls the API through same-origin `/api` URLs. No service binding is
needed: bindings are for server-side calls between services, while the frontend
makes public HTTP requests through the `/api` rewrite.

For a Vercel deployment, configure `DATABASE_URL` in the backend service's
environment variables to point to a persistent PostgreSQL database. SQLite is
the local-development default and is not durable across Vercel function
instances. The backend accepts PostgreSQL URLs using the `psycopg` driver.

The API is publicly reachable under `/api` (for example, `/api/health`). Configure
database credentials in Vercel's environment settings; do not commit them to the
repository.

---

## 🧪 Testing the Complete CRUD Workflow

Follow this step-by-step checklist to test and demonstrate every feature during your internship project review:

### 1. Creating a Student Record (Create)
1. Click **"Add Student"** in the top header or sidebar.
2. Fill in:
   - **Full Name**: `Aarav Sharma`
   - **Date of Birth**: Select a past date (e.g., `2004-05-14`).
   - **Course**: Select `Computer Science & Engineering`.
   - **Email**: `aarav.sharma@ewbedutech.edu`
   - **Phone**: `+91 98765 43210`
   - **Enrollment Date**: `2024-08-01`
   - **Address**: `42 Tech Park Road, Whitefield, Bengaluru`
3. Click **"Create Student"**.
4. Observe the toast notification: *"Student Created Successfully with generated ID STU-1001"*.
5. The application navigates automatically to the **Student Details Page**.

### 2. Viewing Student Details (Read)
1. On the **Student Details Page**, verify all fields:
   - Full name, generated Student ID badge (`STU-1001`), course name, computed age.
   - Contact details (with one-click clipboard copy buttons for email and phone).
   - Residential address.
2. Go to **"All Students"** in the sidebar:
   - Verify the student appears in the main table with tabular figures.
   - Check the pagination footer displaying total student count.

### 3. Searching and Filtering Records
1. In the search box, type `Aarav` or `STU-1001`.
2. Notice the live debounced filtering instantly matching the student.
3. Test the **Course dropdown filter** to filter by specific program.
4. Test the **Born From / Born To** date pickers.
5. Click **"Reset All Filters"** to restore full database view.

### 4. Editing a Student Record (Update)
1. On the student table row, click the three-dots action menu (`...`) and select **"Edit Student"** (or click **"Edit Record"** on the details page).
2. Modify the course to `Data Science & AI` or update the phone number.
3. Click **"Save Changes"**.
4. Notice the success toast and see the updated fields immediately reflected on the page and in the database.

### 5. Deleting a Student Record (Delete)
1. On any student row or details page, click **"Delete"**.
2. Notice the accessible **Confirmation Dialog** appearing with the student's name and ID.
3. Click **"Delete Student"**.
4. Confirm the record is deleted from the table and the total student counter decrements.

### 6. Verifying Persistence in SQLite
Verify that your changes are written permanently to SQLite and persist after refreshing the browser:

```cmd
cd backend
sqlite3 students.db
```
Inside SQLite prompt:
```sql
.headers on
.mode column
SELECT id, student_id, name, course, email FROM students;
.quit
```
Refresh the browser window (`F5` or `Ctrl+R`) — all records remain intact in the UI directly from SQLite.

### 7. AI Assistant Queries
1. Navigate to **"AI Assistant"** in the sidebar.
2. Try the preset query buttons:
   - *"How many students are registered?"*
   - *"How many students are enrolled in each course?"*
   - *"List students born after 2004."*
3. The backend executes real-time queries against SQLite records and formats intelligent answers.

---

## 🏛️ Project Architecture

```
├── backend/
│   ├── database.py       # SQLAlchemy SQLite engine & session management
│   ├── models.py         # Student SQLAlchemy ORM model
│   ├── schemas.py        # Pydantic schemas with validation & contact rule
│   ├── crud.py           # DB operations, filters, pagination, metrics & AI query engine
│   ├── main.py           # FastAPI application with CORS and REST endpoints
│   ├── seed.py           # Database seeder with sample student records
│   ├── requirements.txt  # Python package dependencies
│   └── README.md         # Dedicated backend setup & SQLite guide
├── src/
│   ├── assets/images/    # Generated administrator avatar
│   ├── components/
│   │   ├── ai/           # AIChatInterface
│   │   ├── common/       # PageHeader, SummaryCard, Pagination, Skeletons, Error/Empty states, ConfirmDeleteDialog
│   │   ├── layout/       # AppSidebar, AppHeader, AppLayout
│   │   └── students/     # StudentTable, StudentFilters, StudentForm, StudentDetailCard
│   ├── context/          # ToastContext, BackendStatusContext
│   ├── pages/            # DashboardPage, StudentsListPage, AddStudentPage, EditStudentPage, StudentDetailsPage, AIAssistantPage, SettingsPage
│   ├── services/         # Centralized Axios API service with standardized error handling
│   ├── types/            # TypeScript interfaces
│   ├── App.tsx           # Router and top-level providers
│   ├── index.css         # Tailwind CSS styling and custom scrollbars
│   └── main.tsx          # React application entrypoint
├── .env.example          # Environment variable template
├── package.json          # Node dependencies and scripts
└── vite.config.ts        # Vite configuration with API proxy
```

---

## 📋 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Check backend connectivity and total student count |
| `GET` | `/students` | List students with search, course filter, DOB filter, pagination |
| `POST` | `/students` | Create new student with auto-generated ID |
| `GET` | `/students/{id}` | Retrieve single student by ID or `student_id` |
| `PUT` | `/students/{id}` | Replace existing student record |
| `PATCH` | `/students/{id}` | Partially update student fields |
| `DELETE` | `/students/{id}` | Permanently delete student record |
| `GET` | `/dashboard-metrics` | Retrieve live metric counts and course distribution |
| `POST` | `/ai/ask` | Natural language database query assistant |

---

## 💼 Evaluation & Review Highlights
- **No Mock Fallbacks**: Connected to real REST endpoints with persistent SQLite storage.
- **Accessible & Responsive**: Tested across desktop (1440px), tablet (768px), and mobile (375px).
- **Anti-AI Slop**: Clean editorial typography (Plus Jakarta Sans), tabular figures (`tabular-nums`), restrained shadows, zero pill-badge clutter, and intentional whitespace.
- **Enterprise Error Handling**: Clear human-readable error banners with retry and troubleshooting hints.
