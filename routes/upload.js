import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import path from "path";
import fs from "fs";
import Agent from "../models/Agent.js";
import Task from "../models/Task.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".csv", ".xlsx", ".xls"];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV, XLSX, and XLS files are allowed"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// @route   POST /api/upload
// @desc    Upload CSV/Excel file and distribute tasks
// @access  Private (Admin only)
router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get active agents
    const agents = await Agent.find({ isActive: true }).limit(5);
    if (agents.length === 0) {
      return res
        .status(400)
        .json({
          message: "No active agents found. Please create agents first.",
        });
    }

    // Parse the uploaded file
    const filePath = req.file.path;
    let data = [];

    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
    } catch (parseError) {
      fs.unlinkSync(filePath); // Clean up uploaded file
      return res
        .status(400)
        .json({ message: "Error parsing file. Please check the file format." });
    }

    // Validate required fields
    const requiredFields = ["FirstName", "Phone", "Notes"];
    const validatedData = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const missingFields = [];

      requiredFields.forEach((field) => {
        if (!row[field] && field !== "Notes") {
          // Notes can be empty
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        fs.unlinkSync(filePath); // Clean up uploaded file
        return res.status(400).json({
          message: `Missing required fields in row ${i + 1}: ${missingFields.join(
            ", "
          )}`,
        });
      }

      validatedData.push({
        firstName: row.FirstName.toString().trim(),
        phone: row.Phone.toString().trim(),
        notes: row.Notes ? row.Notes.toString().trim() : "",
      });
    }

    if (validatedData.length === 0) {
      fs.unlinkSync(filePath); // Clean up uploaded file
      return res.status(400).json({ message: "No valid data found in file" });
    }

    // Distribute tasks equally among agents
    const batchId = Date.now().toString();
    const tasksPerAgent = Math.floor(validatedData.length / agents.length);
    const remainder = validatedData.length % agents.length;

    const distribution = [];
    let currentIndex = 0;

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const extraTask = i < remainder ? 1 : 0;
      const taskCount = tasksPerAgent + extraTask;

      const agentTasks = validatedData.slice(
        currentIndex,
        currentIndex + taskCount
      );
      currentIndex += taskCount;

      // Create tasks for this agent
      const tasks = agentTasks.map((taskData) => ({
        ...taskData,
        assignedTo: agent._id,
        uploadBatch: batchId,
      }));

      await Task.insertMany(tasks);

      distribution.push({
        agentId: agent._id,
        agentName: agent.name,
        agentEmail: agent.email,
        taskCount: taskCount,
        tasks: agentTasks,
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      message: "File uploaded and tasks distributed successfully",
      totalTasks: validatedData.length,
      agentCount: agents.length,
      batchId: batchId,
      distribution: distribution.map((d) => ({
        agentId: d.agentId,
        agentName: d.agentName,
        agentEmail: d.agentEmail,
        taskCount: d.taskCount,
      })),
    });
  } catch (error) {
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/upload/tasks
// @desc    Get all tasks with agent details
// @access  Private (Admin only)
router.get("/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 tasks

    res.json({
      tasks,
      count: tasks.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
