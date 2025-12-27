# GearGuard - Maintenance Management System

A production-ready, modular, and scalable Maintenance Management System built with FastAPI, React, and PostgreSQL. GearGuard provides comprehensive equipment maintenance tracking with Kanban boards, calendar views, and role-based access control.

## 🚀 Features

### Core Modules

- **Equipment Module**: Complete CRUD operations with search, filtering, and smart buttons
- **Maintenance Team Module**: Team management with technician assignment
- **Maintenance Request Module**: Full workflow management with auto-fill logic
- **Reporting**: Analytics and insights for maintenance operations

### Key Features

- ✅ JWT Authentication with role-based access control
- ✅ Kanban board with drag-and-drop for request management
- ✅ Calendar view for preventive maintenance scheduling
- ✅ Auto-fill logic for equipment maintenance teams
- ✅ Overdue request tracking and indicators
- ✅ Equipment status management (Active/Scrapped)
- ✅ Workflow states: NEW → IN_PROGRESS → REPAIRED/SCRAP
- ✅ Search and filter capabilities
- ✅ Responsive UI with Tailwind CSS

## 📋 Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Production database
- **JWT** - Authentication tokens
- **Pydantic** - Data validation

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Data fetching and caching
- **@dnd-kit** - Drag-and-drop functionality
- **FullCalendar.js** - Calendar component

### Database
- **SQLite** - Local development database (file-based, no setup required)
- **PostgreSQL** - Optional for production use

### Deployment

## 🏗️ Project Structure

```
gear Gaurd/
├── backend/
│   ├── routers/          # API route handlers
│   │   ├── auth.py
│   │   ├── equipment.py
│   │   ├── maintenance_team.py
│   │   ├── maintenance_request.py
│   │   └── reports.py
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── database.py       # Database configuration
│   ├── auth.py           # JWT authentication
│   ├── main.py           # FastAPI application
│   ├── init_db.py        # Database initialization
│   ├── seed_data.py      # Database seeding script
│   ├── requirements.txt  # Python dependencies
│   ├── start.sh          # Setup and start script
│   ├── env.example       # Environment template
│   └── gearguard.db      # SQLite database (created on first run)
├── frontend/
│   ├── src/
│   │   ├── api/          # API client functions
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── start.sh          # Setup and start script
│   └── env.example       # Environment template
├── QUICKSTART.md         # Quick start guide
└── README.md             # This file
```


## 🚀 Quick Start

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm (comes with Node.js)

### Installation

**Super Quick Start:**

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   ./start.sh
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   ./start.sh
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

📖 **For quick setup instructions, see [QUICKSTART.md](QUICKSTART.md)**

### Default Login Credentials

After seeding, you can login with:

- **Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`
- **Technician 1**: `technician1` / `tech123`
- **Technician 2**: `technician2` / `tech123`
- **User**: `user` / `user123`

## 📖 Usage Guide

### Roles and Permissions

- **ADMIN**: Full system access
- **MANAGER**: Can create equipment, assign technicians, schedule maintenance
- **TECHNICIAN**: Can view and work on assigned team requests
- **USER**: Can create maintenance requests only

### Equipment Management

1. Navigate to **Equipment** from the main menu
2. Use search and filters to find equipment
3. Click **View** to see equipment details
4. The **Maintenance** smart button shows open requests count
5. Click the badge to view all related maintenance requests

### Maintenance Requests

#### Kanban Board View
1. Go to **Maintenance Requests** → **Kanban Board**
2. Drag and drop requests between columns (NEW, IN_PROGRESS, REPAIRED, SCRAP)
3. Red indicators show overdue requests
4. Cards display technician avatars and request details

#### Calendar View
1. Switch to **Calendar View** tab
2. View all preventive maintenance requests
3. Click on a date to create a new request
4. Overdue requests appear in red

### Workflows

#### Corrective Maintenance
1. Any user creates a request
2. Status = NEW
3. Manager/Technician assigns request
4. Status → IN_PROGRESS
5. Technician logs duration
6. Status → REPAIRED

#### Preventive Maintenance
1. Manager creates PREVENTIVE request
2. Scheduled date is required
3. Request appears on calendar view
4. Follows same workflow as corrective

#### Scrap Logic
- If request status = SCRAP:
  - Equipment status automatically changes to SCRAPPED
  - Scrap reason is logged

## 🔧 Development

### Running Locally (Without Docker)

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://gearguard:gearguard123@localhost:5432/gearguard_db"
export SECRET_KEY="your-secret-key-change-in-production"
export ALGORITHM="HS256"
export ACCESS_TOKEN_EXPIRE_MINUTES="30"

# Run migrations (tables are auto-created)
uvicorn main:app --reload
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Database Migrations

The application uses SQLAlchemy's `create_all()` for simplicity. For production, consider using Alembic for migrations:

```bash
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user

