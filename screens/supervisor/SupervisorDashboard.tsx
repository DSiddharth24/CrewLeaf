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
import { auth } from '../../config/firebase';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function SupervisorDashboard() {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        assignedWorkers: 8,
        pendingTasks: 3,
        issuesReported: 1,
    });

    const onRefresh = async () => {
        setRefreshing(true);
        // Simulate reload
        setTimeout(() => setRefreshing(false), 1000);
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
                    <Text style={styles.greeting}>Field Supervisor</Text>
                    <Text style={styles.userName}>Dashboard</Text>
                </View>
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Status Cards */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
                        <Text style={styles.statNumber}>{stats.assignedWorkers}</Text>
                        <Text style={styles.statLabel}>My Workers</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.accent }]}>
                        <Text style={styles.statNumber}>{stats.pendingTasks}</Text>
                        <Text style={styles.statLabel}>Pending Tasks</Text>
                    </View>
                </View>

                {/* Action Menu */}
                <Text style={styles.sectionTitle}>Daily Operations</Text>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('AttendanceVerification' as never)}
                >
                    <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={styles.icon}>📋</Text>
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>Take Attendance</Text>
                        <Text style={styles.actionDesc}>Mark worker check-ins/outs</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('SupervisorTaskVerification' as never)}
                >
                    <View style={[styles.iconBox, { backgroundColor: colors.success + '20' }]}>
                        <Text style={styles.icon}>✅</Text>
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>Verify Tasks</Text>
                        <Text style={styles.actionDesc}>Inspect completed work</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <View style={[styles.iconBox, { backgroundColor: colors.warning + '20' }]}>
                        <Text style={styles.icon}>📢</Text>
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>Report Issue</Text>
                        <Text style={styles.actionDesc}>Log field problems</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
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
        backgroundColor: colors.secondary,
        paddingTop: spacing.xxl * 2,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: typography.fontSize.sm,
        color: colors.white,
        opacity: 0.9,
    },
    userName: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.white,
    },
    signOutButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    signOutText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: typography.fontSize.sm,
    },
    content: {
        padding: spacing.lg,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    statNumber: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.white,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.white,
        opacity: 0.9,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
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
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    icon: {
        fontSize: 24,
    },
    actionInfo: {
        flex: 1,
    },
    actionTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.gray900,
    },
    actionDesc: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
    },
    arrow: {
        fontSize: 24,
        color: colors.gray400,
    },
});
