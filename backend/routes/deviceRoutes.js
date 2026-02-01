const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../config/firebase');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Register a new ESP32 device
router.post('/register', async (req, res) => {
    const { chipId, firmware, model } = req.body;

    if (!chipId) {
        return res.status(400).json({ error: 'Missing chipId' });
    }

    try {
        // Check if device already registered
        const deviceRef = db.collection('devices').doc(chipId);
        const doc = await deviceRef.get();

        if (doc.exists) {
            return res.json({ deviceToken: doc.data().deviceToken });
        }

        // Generate a unique device token
        const deviceToken = crypto.randomBytes(32).toString('hex');

        await deviceRef.set({
            chipId,
            firmware,
            model,
            deviceToken,
            status: 'unassigned',
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ deviceToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assign device to a field (Supervisor only)
router.post('/assign', verifyToken, checkRole(['supervisor']), async (req, res) => {
    const { deviceId, assignedFieldId, assignedGateName } = req.body;

    if (!deviceId || !assignedFieldId || !assignedGateName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await db.collection('devices').doc(deviceId).update({
            assignedFieldId,
            assignedGateName,
            status: 'active'
        });

        res.json({ message: 'Device assigned successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List unassigned devices (Supervisor only)
router.get('/unassigned', verifyToken, checkRole(['supervisor']), async (req, res) => {
    try {
        const snapshot = await db.collection('devices')
            .where('status', '==', 'unassigned')
            .get();

        const devices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List all devices for supervisor/manager
router.get('/all', verifyToken, checkRole(['supervisor', 'manager']), async (req, res) => {
    try {
        let query = db.collection('devices');

        // If manager, only show devices in their assigned fields? 
        // The requirement says "View devices installed in his area"
        if (req.user.role === 'manager' && req.user.assignedFieldId) {
            query = query.where('assignedFieldId', '==', req.user.assignedFieldId);
        } else if (req.user.role === 'manager' && !req.user.assignedFieldId) {
            return res.json([]);
        }

        const snapshot = await query.get();
        const devices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
