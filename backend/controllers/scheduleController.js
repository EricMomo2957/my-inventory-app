const db = require('../config/db');

// 1. GET ALL SCHEDULES
exports.getAllSchedules = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM schedules ORDER BY date ASC');
        const formatted = rows.map(r => ({
            id: r.id,
            title: r.title || r.name || 'Untitled Event',
            date: r.date,
            category: r.category || r.type || 'Work Task',
            type: r.type || r.category || 'Work Task'
        }));
        res.json(formatted);
    } catch (err) {
        console.error("Schedule Fetch Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// 2. CREATE SCHEDULE
exports.createSchedule = async (req, res) => {
    try {
        const { title, date, category, type } = req.body; 
        const finalCategory = category || type || 'Work Task';
        
        try {
            await db.query('INSERT INTO schedules (title, date, category) VALUES (?, ?, ?)', [title, date, finalCategory]);
        } catch (colErr) {
            await db.query('INSERT INTO schedules (title, date, type) VALUES (?, ?, ?)', [title, date, finalCategory]);
        }
        
        res.status(201).json({ success: true, message: "Schedule created successfully" });
    } catch (err) {
        console.error("Schedule Insert Error:", err); 
        res.status(500).json({ error: err.message });
    }
};

// 3. UPDATE SCHEDULE
exports.updateSchedule = async (req, res) => {
    try {
        const { title, date, category, type } = req.body;
        const { id } = req.params;
        const finalCategory = category || type || 'Work Task';

        try {
            await db.query('UPDATE schedules SET title = ?, date = ?, category = ? WHERE id = ?', [title, date, finalCategory, id]);
        } catch (colErr) {
            await db.query('UPDATE schedules SET title = ?, date = ?, type = ? WHERE id = ?', [title, date, finalCategory, id]);
        }
        
        res.json({ success: true, message: 'Schedule updated successfully' });
    } catch (err) {
        console.error("Schedule Update Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// 4. DELETE SCHEDULE
exports.deleteSchedule = async (req, res) => {
    try {
        await db.query('DELETE FROM schedules WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Schedule deleted successfully' });
    } catch (err) {
        console.error("Schedule Delete Error:", err);
        res.status(500).json({ error: err.message });
    }
};
