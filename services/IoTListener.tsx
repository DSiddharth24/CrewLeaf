import React, { useEffect } from 'react';
import { getDatabase, ref, onChildAdded, remove } from 'firebase/database';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, firestore } from '../config/firebase'; // Ensure you export 'db' as RTDB and 'firestore' as Firestore

// This component doesn't render anything visible
// It runs in the background to process IoT logs
export default function IoTListener() {
    useEffect(() => {
        const rtdb = getDatabase();
        const logsRef = ref(rtdb, 'iot_logs');

        const unsubscribe = onChildAdded(logsRef, async (snapshot) => {
            const logData = snapshot.val();
            const logKey = snapshot.key;

            if (logData && logData.cardId) {
                console.log('New IoT Log Received:', logData);
                await processAttendance(logData.cardId, logData.deviceId, logKey);
            }
        });

        return () => unsubscribe();
    }, []);

    const processAttendance = async (cardId: string, deviceId: string, logKey: string | null) => {
        try {
            // 1. Find Worker by Card ID
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('rfidCardId', '==', cardId));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.log('Card not assigned to any worker:', cardId);
                // Optional: Log 'Unknown Card' event
                return;
            }

            const workerDoc = querySnapshot.docs[0];
            const workerId = workerDoc.id;
            const workerName = workerDoc.data().name;

            console.log(`Processing attendance for: ${workerName} (${workerId})`);

            // 2. Check for Open Session (checked in today but not out)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const attendanceRef = collection(firestore, 'attendance');
            const activeQuery = query(
                attendanceRef,
                where('workerId', '==', workerId),
                where('checkInTime', '>=', today),
                where('status', '==', 'present') // Assuming 'present' means active
            );

            const activeSnapshot = await getDocs(activeQuery);

            // Determine if Check-In or Check-Out
            let isOpenSession = false;
            let activeDocId = null;

            activeSnapshot.forEach(doc => {
                if (!doc.data().checkOutTime) {
                    isOpenSession = true;
                    activeDocId = doc.id;
                }
            });

            if (isOpenSession && activeDocId) {
                // CHECK OUT
                await updateDoc(doc(firestore, 'attendance', activeDocId), {
                    checkOutTime: serverTimestamp(),
                    checkOutDevice: deviceId,
                    checkOutMethod: 'rfid'
                });
                console.log('Checked OUT successfully');
            } else {
                // CHECK IN
                await addDoc(collection(firestore, 'attendance'), {
                    workerId: workerId,
                    checkInTime: serverTimestamp(),
                    checkInDevice: deviceId,
                    checkInMethod: 'rfid',
                    status: 'present',
                    supervisorVerified: true // IoT is trusted source
                });
                console.log('Checked IN successfully');
            }

            // 3. Remove Log from RTDB (Clean up)
            if (logKey) {
                const rtdb = getDatabase();
                const logRef = ref(rtdb, `iot_logs/${logKey}`);
                await remove(logRef);
            }

        } catch (error) {
            console.error('Error processing IoT attendance:', error);
        }
    };

    return null;
}
