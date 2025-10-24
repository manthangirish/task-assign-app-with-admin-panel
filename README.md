# MERN Stack Application with MongoDB

A simple MERN (MongoDB, Express.js, React.js, Node.js) application where an admin can manage agents, upload CSV/XLS/XLSX files, automatically distribute tasks, and agents can view/update their assigned tasks.

## What It Does

* **Admin Features:**

  * Login with email and password
  * Create, view, update, and delete agents
  * Upload CSV/Excel files and automatically distribute tasks to active agents
  * View tasks and monitor their status (Pending, In Progress, Completed)

* **Agent Features:**

  * Login with credentials created by admin
  * View assigned tasks
  * Update task status

## Setup & Run Instructions

### Prerequisites

* Node.js installed
* MongoDB installed and running locally
* Terminal/Command Prompt

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Install Required Packages (Backend & Frontend in One Step)

```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer xlsx
npm install react react-dom react-router-dom tailwindcss lucide-react
```

### 3. Configure Environment Variables

Create a `.env` file in the root:

```env
MONGO_URI=mongodb://localhost:27017/mern-app
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
```

### 4. Start MongoDB

```bash
mongod
```

### 5. Create Admin User (One-Time Setup)

```bash
node scripts/createAdmin.js
```

### 6. Run the Application (Frontend & Backend Together)

```bash
npm run dev    # This runs both backend (server) and frontend (React)
```

* Backend API will run on **[http://localhost:5000](http://localhost:5000)**
* Frontend React app will run on **[http://localhost:5173](http://localhost:5173)**

### 7. Default Admin Login

* Email: `admin@example.com`
* Password: `admin123`

### 8. CSV/Excel Upload Format

Required columns:

* FirstName (required)
* Phone (required)
* Notes (optional)

Example:

```csv
FirstName,Phone,Notes
John,1234567890,Follow up next week
Jane,0987654321,Interested in product
```
