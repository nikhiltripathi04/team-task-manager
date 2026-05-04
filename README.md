# ⚡ FlowState | Team Task Manager

A production-grade, collaborative task management platform built for speed and visual excellence. Organize work, assign tasks, and track progress with a premium, high-performance interface.

🚀 **Live App:** [https://team-task-manager-amber-seven.vercel.app/](https://team-task-manager-amber-seven.vercel.app/)
⚙️ **Backend API:** [https://team-task-manager-5q5g.onrender.com/api](https://team-task-manager-5q5g.onrender.com/api)

---

## ✨ Features

### 🔐 Advanced Authentication
- Secure Register/Login with JWT.
- Automatic login post-registration for a seamless onboarding experience.

### 📁 Workspace Management
- Create and manage multiple projects.
- **Admin Role**: Full control over project settings and member management.
- **Member Role**: Collaborative access to assigned projects.

### ✅ Task Engine
- **Kanban-style tracking**: To Do, In Progress, Done.
- **Strict RBAC**:
    - Admins can assign tasks to anyone.
    - Members are restricted to self-assignment.
    - Deletion is restricted to task creators or admins.
- **Dynamic Filtering**: Filter tasks by assignee or status.

### 🛡️ Engineering Excellence
- **Backend Isolation**: Automated test suite using `In-Memory Mongo Server`.
- **RBAC Validation**: Tests covering unauthorized access and role-based restrictions.
- **Frontend Mocking**: High-fidelity React tests with API mocking and behavioral validation.

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS v4 (Premium Design System)
- Framer Motion (Animations)
- React Router v7
- Jest + React Testing Library

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT (Authentication)
- Jest + Supertest

---

## 🚦 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/nikhiltripathi04/team-task-manager.git
cd team-task-manager
```

### 2. Setup Backend
```bash
cd backend
npm install
# Create .env with MONGO_URI and JWT_SECRET
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
# Create .env with VITE_API_URL=http://localhost:5050/api
npm run dev
```

### 4. Run Tests
```bash
# In backend/
npm test

# In frontend/
npm test
```

---

## 📈 Deployment Details

- **Backend**: Deployed on **Render** (Auto-compilation via `tsc`).
- **Frontend**: Deployed on **Vercel** (Environment variables mapped to API URL).
- **Database**: Managed **MongoDB Atlas** cluster.

---

## 👥 Demo Credentials

- **Admin**: `admin@test.com` | `123456`
- **Member**: `nikhil@test.com` | `123456`

---


