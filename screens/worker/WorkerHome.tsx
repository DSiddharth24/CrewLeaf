import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    ActivityIndicator,
    AppState,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    orderBy,
    limit,
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { getCurrentLocation } from '../../services/locationService';
import { Task } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function WorkerHome() {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [attendanceId, setAttendanceId] = useState<string | null>(null);
    const [checkInTime, setCheckInTime] = useState<Date | null>(null);
    const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Tasks State
    const [myTasks, setMyTasks] = useState<Task[]>([]);

    useEffect(() => {
        checkCurrentStatus();
        fetchMyTasks();
        return () => stopTimer();
    }, []);

    useEffect(() => {
        if (checkInTime && attendanceId) {
            startTimer();
        } else {
            stopTimer();
        }
    }, [checkInTime, attendanceId]);

    const startTimer = () => {
        stopTimer();
        timerRef.current = setInterval(() => {
            if (checkInTime) {
                const now = new Date();
                const diff = now.getTime() - checkInTime.getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setElapsedTime(
                    `${hours.toString().padStart(2, '0')}:${minutes
                        .toString()
                        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const checkCurrentStatus = async () => {
        try {
            setLoading(true);
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            // Check for open attendance record (no checkOutTime) today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const q = query(
                collection(db, 'attendance'),
                where('workerId', '==', userId),
                where('checkInTime', '>=', today),
                orderBy('checkInTime', 'desc'),
                limit(1)
            );

            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const docData = snapshot.docs[0].data();
                if (!docData.checkOutTime) {
                    // Still checked in
                    setAttendanceId(snapshot.docs[0].id);
                    // Handle Firestore Timestamp
                    const cTime = docData.checkInTime.toDate ? docData.checkInTime.toDate() : new Date(docData.checkInTime);
                    setCheckInTime(cTime);
                } else {
                    // Checked out already
                    setAttendanceId(null);
                    setCheckInTime(null);
                }
            }
        } catch (error) {
            console.error('Error checking status:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyTasks = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const q = query(
                collection(db, 'tasks'),
                where('assignedWorkers', 'array-contains', userId),
                where('status', 'in', ['pending', 'active']),
                orderBy('deadline', 'asc')
            );

            const snapshot = await getDocs(q);
            const tasksList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            setMyTasks(tasksList);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await checkCurrentStatus();
        await fetchMyTasks();
        setRefreshing(false);
    };

    const handleSignOut = async () => {
        await auth.signOut();
        navigation.navigate('Splash' as never);
    };

    const handleCheckIn = async () => {
        try {
            setLoading(true);
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('No user found');

            // 1. Get GPS Location
            const location = await getCurrentLocation();
            if (!location) {
                Alert.alert('Location Error', 'Could not fetch your location. Please check permissions.');
                setLoading(false);
                return;
            }

            // 2. Create Attendance Record
            const newAttendance = {
                workerId: userId,
                fieldId: 'unknown', // TODO: Implement geofencing to detect field
                checkInTime: serverTimestamp(),
                checkInLocation: location,
                status: 'present',
                supervisorVerified: false,
            };

            const docRef = await addDoc(collection(db, 'attendance'), newAttendance);

            // 3. Update State
            setAttendanceId(docRef.id);
            setCheckInTime(new Date());
            Alert.alert('Success', 'Checked in successfully!');
        } catch (error: any) {
            Alert.alert('Error', 'Check-in failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            if (!attendanceId) return;

            Alert.alert(
                'Confirm Check Out',
                'Are you sure you want to check out?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Check Out',
                        style: 'destructive',
                        onPress: async () => {
                            setLoading(true);
                            const location = await getCurrentLocation();

                            await updateDoc(doc(db, 'attendance', attendanceId), {
                                checkOutTime: serverTimestamp(),
                                checkOutLocation: location || { latitude: 0, longitude: 0 },
                                status: 'present', // or logic to determine if left early
                            });

                            setAttendanceId(null);
                            setCheckInTime(null);
                            setElapsedTime('00:00:00');
                            stopTimer();
                            Alert.alert('Success', 'Checked out successfully!');
                            setLoading(false);
                        },
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', 'Check-out failed: ' + error.message);
            setLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return colors.error;
            case 'Normal': return colors.primary;
            case 'Low': return colors.success;
            default: return colors.gray500;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>W</Text>
                    </View>
                    <View>
                        <Text style={styles.greeting}>Welcome, Worker</Text>
                        <Text style={styles.statusText}>
                            {attendanceId ? '🟢 Online' : '⚪ Offline'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Main Action: Check In/Out */}
                {loading && !refreshing ? (
                    <View style={[styles.checkInButton, styles.loadingButton]}>
                        <ActivityIndicator size="large" color={colors.white} />
                        <Text style={styles.buttonText}>Please wait...</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.checkInButton,
                            attendanceId ? styles.checkOutStyle : styles.checkInStyle,
                        ]}
                        onPress={attendanceId ? handleCheckOut : handleCheckIn}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <View style={styles.buttonInner}>
                            <Text style={styles.buttonIcon}>{attendanceId ? '🛑' : '📍'}</Text>
                            <Text style={styles.buttonText}>
                                {attendanceId ? 'Check Out' : 'Start Work'}
                            </Text>
                            {attendanceId && (
                                <View style={styles.timerContainer}>
                                    <Text style={styles.timerLabel}>Duration</Text>
                                    <Text style={styles.timerText}>{elapsedTime}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                )}

                {/* Info Cards */}
                {attendanceId && (
                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>Current Session</Text>
                        <Text style={styles.infoText}>
                            Started at: {checkInTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Text style={styles.infoText}>Status: Tracking Location</Text>
                    </View>
                )}

                {/* Assigned Tasks */}
                <Text style={styles.sectionTitle}>My Tasks Today</Text>
                {myTasks.length === 0 ? (
                    <View style={styles.emptyTaskCard}>
                        <Text style={styles.emptyTaskText}>No active tasks assigned.</Text>
                        <Text style={styles.emptyTaskSubText}>Ask your supervisor for work.</Text>
                    </View>
                ) : (
                    myTasks.map((task) => (
                        <View key={task.id} style={styles.taskCard}>
                            <View style={styles.taskHeader}>
                                <Text style={styles.taskTitle}>{task.name}</Text>
                                <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority || 'Normal') + '20' }]}>
                                    <Text style={[styles.badgeText, { color: getPriorityColor(task.priority || 'Normal') }]}>
                                        {task.priority || 'Normal'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.taskDesc}>{task.type} • Due: {task.deadline?.toDate ? task.deadline.toDate().toLocaleDateString() : 'No Deadline'}</Text>

                            <View style={styles.progressContainer}>
                                <View style={styles.progressRow}>
                                    <Text style={styles.progressText}>Status: {task.status}</Text>
                                    <Text style={styles.progressText}>{task.progress}%</Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${task.progress}%` }]} />
                                </View>
                            </View>

                            {/* Simple Action Button */}
                            {task.status !== 'completed' && (
                                <TouchableOpacity style={styles.completeButton} onPress={() => Alert.alert('Update', 'Marking as done feature coming soon!')}>
                                    <Text style={styles.completeButtonText}>Update Progress</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}

                {/* Recent Wages */}
                <Text style={styles.sectionTitle}>Recent Wages</Text>
                <TouchableOpacity style={styles.wageCard}>
                    <View>
                        <Text style={styles.wageDate}>Yesterday</Text>
                        <Text style={styles.wageLabel}>8 hours work</Text>
                    </View>
                    <Text style={styles.wageAmount}>₹450</Text>
                </TouchableOpacity>

                {/* Issues Reporting */}
                <TouchableOpacity
                    style={styles.issueButton}
                    onPress={() => navigation.navigate('ReportIssue' as never)}
                >
                    <Text style={styles.issueButtonText}>⚠️ Report an Issue</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.white,
        paddingTop: spacing.xxl * 2,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...shadows.sm,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: typography.fontSize.lg,
    },
    greeting: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.gray900,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
    },
    signOutText: {
        color: colors.error,
        fontWeight: '600',
        fontSize: typography.fontSize.sm,
    },
    content: {
        padding: spacing.lg,
    },
    checkInButton: {
        height: 180,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.xl,
        overflow: 'hidden',
        ...shadows.md,
    },
    loadingButton: {
        backgroundColor: colors.gray400,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkInStyle: {
        backgroundColor: colors.primary,
    },
    checkOutStyle: {
        backgroundColor: colors.error,
    },
    buttonInner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    buttonIcon: {
        fontSize: 48,
    },
    buttonText: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.white,
    },
    timerContainer: {
        alignItems: 'center',
        marginTop: spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    timerLabel: {
        fontSize: typography.fontSize.xs,
        color: 'rgba(255,255,255,0.8)',
    },
    timerText: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.white,
        fontFamily: 'monospace',
    },
    infoCard: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        ...shadows.sm,
    },
    infoTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.gray900,
        marginBottom: spacing.xs,
    },
    infoText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.gray900,
        marginBottom: spacing.md,
    },
    taskCard: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    emptyTaskCard: {
        backgroundColor: colors.white,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.gray300,
    },
    emptyTaskText: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.gray500,
    },
    emptyTaskSubText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray400,
        marginTop: spacing.xs,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    taskTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.gray900,
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    badgeText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
    },
    taskDesc: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
        marginBottom: spacing.md,
    },
    progressContainer: {},
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    progressText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: colors.gray200,
        borderRadius: borderRadius.full,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.success,
        borderRadius: borderRadius.full,
    },
    completeButton: {
        marginTop: spacing.md,
        backgroundColor: colors.primary + '10',
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    completeButtonText: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: typography.fontSize.sm,
    },
    wageCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    wageDate: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray900,
    },
    wageLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
    },
    wageAmount: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.success,
    },
    issueButton: {
        backgroundColor: colors.gray200,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    issueButtonText: {
        color: colors.gray800,
        fontWeight: 'bold',
        fontSize: typography.fontSize.md,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: spacing.xl,
    },
});
