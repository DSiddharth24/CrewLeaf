const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Create a new field with boundary (Supervisor only)
router.post('/create', verifyToken, checkRole(['supervisor']), async (req, res) => {
    const { name, boundary } = req.body;

    if (!name || !boundary || !Array.isArray(boundary)) {
        return res.status(400).json({ error: 'Missing name or boundary (polygon coordinates)' });
    }

    try {
        const fieldRef = await db.collection('fields').add({
            name,
            boundary,
            supervisorId: req.user.uid,
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ id: fieldRef.id, message: 'Field created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all fields
router.get('/all', verifyToken, async (req, res) => {
    try {
        let query = db.collection('fields');

        if (req.user.role === 'manager' && req.user.assignedFieldId) {
            query = query.where('__name__', '==', req.user.assignedFieldId);
        } else if (req.user.role === 'worker' && req.user.assignedFieldId) {
            query = query.where('__name__', '==', req.user.assignedFieldId);
        } else if (req.user.role !== 'supervisor') {
            // If manager/worker has no assigned field, they can't see anything?
            // Based on roles: Manager can view map of assigned area.
        }

        const snapshot = await query.get();
        const fields = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(fields);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
