// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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

const dutySchema = new mongoose.Schema({
    user: {
        type: String,
        enum: ['Venkatesh', 'Ninad', 'Prajwal', 'Aditya'],
        required: true,
    },
    task: {
        type: String,
        enum: ['Bathroom Cleaning', 'Bathtub Cleaning', 'Trash take out', 'Sweeping', 'Moping'],
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },
});

const Duty = mongoose.model('Duty', dutySchema);

// API to add a task
app.post('/api/add-duty', async (req, res) => {
    console.log('[DEBUG] POST /api/add-duty');
    console.log('[BODY]', req.body);

    const { user, task, timestamp } = req.body;

    try {
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
