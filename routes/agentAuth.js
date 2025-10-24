import express from 'express';
import jwt from 'jsonwebtoken';
import Agent from '../models/Agent.js';
import Task from '../models/Task.js';

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id, type: 'agent' }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/agent/login
// @desc    Agent login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find agent
    const agent = await Agent.findOne({ email, isActive: true });
    if (!agent) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await agent.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    agent.lastLogin = new Date();
    await agent.save();

    const token = generateToken(agent._id);

    res.json({
      message: 'Login successful',
      token,
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        mobile: agent.mobile
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/agent/me
// @desc    Get current agent
// @access  Private (Agent only)
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'agent') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    const agent = await Agent.findById(decoded.id).select('-password');
    
    if (!agent || !agent.isActive) {
      return res.status(401).json({ message: 'Agent not found or inactive' });
    }

    res.json({
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        mobile: agent.mobile
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// @route   GET /api/agent/tasks
// @desc    Get agent's assigned tasks
// @access  Private (Agent only)
router.get('/tasks', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'agent') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    const agent = await Agent.findById(decoded.id);
    
    if (!agent || !agent.isActive) {
      return res.status(401).json({ message: 'Agent not found or inactive' });
    }

    const tasks = await Task.find({ assignedTo: agent._id })
      .sort({ createdAt: -1 });

    res.json({
      tasks,
      count: tasks.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/agent/tasks/:id
// @desc    Update task status
// @access  Private (Agent only)
router.put('/tasks/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'agent') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    const agent = await Agent.findById(decoded.id);
    
    if (!agent || !agent.isActive) {
      return res.status(401).json({ message: 'Agent not found or inactive' });
    }

    // Find task and verify it belongs to this agent
    const task = await Task.findOne({ _id: taskId, assignedTo: agent._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found or not assigned to you' });
    }

    // Update task status
    task.status = status;
    await task.save();

    res.json({
      message: 'Task status updated successfully',
      task: {
        id: task._id,
        firstName: task.firstName,
        phone: task.phone,
        notes: task.notes,
        status: task.status,
        updatedAt: task.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
