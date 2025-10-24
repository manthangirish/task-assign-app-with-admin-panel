# Application Flow Documentation

This document explains the complete flow of the MERN Stack Application, covering all user interactions, data flow, and system processes.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Admin Workflow](#admin-workflow)
3. [Agent Workflow](#agent-workflow)
4. [Data Flow](#data-flow)
5. [Authentication System](#authentication-system)
6. [Task Distribution Algorithm](#task-distribution-algorithm)
7. [Database Schema](#database-schema)
8. [API Flow](#api-flow)

## System Architecture

The application follows a traditional MERN stack architecture with clear separation between admin and agent functionalities:

```
Frontend (React + TypeScript)
├── Admin Portal (/login, /dashboard, /agents, /upload)
└── Agent Portal (/agent/login, /agent/dashboard)

Backend (Node.js + Express)
├── Admin Routes (/api/auth/*, /api/agents/*, /api/upload/*)
└── Agent Routes (/api/agent/*)

Database (MongoDB)
├── admins collection
├── agents collection
└── tasks collection
```

## Admin Workflow

### 1. Admin Login Process
```
1. Admin visits /login
2. Enters credentials (admin@example.com / admin123)
3. Frontend sends POST /api/auth/login
4. Backend validates credentials against Admin model
5. If valid, JWT token generated and returned
6. Token stored in localStorage as 'token'
7. Redirect to /dashboard
```

### 2. Agent Management
```
1. Admin navigates to /agents
2. Views list of existing agents
3. To create new agent:
   - Clicks "Add Agent" button
   - Fills form (name, email, mobile, password)
   - Frontend sends POST /api/agents
   - Backend creates new Agent with hashed password
   - Agent appears in list immediately
4. To delete agent:
   - Clicks delete button
   - Confirmation dialog appears
   - Frontend sends DELETE /api/agents/:id
   - Agent marked as inactive (soft delete)
```

### 3. CSV Upload and Distribution
```
1. Admin navigates to /upload
2. Selects CSV/Excel file (validates format client-side)
3. Clicks upload button
4. Frontend sends POST /api/upload with FormData
5. Backend processes file:
   - Validates file format and size
   - Parses CSV/Excel using XLSX library
   - Validates required columns (FirstName, Phone, Notes)
   - Fetches active agents (max 5)
   - Distributes tasks equally among agents
   - Creates Task documents in MongoDB
   - Returns distribution summary
6. Frontend displays success message with distribution details
7. Tasks appear in dashboard immediately
```

### 4. Dashboard Monitoring
```
1. Admin views /dashboard
2. Frontend fetches:
   - GET /api/agents (for agent statistics)
   - GET /api/upload/tasks (for task statistics)
3. Dashboard displays:
   - Total agents, tasks, pending, completed counts
   - Recent agents list
   - Recent tasks with live status updates
   - Complete task overview with real-time status
4. Status updates from agents reflect immediately
```

## Agent Workflow

### 1. Agent Login Process
```
1. Agent visits /agent/login
2. Enters credentials provided by admin
3. Frontend sends POST /api/agent/login
4. Backend validates credentials against Agent model
5. If valid, JWT token generated with type: 'agent'
6. Token stored in localStorage as 'agentToken'
7. Updates agent's lastLogin timestamp
8. Redirect to /agent/dashboard
```

### 2. Task Management
```
1. Agent views /agent/dashboard
2. Frontend sends GET /api/agent/tasks
3. Backend returns only tasks assigned to this agent
4. Dashboard displays:
   - Task statistics (total, pending, in-progress, completed)
   - List of assigned tasks with details
   - Status update buttons for each task

5. To update task status:
   - Agent clicks status button (Start/Complete/Reset)
   - Frontend sends PUT /api/agent/tasks/:id
   - Backend validates agent owns the task
   - Updates task status in database
   - Frontend updates UI immediately
   - Admin dashboard reflects change in real-time
```

### 3. Task Status Workflow
```
Pending → In Progress → Completed
   ↑           ↑           ↑
   └───────────┴───────────┘
        (Reset option)

- Pending: Initial state when task is created
- In Progress: Agent has started working on the task
- Completed: Task is finished
- Reset: Can return to Pending from any state
```

## Data Flow

### 1. File Upload to Task Creation
```
CSV File → Multer → XLSX Parser → Validation → Agent Fetching → Distribution Algorithm → Task Creation → Response
```

### 2. Task Status Update Flow
```
Agent Action → JWT Validation → Task Ownership Check → Status Update → Database Save → Response → UI Update
```

### 3. Real-time Dashboard Updates
```
Agent Status Change → Database Update → Admin Dashboard Refresh → Live Status Display
```

## Authentication System

### 1. Dual Authentication
The system uses separate authentication contexts for admins and agents:

```typescript
// Admin Context
AuthContext: {
  admin: Admin | null,
  token: string | null,
  login: (email, password) => Promise<void>,
  logout: () => void
}

// Agent Context
AgentAuthContext: {
  agent: Agent | null,
  token: string | null,
  login: (email, password) => Promise<void>,
  logout: () => void
}
```

### 2. JWT Token Structure
```javascript
// Admin Token
{
  id: adminId,
  type: 'admin', // Optional, defaults to admin
  exp: expirationTime
}

// Agent Token
{
  id: agentId,
  type: 'agent', // Required for agent tokens
  exp: expirationTime
}
```

### 3. Route Protection
```
Admin Routes: Require admin JWT token
Agent Routes: Require agent JWT token with type: 'agent'
Public Routes: No authentication required
```

## Task Distribution Algorithm

### 1. Equal Distribution Logic
```javascript
const tasksPerAgent = Math.floor(totalTasks / agentCount);
const remainder = totalTasks % agentCount;

// Each agent gets base amount
// First 'remainder' agents get one extra task
```

### 2. Example Distributions
```
25 tasks, 5 agents: 5 tasks each
23 tasks, 5 agents: 5,5,5,4,4 (first 3 get extra)
7 tasks, 3 agents: 3,2,2 (first 1 gets extra)
```

### 3. Agent Selection
- Only active agents are considered
- Maximum 5 agents for distribution
- Agents selected in creation order

## Database Schema

### 1. Admin Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Agent Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  mobile: String (required),
  password: String (required, hashed),
  isActive: Boolean (default: true),
  lastLogin: Date (nullable),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Task Collection
```javascript
{
  _id: ObjectId,
  firstName: String (required),
  phone: String (required),
  notes: String (default: ''),
  assignedTo: ObjectId (ref: 'Agent', required),
  status: String (enum: ['pending', 'in-progress', 'completed']),
  uploadBatch: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

## API Flow

### 1. Admin API Endpoints
```
POST /api/auth/login
├── Validate credentials
├── Generate JWT token
└── Return admin data + token

GET /api/agents
├── Verify admin token
├── Fetch active agents
└── Return agent list

POST /api/upload
├── Verify admin token
├── Process uploaded file
├── Distribute tasks
└── Return distribution summary
```

### 2. Agent API Endpoints
```
POST /api/agent/login
├── Validate agent credentials
├── Generate agent JWT token
├── Update lastLogin
└── Return agent data + token

GET /api/agent/tasks
├── Verify agent token
├── Fetch agent's tasks only
└── Return task list

PUT /api/agent/tasks/:id
├── Verify agent token
├── Verify task ownership
├── Update task status
└── Return updated task
```

### 3. Error Handling Flow
```
Request → Route Handler → Try/Catch → Error Middleware → Formatted Response
```

## Security Considerations

### 1. Password Security
- All passwords hashed using bcryptjs with salt rounds: 12
- Passwords never returned in API responses
- Password validation on both frontend and backend

### 2. JWT Security
- Tokens expire after 30 days
- Separate token storage for admin and agent
- Token validation on every protected route
- Agent tokens include type verification

### 3. Data Access Control
- Agents can only access their assigned tasks
- Admins have full access to all data
- Soft delete for agents (maintains data integrity)
- File upload restrictions (type, size)

### 4. Input Validation
- Email format validation
- Required field validation
- File type and size validation
- SQL injection prevention through Mongoose

## Performance Considerations

### 1. Database Optimization
- Indexes on frequently queried fields (email, assignedTo)
- Pagination for large task lists (limited to 100 recent tasks)
- Efficient queries with proper population

### 2. File Processing
- File size limits (5MB)
- Temporary file cleanup after processing
- Stream processing for large files
- Memory-efficient parsing

### 3. Frontend Optimization
- Context-based state management
- Lazy loading of components
- Efficient re-renders with proper dependencies
- Local state updates before API confirmation

This documentation provides a comprehensive understanding of how the MERN stack application works, from user interactions to database operations, ensuring maintainability and scalability.