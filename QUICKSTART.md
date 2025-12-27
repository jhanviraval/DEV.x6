# 🚀 GearGuard - Quick Start Guide

## Prerequisites

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)

## Quick Start (2 Commands)

**Terminal 1 - Start Backend:**
```bash
cd backend
./start.sh
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
./start.sh
```

**Access:** http://localhost:3000

## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Manager | `manager` | `manager123` |
| Technician | `technician1` | `tech123` |
| User | `user` | `user123` |

## Manual Setup (If Scripts Don't Work)

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
python init_db.py
python seed_data.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
cp env.example .env
npm run dev
```

## Troubleshooting

### "Incorrect username or password"
Run the seed script:
```bash
cd backend
source venv/bin/activate
python seed_data.py
```

### Backend won't start
- Check Python version: `python3 --version` (need 3.11+)
- Kill port 8000: `lsof -ti:8000 | xargs kill -9`

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Delete and reinstall: `rm -rf node_modules && npm install`

### Database issues
Reset the database:
```bash
cd backend
rm gearguard.db
python init_db.py
python seed_data.py
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Features

- ✅ Equipment Management
- ✅ Maintenance Requests (Kanban & Calendar views)
- ✅ Team Management
- ✅ Role-based Access Control
- ✅ Reports & Analytics

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, SQLite
- **Frontend**: React, TypeScript, Vite, Tailwind CSS

---

For detailed documentation, see [README.md](README.md)