### Equipment
- `GET /api/equipment` - List equipment (with search/filter)
- `GET /api/equipment/{id}` - Get equipment details
- `POST /api/equipment` - Create equipment (ADMIN/MANAGER)
- `PUT /api/equipment/{id}` - Update equipment (ADMIN/MANAGER)
- `DELETE /api/equipment/{id}` - Delete equipment (ADMIN)
- `GET /api/equipment/{id}/maintenance-requests` - Smart button: Get related requests

### Maintenance Teams
- `GET /api/maintenance-teams` - List teams
- `GET /api/maintenance-teams/{id}` - Get team details
- `POST /api/maintenance-teams` - Create team (ADMIN/MANAGER)
- `PUT /api/maintenance-teams/{id}` - Update team (ADMIN/MANAGER)
- `DELETE /api/maintenance-teams/{id}` - Delete team (ADMIN)
- `POST /api/maintenance-teams/{id}/members` - Add technician
- `DELETE /api/maintenance-teams/{id}/members/{user_id}` - Remove technician

### Maintenance Requests
- `GET /api/maintenance-requests` - List requests (with filters)
- `GET /api/maintenance-requests/{id}` - Get request details
- `POST /api/maintenance-requests` - Create request
- `PUT /api/maintenance-requests/{id}` - Update request
- `DELETE /api/maintenance-requests/{id}` - Delete request (ADMIN/MANAGER)
- `GET /api/maintenance-requests/calendar/preventive` - Get calendar events

### Reports
- `GET /api/reports` - Get maintenance reports (ADMIN/MANAGER)

## 🧪 Testing

### Backend Testing

```bash
cd backend
pytest  # If tests are added
```

### Frontend Testing

```bash
cd frontend
npm test  # If tests are added
```

## 🔒 Security Considerations

1. **Change default passwords** in production
2. **Update SECRET_KEY** in environment variables
3. **Use HTTPS** in production
4. **Implement rate limiting** for API endpoints
5. **Add input validation** and sanitization
6. **Regular security updates** for dependencies

## 📝 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://gearguard:gearguard123@db:5432/gearguard_db
SECRET_KEY=your-secret-key-change-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Database Connection Issues
- Check if database file exists: `ls backend/gearguard.db`
- Try resetting the database: Delete `gearguard.db` and run `python init_db.py`
- Verify DATABASE_URL in environment

### Frontend Not Loading
- Check if backend is running: `curl http://localhost:8000/api/health`
- Verify CORS settings in `backend/main.py`
- Check browser console for errors

### Authentication Issues
- Clear browser localStorage
- Verify JWT token expiration settings
- Check backend logs for authentication errors

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is provided as-is for demonstration purposes.

## 🎯 Future Enhancements

- [ ] Email notifications for overdue requests
- [ ] Mobile app support
- [ ] Advanced reporting with charts
- [ ] Equipment QR code scanning
- [ ] Maintenance history timeline
- [ ] Multi-language support
- [ ] Export to PDF/Excel
- [ ] Real-time notifications
- [ ] Equipment maintenance schedules
- [ ] Inventory management integration

---

**Built with ❤️ for efficient maintenance management**

