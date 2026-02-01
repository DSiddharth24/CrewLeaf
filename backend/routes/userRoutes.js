const express = require('express');
const router = express.Router();
const { db, auth } = require('../config/firebase');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
    res.json(req.user);
});

// Create a new user (Supervisor only)
router.post('/create', verifyToken, checkRole(['supervisor']), async (req, res) => {
    const { phoneNumber, name, role, assignedFieldId, managerId } = req.body;

    if (!phoneNumber || !name || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Check if user already exists in Firebase Auth to get or create UID
        let userRecord;
        try {
            userRecord = await auth.getUserByPhoneNumber(phoneNumber);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                userRecord = await auth.createUser({ phoneNumber, displayName: name });
            } else {
                throw error;
            }
        }

        const userData = {
            phoneNumber,
            name,
            role,
            supervisorId: req.user.uid,
            createdAt: new Date().toISOString()
        };

        if (assignedFieldId) userData.assignedFieldId = assignedFieldId;
        if (managerId) userData.managerId = managerId;

        await db.collection('users').doc(userRecord.uid).set(userData, { merge: true });

        res.status(201).json({ message: 'User created successfully', uid: userRecord.uid });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: error.message });
    }
});

// List workers (Supervisor can see all, Manager can see assigned)
router.get('/workers', verifyToken, async (req, res) => {
    try {
        let query = db.collection('users').where('role', '==', 'worker');

        if (req.user.role === 'manager') {
            query = query.where('managerId', '==', req.user.uid);
        } else if (req.user.role !== 'supervisor') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const snapshot = await query.get();
        const workers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(workers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List managers (Supervisor only)
router.get('/managers', verifyToken, checkRole(['supervisor']), async (req, res) => {
    try {
        const snapshot = await db.collection('users')
            .where('role', '==', 'manager')
            .where('supervisorId', '==', req.user.uid)
            .get();

        const managers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(managers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
