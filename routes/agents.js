import express from 'express';
import Agent from '../models/Agent.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/agents
// @desc    Create new agent
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    const agent = new Agent({
      name,
      email,
      mobile,
      password
    });

    await agent.save();

    res.status(201).json({
      message: 'Agent created successfully',
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        mobile: agent.mobile,
        isActive: agent.isActive,
        createdAt: agent.createdAt
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/agents
// @desc    Get all agents
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const agents = await Agent.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      agents,
      count: agents.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/agents/:id
// @desc    Update agent
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    agent.name = name || agent.name;
    agent.email = email || agent.email;
    agent.mobile = mobile || agent.mobile;

    await agent.save();

    res.json({
      message: 'Agent updated successfully',
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        mobile: agent.mobile,
        isActive: agent.isActive
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/agents/:id
// @desc    Delete agent (soft delete)
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    agent.isActive = false;
    await agent.save();

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
