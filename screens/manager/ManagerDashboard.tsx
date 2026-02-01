import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface DashboardStats {
    activeWorkers: number;
    workersInsideFields: number;
    tasksInProgress: number;
    todayWageLiability: number;
}

export default function ManagerDashboard() {
    const navigation = useNavigation();
    const [stats, setStats] = useState<DashboardStats>({
        activeWorkers: 0,
        workersInsideFields: 0,
        tasksInProgress: 0,
        todayWageLiability: 0,
    });
    const [refreshing, setRefreshing] = useState(false);
    const [alerts, setAlerts] = useState<string[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        // Real-time listeners will be set up here
        // For now, mock data for demonstration
        setStats({
            activeWorkers: 12,
            workersInsideFields: 8,
            tasksInProgress: 5,
            todayWageLiability: 15750,
        });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const handleSignOut = async () => {
        await auth.signOut();
        navigation.navigate('Splash' as never);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Good Morning</Text>
                    <Text style={styles.userName}>Manager</Text>
                </View>
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
                        <Text style={styles.statNumber}>{stats.activeWorkers}</Text>
                        <Text style={styles.statLabel}>Active Workers</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.success }]}>
                        <Text style={styles.statNumber}>{stats.workersInsideFields}</Text>
                        <Text style={styles.statLabel}>Workers in Field</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.accent }]}>
                        <Text style={styles.statNumber}>{stats.tasksInProgress}</Text>
                        <Text style={styles.statLabel}>Tasks in Progress</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
                        <Text style={styles.statNumber}>₹{stats.todayWageLiability}</Text>
                        <Text style={styles.statLabel}>Today's Wages</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('WorkerManagement' as never)}
                    >
                        <Text style={styles.actionIcon}>👥</Text>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>My Workers</Text>
                            <Text style={styles.actionDescription}>
                                View assigned plantation labour
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('WorkerManagement' as never)}
                    >
                        <Text style={styles.actionIcon}>👥</Text>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Worker Management</Text>
                            <Text style={styles.actionDescription}>
                                View and manage workers
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('TaskManagement' as never)}
                    >
                        <Text style={styles.actionIcon}>📋</Text>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Task Management</Text>
                            <Text style={styles.actionDescription}>
                                Create and assign tasks
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('AttendanceView' as never)}
                    >
                        <Text style={styles.actionIcon}>✓</Text>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Attendance</Text>
                            <Text style={styles.actionDescription}>
                                Live attendance tracking
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('WageManagement' as never)}
                    >
                        <Text style={styles.actionIcon}>💰</Text>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Wage & Payments</Text>
                            <Text style={styles.actionDescription}>
                                Calculate and process wages
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Analytics' as never)}
                    >
                        <Text style={styles.actionIcon}>📊</Text>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Analytics</Text>
                            <Text style={styles.actionDescription}>
                                Productivity insights
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('IssuesAlerts' as never)}
                    >
                        <Text style={styles.actionIcon}>⚠️</Text>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Alerts & Issues</Text>
                            <Text style={styles.actionDescription}>
                                View notifications
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Settings' as never)}
                    >
                        <Text style={styles.actionIcon}>⚙️</Text>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Settings</Text>
                            <Text style={styles.actionDescription}>
                                Permissions & Reports
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>
                </View>
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
        backgroundColor: colors.primary,
        paddingTop: spacing.xxl * 2,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: typography.fontSize.md,
        color: colors.white,
        opacity: 0.9,
    },
    userName: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.white,
        marginTop: spacing.xs,
    },
    signOutButton: {
        backgroundColor: `${colors.white}20`,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    signOutText: {
        color: colors.white,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing.md,
        gap: spacing.md,
    },
    statCard: {
        width: '48%',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.md,
    },
    statNumber: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.white,
        opacity: 0.9,
    },
    section: {
        padding: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.gray900,
        marginBottom: spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    actionIcon: {
        fontSize: 32,
        marginRight: spacing.md,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.gray900,
        marginBottom: spacing.xs,
    },
    actionDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
    },
    actionArrow: {
        fontSize: 32,
        color: colors.gray400,
        fontWeight: '300',
    },
});
