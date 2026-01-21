import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface Alert {
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    time: string;
}

export default function AlertsScreen() {
    const navigation = useNavigation();

    // Mock alerts
    const [alerts] = useState<Alert[]>([
        {
            id: '1',
            type: 'error',
            title: 'Worker Left Field Early',
            message: 'Worker #ABC123 left Field A at 3:45 PM, 1 hour before shift end',
            time: '10 mins ago',
        },
        {
            id: '2',
            type: 'warning',
            title: 'Task Overdue',
            message: 'Task "Harvest Section B" was due yesterday and is still in progress',
            time: '1 hour ago',
        },
        {
            id: '3',
            type: 'info',
            title: 'GPS Mismatch',
            message: 'Worker check-in location does not match assigned field',
            time: '2 hours ago',
        },
        {
            id: '4',
            type: 'warning',
            title: 'Low Attendance',
            message: 'Only 60% attendance recorded today for Field C',
            time: '3 hours ago',
        },
    ]);

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'error':
                return colors.error;
            case 'warning':
                return colors.warning;
            case 'info':
                return colors.info;
            default:
                return colors.gray500;
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'error':
                return '🚨';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '📢';
        }
    };

    const renderAlertCard = ({ item }: { item: Alert }) => (
        <TouchableOpacity style={styles.alertCard}>
            <View style={[styles.alertIndicator, { backgroundColor: getAlertColor(item.type) }]} />

            <View style={styles.alertContent}>
                <View style={styles.alertHeader}>
                    <Text style={styles.alertIcon}>{getAlertIcon(item.type)}</Text>
                    <View style={styles.alertTitleContainer}>
                        <Text style={styles.alertTitle}>{item.title}</Text>
                        <Text style={styles.alertTime}>{item.time}</Text>
                    </View>
                </View>

                <Text style={styles.alertMessage}>{item.message}</Text>

                <View style={styles.alertActions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.dismissButton]}>
                        <Text style={[styles.actionButtonText, { color: colors.gray600 }]}>Dismiss</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Alerts & Issues</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* Summary */}
            <View style={styles.summary}>
                <View style={[styles.summaryItem, { backgroundColor: colors.error + '20' }]}>
                    <Text style={styles.summaryNumber}>1</Text>
                    <Text style={styles.summaryLabel}>Critical</Text>
                </View>
                <View style={[styles.summaryItem, { backgroundColor: colors.warning + '20' }]}>
                    <Text style={styles.summaryNumber}>2</Text>
                    <Text style={styles.summaryLabel}>Warnings</Text>
                </View>
                <View style={[styles.summaryItem, { backgroundColor: colors.info + '20' }]}>
                    <Text style={styles.summaryNumber}>1</Text>
                    <Text style={styles.summaryLabel}>Info</Text>
                </View>
            </View>

            {/* Alerts List */}
            <FlatList
                data={alerts}
                renderItem={renderAlertCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
    summary: {
        flexDirection: 'row',
        padding: spacing.lg,
        gap: spacing.md,
    },
    summaryItem: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    summaryNumber: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.gray900,
        marginBottom: spacing.xs,
    },
    summaryLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray700,
    },
    listContent: {
        padding: spacing.lg,
    },
    alertCard: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
        ...shadows.md,
    },
    alertIndicator: {
        width: 4,
    },
    alertContent: {
        flex: 1,
        padding: spacing.md,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    alertIcon: {
        fontSize: 24,
        marginRight: spacing.sm,
    },
    alertTitleContainer: {
        flex: 1,
    },
    alertTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.gray900,
        marginBottom: spacing.xs,
    },
    alertTime: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    alertMessage: {
        fontSize: typography.fontSize.sm,
        color: colors.gray700,
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    alertActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary,
    },
    dismissButton: {
        backgroundColor: colors.gray200,
    },
    actionButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.white,
    },
});
