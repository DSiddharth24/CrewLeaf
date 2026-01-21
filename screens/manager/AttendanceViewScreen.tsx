import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { Attendance } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function AttendanceViewScreen() {
    const navigation = useNavigation();
    const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'today' | 'week' | 'all'>('today');

    useEffect(() => {
        loadAttendance();
    }, [filter]);

    const loadAttendance = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        // Calculate date range based on filter
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        let q;
        if (filter === 'today') {
            q = query(
                collection(db, 'attendance'),
                where('checkInTime', '>=', today),
                orderBy('checkInTime', 'desc')
            );
        } else if (filter === 'week') {
            q = query(
                collection(db, 'attendance'),
                where('checkInTime', '>=', weekAgo),
                orderBy('checkInTime', 'desc')
            );
        } else {
            q = query(
                collection(db, 'attendance'),
                orderBy('checkInTime', 'desc')
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const records: Attendance[] = [];
            snapshot.forEach((doc) => {
                records.push({ id: doc.id, ...doc.data() } as Attendance);
            });
            setAttendanceRecords(records);
        });

        return () => unsubscribe();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAttendance();
        setRefreshing(false);
    };

    const formatTime = (date: any) => {
        if (!date) return '--:--';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderAttendanceCard = ({ item }: { item: Attendance }) => {
        const isCheckedOut = !!item.checkOutTime;
        const statusColor = item.supervisorVerified
            ? colors.success
            : colors.warning;

        return (
            <View style={styles.attendanceCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.workerName}>Worker #{item.workerId.slice(-6)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>
                            {item.supervisorVerified ? 'Verified' : 'Pending'}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.timeRow}>
                        <View style={styles.timeBlock}>
                            <Text style={styles.timeLabel}>Check In</Text>
                            <Text style={styles.timeValue}>
                                {formatTime(item.checkInTime)}
                            </Text>
                        </View>

                        {isCheckedOut && (
                            <View style={styles.timeBlock}>
                                <Text style={styles.timeLabel}>Check Out</Text>
                                <Text style={styles.timeValue}>
                                    {formatTime(item.checkOutTime)}
                                </Text>
                            </View>
                        )}

                        {!isCheckedOut && (
                            <View style={styles.activeIndicator}>
                                <View style={styles.pulseDot} />
                                <Text style={styles.activeText}>Active</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.locationInfo}>
                        <Text style={styles.locationLabel}>📍 Field Location</Text>
                        <Text style={styles.locationText}>
                            {item.checkInLocation.latitude.toFixed(6)}, {item.checkInLocation.longitude.toFixed(6)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backText}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Live Attendance</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabs}>
                <TouchableOpacity
                    style={[styles.tab, filter === 'today' && styles.activeTab]}
                    onPress={() => setFilter('today')}
                >
                    <Text style={[styles.tabText, filter === 'today' && styles.activeTabText]}>
                        Today
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, filter === 'week' && styles.activeTab]}
                    onPress={() => setFilter('week')}
                >
                    <Text style={[styles.tabText, filter === 'week' && styles.activeTabText]}>
                        This Week
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, filter === 'all' && styles.activeTab]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.tabText, filter === 'all' && styles.activeTabText]}>
                        All
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Attendance List */}
            {attendanceRecords.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>✓</Text>
                    <Text style={styles.emptyTitle}>No Attendance Records</Text>
                    <Text style={styles.emptyText}>
                        Check-ins will appear here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={attendanceRecords}
                    renderItem={renderAttendanceCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary,
        paddingTop: spacing.xxl * 2,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: spacing.sm,
    },
    backText: {
        color: colors.white,
        fontSize: typography.fontSize.xl,
        fontWeight: '600',
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.white,
    },
    filterTabs: {
        flexDirection: 'row',
        padding: spacing.lg,
        gap: spacing.sm,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
        alignItems: 'center',
        ...shadows.sm,
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
    },
    activeTabText: {
        color: colors.white,
    },
    listContent: {
        padding: spacing.lg,
    },
    attendanceCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    workerName: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.gray900,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        color: colors.white,
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
    },
    cardContent: {},
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    timeBlock: {},
    timeLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
        marginBottom: spacing.xs,
    },
    timeValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.gray900,
    },
    activeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pulseDot: {
        width: 12,
        height: 12,
        borderRadius: borderRadius.full,
        backgroundColor: colors.success,
        marginRight: spacing.sm,
    },
    activeText: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.success,
    },
    locationInfo: {
        backgroundColor: colors.gray100,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
    },
    locationLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
        marginBottom: spacing.xs,
    },
    locationText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray900,
        fontFamily: 'monospace',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xxl,
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.gray900,
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: typography.fontSize.md,
        color: colors.gray600,
        textAlign: 'center',
    },
});
