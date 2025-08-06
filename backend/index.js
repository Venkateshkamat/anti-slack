// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Validate Mongo URI
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error('❌ MONGO_URI not set in .env file');
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(mongoUri);

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Task Schema
const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Duty Schema - updated to reference dynamic users and tasks
const dutySchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    task: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);
const Duty = mongoose.model('Duty', dutySchema);

// Initialize default users and tasks if they don't exist
const initializeDefaults = async () => {
    const defaultUsers = ['Venkatesh', 'Ninad', 'Prajwal', 'Aditya'];
    const defaultTasks = ['Bathroom Cleaning', 'Bathtub Cleaning', 'Trash take out', 'Sweeping', 'Moping'];

    for (const userName of defaultUsers) {
        await User.findOneAndUpdate(
            { name: userName },
            { name: userName },
            { upsert: true, new: true }
        );
    }

    for (const taskName of defaultTasks) {
        await Task.findOneAndUpdate(
            { name: taskName },
            { name: taskName },
            { upsert: true, new: true }
        );
    }
};

// Initialize defaults on startup
initializeDefaults().catch(console.error);

// API to get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ name: 1 });
        res.status(200).json(users.map(u => u.name));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to add a new user
app.post('/api/users', async (req, res) => {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'User name is required' });
    }

    try {
        const user = new User({ name: name.trim() });
        await user.save();
        res.status(201).json({ message: 'User added successfully', user: user.name });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ error: 'User already exists' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// API to delete a user
app.delete('/api/users/:name', async (req, res) => {
    const { name } = req.params;
    
    try {
        // Check if user has any duties
        const dutyCount = await Duty.countDocuments({ user: name });
        if (dutyCount > 0) {
            return res.status(400).json({ 
                error: `Cannot delete user. User has ${dutyCount} duties assigned.` 
            });
        }

        const result = await User.findOneAndDelete({ name });
        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ name: 1 });
        res.status(200).json(tasks.map(t => t.name));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to add a new task
app.post('/api/tasks', async (req, res) => {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Task name is required' });
    }

    try {
        const task = new Task({ name: name.trim() });
        await task.save();
        res.status(201).json({ message: 'Task added successfully', task: task.name });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ error: 'Task already exists' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// API to delete a task
app.delete('/api/tasks/:name', async (req, res) => {
    const { name } = req.params;
    
    try {
        // Check if task has any duties
        const dutyCount = await Duty.countDocuments({ task: name });
        if (dutyCount > 0) {
            return res.status(400).json({ 
                error: `Cannot delete task. Task has ${dutyCount} duties assigned.` 
            });
        }

        const result = await Task.findOneAndDelete({ name });
        if (!result) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to add a task
app.post('/api/add-duty', async (req, res) => {
    console.log('[DEBUG] POST /api/add-duty');
    console.log('[BODY]', req.body);

    const { user, task, timestamp } = req.body;

    try {
        // Validate that user and task exist
        const userExists = await User.findOne({ name: user });
        const taskExists = await Task.findOne({ name: task });

        if (!userExists) {
            return res.status(400).json({ error: 'User does not exist' });
        }
        if (!taskExists) {
            return res.status(400).json({ error: 'Task does not exist' });
        }

        const duty = new Duty({ user, task, timestamp: new Date(timestamp) });
        await duty.save();
        res.status(201).json({ message: 'Duty logged successfully' });
    } catch (err) {
        console.error('[ERROR]', err);
        res.status(400).json({ error: err.message });
    }
});


// API to get all duties
app.get('/api/get-duties', async (req, res) => {
    try {
        const duties = await Duty.find().sort({ timestamp: -1 });
        res.status(200).json(duties);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to get total duties per user
app.get('/api/stats/total-per-user', async (req, res) => {
    try {
        const result = await Duty.aggregate([
            {
                $group: {
                    _id: '$user',
                    total: { $sum: 1 },
                },
            },
            {
                $project: {
                    user: '$_id',
                    total: 1,
                    _id: 0,
                },
            },
        ]);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to get duty count per user per date
app.get('/api/stats/per-user-per-date', async (req, res) => {
    try {
        const result = await Duty.aggregate([
            {
                $group: {
                    _id: {
                        user: '$user',
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    user: '$_id.user',
                    date: '$_id.date',
                    count: 1,
                    _id: 0,
                },
            },
            {
                $sort: { date: 1 },
            },
        ]);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve React frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // For any unknown routes, serve index.html (React SPA)
  app.get('/*wildcard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
