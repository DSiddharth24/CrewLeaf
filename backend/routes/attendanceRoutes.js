const express = require('express');
const router = express.Router();
const { db, fcm } = require('../config/firebase');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { verifyDeviceToken } = require('../middleware/deviceMiddleware');

// RFID Scan from ESP32
router.post('/scan', verifyDeviceToken, async (req, res) => {
    const { card_uid } = req.body;
    const { id: deviceId, assignedFieldId } = req.device;

    if (!card_uid) return res.status(400).json({ error: 'Missing card_uid' });

    try {
        // 1. Find worker using rfid_cards mapping
        const cardSnapshot = await db.collection('rfid_cards').doc(card_uid).get();
        if (!cardSnapshot.exists) {
            return res.status(404).json({ error: 'RFID card not registered' });
        }

        const { workerId } = cardSnapshot.data();

        // 2. Fetch worker profile
        const workerDoc = await db.collection('users').doc(workerId).get();
        if (!workerDoc.exists) {
            return res.status(404).json({ error: 'Worker profile not found' });
        }

        const workerData = workerDoc.data();

        // 3. Create attendance entry
        const attendanceData = {
            workerId,
            workerName: workerData.name,
            deviceId,
            fieldId: assignedFieldId || 'unassigned',
            timestamp: new Date().toISOString()
        };

        await db.collection('attendance').add(attendanceData);

        // 4. Send push notifications
        const notifications = [];

        // Notify worker
        if (workerData.fcmToken) {
            notifications.push(fcm.send({
                token: workerData.fcmToken,
                notification: {
                    title: 'Attendance Recorded',
                    body: `Your attendance at field ${assignedFieldId || 'Unknown'} has been marked.`
                }
            }));
        }

        // Notify Manager
        if (workerData.managerId) {
            const managerDoc = await db.collection('users').doc(workerData.managerId).get();
            if (managerDoc.exists && managerDoc.data().fcmToken) {
                notifications.push(fcm.send({
                    token: managerDoc.data().fcmToken,
                    notification: {
                        title: 'Worker Present',
                        body: `${workerData.name} has arrived at the field.`
                    }
                }));
            }
        }

        await Promise.allSettled(notifications);

        res.json({ message: 'Attendance recorded successfully', workerName: workerData.name });

    } catch (error) {
        console.error('Error in RFID scan:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get attendance logs with filters
router.get('/', verifyToken, async (req, res) => {
    const { fieldId, managerId, workerId, startDate, endDate } = req.query;

    try {
        let query = db.collection('attendance');

        // Role-based filtering
        if (req.user.role === 'manager') {
            // Manager can only see their workers
            const workersSnapshot = await db.collection('users')
                .where('managerId', '==', req.user.uid)
                .get();
            const workerIds = workersSnapshot.docs.map(doc => doc.id);

            if (workerIds.length === 0) return res.json([]);
            query = query.where('workerId', 'in', workerIds);
        } else if (req.user.role === 'worker') {
            // Worker can only see their own
            query = query.where('workerId', 'in', [req.user.uid]);
        } else if (req.user.role !== 'supervisor') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Additional filters
        if (fieldId) query = query.where('fieldId', '==', fieldId);
        if (workerId) query = query.where('workerId', '==', workerId);

        // Date filtering (simplified for now, assumes ISO string)
        // For more robust filtering, use Firestore Timestamp or convert to Date objects

        const snapshot = await query.get();
        let logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Manual date filtering if needed (Firestore has limits on multiple where clauses)
        if (startDate) logs = logs.filter(log => log.timestamp >= startDate);
        if (endDate) logs = logs.filter(log => log.timestamp <= endDate);

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
