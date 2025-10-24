# MERN Stack Application with MongoDB

A complete MERN (MongoDB, Express.js, React.js, Node.js) stack application featuring admin authentication, agent management, CSV upload with automatic task distribution, and agent task management system.

## Features

### Admin Features
- **JWT-based Authentication**: Secure admin login system
- **Agent Management**: Create, view, and manage agents with password-protected accounts
- **File Upload**: Support for CSV, XLSX, and XLS files
- **Automatic Distribution**: Tasks are distributed equally among active agents (up to 5)
- **Real-time Dashboard**: View all tasks with live status updates
- **Task Monitoring**: Monitor all agent activities and task progress

### Agent Features
- **Agent Authentication**: Secure login system for agents
- **Task Management**: View assigned tasks with detailed information
- **Status Updates**: Update task status (Pending → In Progress → Completed)
- **Personal Dashboard**: Overview of assigned tasks with statistics

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication (separate tokens for admin and agents)
- Multer for file uploads
- XLSX for Excel file parsing
- bcryptjs for password hashing

### Frontend
- React.js with TypeScript
- React Router for navigation
- TailwindCSS for styling
- Lucide React for icons
- Context API for state management (separate contexts for admin and agent auth)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation)
- npm or yarn

### Backend Setup

1. **Install dependencies:**
   ```bash
   npm install 
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/mern-app
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-complex
   PORT=5000
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running on your local machine:
   ```bash
   mongod
   ```

4. **Create Admin User:**
   ```bash
   node scripts/createAdmin.js
   ```
   This creates an admin user with:
   - Email: admin@example.com
   - Password: admin123

5. **Start Backend Server:**
   ```bash
   npm run server
   ```
   The backend server will run on http://localhost:5000

### Frontend Setup

1. **Navigate to the src directory and install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Start Frontend Development Server:**
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:5173

### Run Both Servers Simultaneously

```bash
npm run start:dev
```

This command runs both backend and frontend servers concurrently.

## Project Structure

```
├── backend/
│   ├── models/
│   │   ├── Admin.js          # Admin user model
│   │   ├── Agent.js          # Agent model with authentication
│   │   └── Task.js           # Task model
│   ├── routes/
│   │   ├── auth.js           # Admin authentication routes
│   │   ├── agentAuth.js      # Agent authentication routes
│   │   ├── agents.js         # Agent management routes
│   │   └── upload.js         # File upload routes
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication middleware
│   │   └── errorHandler.js   # Error handling middleware
│   ├── scripts/
│   │   └── createAdmin.js    # Admin creation script
│   └── server.js             # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.tsx    # Admin layout component
│   │   ├── context/
│   │   │   ├── AuthContext.tsx      # Admin authentication context
│   │   │   └── AgentAuthContext.tsx # Agent authentication context
│   │   ├── pages/
│   │   │   ├── Login.tsx           # Admin login page
│   │   │   ├── AgentLogin.tsx      # Agent login page
│   │   │   ├── Dashboard.tsx       # Admin dashboard
│   │   │   ├── AgentDashboard.tsx  # Agent dashboard
│   │   │   ├── Agents.tsx          # Agent management page
│   │   │   └── Upload.tsx          # File upload page
│   │   ├── services/
│   │   │   ├── authService.ts      # Admin API calls
│   │   │   ├── agentAuthService.ts # Agent API calls
│   │   │   ├── agentService.ts     # Agent management API calls
│   │   │   └── uploadService.ts    # Upload API calls
│   │   └── App.tsx           # Main app component with routing
├── .env                      # Environment variables
├── package.json              # Dependencies and scripts
├── README.md                 # This file
└── UNDERSTAND.md             # Application flow documentation
```

## API Endpoints

### Admin Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin info
- `POST /api/auth/register` - Register admin (for initial setup)

### Agent Authentication
- `POST /api/agent/login` - Agent login
- `GET /api/agent/me` - Get current agent info
- `GET /api/agent/tasks` - Get agent's assigned tasks
- `PUT /api/agent/tasks/:id` - Update task status

### Agent Management (Admin Only)
- `POST /api/agents` - Create new agent
- `GET /api/agents` - Get all agents
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent (soft delete)

### Upload & Tasks (Admin Only)
- `POST /api/upload` - Upload CSV/Excel file and distribute tasks
- `GET /api/upload/tasks` - Get all tasks with agent details

## Application Access

### Admin Portal
- **URL**: http://localhost:5173/login
- **Default Credentials**:
  - Email: admin@example.com
  - Password: admin123

### Agent Portal
- **URL**: http://localhost:5173/agent/login
- **Credentials**: Created by admin through the agent management system

## CSV File Format

Your CSV/Excel file should contain these columns:
- **FirstName** (required): Contact's first name
- **Phone** (required): Phone number
- **Notes** (optional): Additional notes

Example CSV:
```csv
FirstName,Phone,Notes
John,123-456-7890,Follow up next week
Jane,098-765-4321,Interested in product demo
Mike,555-123-4567,
```

## Features Explained

### Task Distribution Algorithm
- Tasks are distributed equally among active agents (up to 5 agents)
- If tasks don't divide evenly, remaining tasks are distributed sequentially
- Example: 23 tasks among 5 agents = 4 tasks each + 3 agents get 1 extra task

### Agent Task Management
- Agents can view only their assigned tasks
- Task status workflow: Pending → In Progress → Completed
- Agents can update task status and reset if needed
- Real-time status updates visible to admin

### Security Features
- Separate JWT tokens for admin and agent authentication
- Password hashing with bcrypt for both admin and agents
- Protected routes with middleware
- Input validation and error handling
- Agent access restricted to their own tasks only

### File Upload
- Supports CSV, XLSX, and XLS formats
- File size limit: 5MB
- Validates required columns
- Automatic cleanup of uploaded files

## Environment Variables

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/mern-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-complex

# Server Configuration
PORT=5000
```

## Development Notes

- MongoDB must be running locally
- Make sure to create the admin user before first login
- File uploads are stored temporarily and cleaned up after processing
- All passwords are hashed before storage
- Agents can be soft-deleted (marked as inactive)
- Task status updates are immediately reflected in admin dashboard

## Troubleshooting

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running locally
   - Check the MONGO_URI in .env file

2. **Admin Login Failed:**
   - Run the createAdmin.js script to create the initial admin user
   - Use the default credentials provided

3. **Agent Login Failed:**
   - Ensure the agent was created by admin
   - Check that the agent is marked as active

4. **File Upload Issues:**
   - Check file format (CSV, XLSX, XLS only)
   - Ensure file has required columns
   - File size should be under 5MB

5. **No Agents for Distribution:**
   - Create at least one agent before uploading files
   - Ensure agents are marked as active

## License

This project is licensed under the MIT License.