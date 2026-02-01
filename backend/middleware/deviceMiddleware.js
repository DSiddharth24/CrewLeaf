const { db } = require('../config/firebase');

const verifyDeviceToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No device token provided' });
    }

    const deviceToken = authHeader.split('Bearer ')[1];

    try {
        const devicesSnapshot = await db.collection('devices')
            .where('deviceToken', '==', deviceToken)
            .limit(1)
            .get();

        if (devicesSnapshot.empty) {
            return res.status(403).json({ error: 'Unauthorized: Invalid device token' });
        }

        const deviceDoc = devicesSnapshot.docs[0];
        req.device = {
            id: deviceDoc.id,
            ...deviceDoc.data()
        };
        next();
    } catch (error) {
        console.error('Error verifying device token:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { verifyDeviceToken };
