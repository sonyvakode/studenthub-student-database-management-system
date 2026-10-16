# StudentHub FastAPI Backend

FastAPI + SQLAlchemy + SQLite backend for the **EWB Edu Tech Pvt. Ltd.** internship project: **Students Database CRUD Application**.

---

## 🛠️ Windows Terminal Setup & Run Commands

Open **Windows Command Prompt (cmd.exe)** or **PowerShell** in the project root:

### 1. Create and Activate Python Virtual Environment
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
```

*(If on PowerShell, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first if scripts are restricted)*

### 2. Install Required Dependencies
```cmd
pip install -r requirements.txt
```

### 3. (Optional) Seed Sample Student Records
```cmd
python -m backend.seed
```

### 4. Run Automated CRUD Tests
Run the comprehensive test suite to verify all endpoints against SQLite:
```cmd
python -m backend.test_api
```

### 5. Start the FastAPI Server on Port 8000
```cmd
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend server is now running at:
- **API Base URL**: `http://127.0.0.1:8000`
- **Swagger Interactive API Documentation**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

## 🌐 Connecting with Google AI Studio Cloud Preview (Tunnel)

Because Google AI Studio web preview executes inside a remote cloud sandbox, direct requests to `127.0.0.1` from the cloud preview do not reach your computer.

To connect the cloud preview to your running FastAPI backend:
1. In a new terminal, run:
   ```cmd
   ngrok http 8000
   ```
   *(or with Cloudflare tunnel: `cloudflared tunnel --url http://localhost:8000`)*
2. Copy the resulting HTTPS forwarding URL (e.g., `https://your-subdomain.ngrok-free.app`).
3. In the StudentHub web app, go to **Settings** -> **Backend Endpoint Configuration**, paste your HTTPS URL, and click **Save & Connect**.

---

## 🦙 (Optional) Enable Ollama AI Assistant
To enable natural language database queries via Ollama:
1. Download Ollama from [ollama.ai](https://ollama.ai)
2. Run a model in terminal:
   ```cmd
   ollama run llama3
   ```
3. The backend `/ai/ask` endpoint will automatically connect to `http://127.0.0.1:11434` and answer questions using your SQLite records.

---

## 🗄️ Inspecting SQLite Directly
```cmd
cd backend
sqlite3 students.db
```
```sql
.headers on
.mode column
SELECT id, student_id, name, course, email FROM students;
.quit
```
