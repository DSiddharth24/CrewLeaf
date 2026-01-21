import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Image,
    Alert,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../config/firebase'; // Correct path relative to screens/supervisor
import { colors, spacing, typography, borderRadius, shadows } from '../../theme'; // Correct path

interface AttendanceRecord {
    id: string;
    workerName: string;
    checkInTime: any;
    checkOutTime?: any;
    status: string;
    supervisorVerified: boolean;
    workerId: string;
}

export default function AttendanceVerificationScreen() {
    const navigation = useNavigation();
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            // In a real app, join with 'users' collection to get names.
            // For now, fetching attendance and we'll assume we have names or fetch them.
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const q = query(
                collection(db, 'attendance'),
                where('checkInTime', '>=', today),
                orderBy('checkInTime', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const fetched: AttendanceRecord[] = [];

            // Helper to fetch name (using a cache/map would be better in prod)
            for (const d of querySnapshot.docs) {
                const data = d.data();
                // QUICK HACK: Fetch worker name for each (n+1 problem, but ok for demo)
                // ideally we store name in attendance or use a context
                fetched.push({
                    id: d.id,
                    workerName: 'Worker ' + data.workerId.substr(0, 4), // Placeholder if no name
                    checkInTime: data.checkInTime,
                    checkOutTime: data.checkOutTime,
                    status: data.status,
                    supervisorVerified: data.supervisorVerified,
                    workerId: data.workerId,
                });
            }
            setRecords(fetched);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const verifyRecord = async (id: string, approve: boolean) => {
        try {
            await updateDoc(doc(db, 'attendance', id), {
                supervisorVerified: approve,
                verifiedAt: serverTimestamp(),
                verifierId: auth.currentUser?.uid
            });
            // Optimistic update
            setRecords(prev => prev.map(r => r.id === id ? { ...r, supervisorVerified: approve } : r));
            if (!approve) Alert.alert("Flagged", "Attendance record flagged for review.");
        } catch (error) {
            Alert.alert("Error", "Action failed");
        }
    };

    const renderItem = ({ item }: { item: AttendanceRecord }) => {
        const isVerified = item.supervisorVerified;
        const timeStr = item.checkInTime?.toDate
            ? item.checkInTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Using GPS...';

        return (
            <View style={styles.card}>
                <View style={styles.cardLeft}>
                    <View style={[styles.avatar, { backgroundColor: isVerified ? colors.success : colors.warning }]}>
                        <Text style={styles.avatarText}>{item.workerName.charAt(0)}</Text>
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.name}>{item.workerName}</Text>
                    <Text style={styles.time}>In: {timeStr} • {item.status}</Text>
                </View>

                <View style={styles.cardActions}>
                    {!isVerified ? (
                        <>
                            <TouchableOpacity onPress={() => verifyRecord(item.id, true)} style={styles.actionBtn}>
                                <Text style={styles.check}>✓</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => verifyRecord(item.id, false)} style={[styles.actionBtn, styles.rejectBtn]}>
                                <Text style={[styles.check, styles.rejectText]}>✕</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Attendance Verification</Text>
                <View style={{ width: 20 }} />
            </View>

            <FlatList
                data={records}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAttendance(); }} />}
                ListEmptyComponent={
                    !loading ? <Text style={styles.empty}>No attendance records today.</Text> : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        height: 100,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        justifyContent: 'space-between',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...shadows.md,
    },
    back: { color: colors.white, fontSize: 32, marginBottom: -4 },
    title: { color: colors.white, fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
    list: { padding: spacing.md },
    card: {
        backgroundColor: colors.white,
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.sm,
    },
    cardLeft: { marginRight: spacing.md },
    avatar: {
        width: 48, height: 48, borderRadius: 24,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: colors.white, fontWeight: 'bold', fontSize: 18 },
    cardContent: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: colors.gray900 },
    time: { fontSize: 12, color: colors.gray600, marginTop: 2 },
    cardActions: { flexDirection: 'row', gap: 8 },
    actionBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: colors.success + '20',
        alignItems: 'center', justifyContent: 'center',
    },
    check: { color: colors.success, fontSize: 18, fontWeight: 'bold' },
    rejectBtn: { backgroundColor: colors.error + '20' },
    rejectText: { color: colors.error },
    verifiedBadge: {
        backgroundColor: colors.gray100,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    verifiedText: { fontSize: 12, color: colors.gray600, fontWeight: '600' },
    empty: { textAlign: 'center', marginTop: 40, color: colors.gray500 }
});
