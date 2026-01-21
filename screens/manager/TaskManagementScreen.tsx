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
import { Task } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function TaskManagementScreen() {
    const navigation = useNavigation();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    useEffect(() => {
        loadTasks();
    }, [filter]);

    const loadTasks = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        let q = query(
            collection(db, 'tasks'),
            where('managerId', '==', userId),
            orderBy('startTime', 'desc')
        );

        if (filter === 'active') {
            q = query(
                collection(db, 'tasks'),
                where('managerId', '==', userId),
                where('status', 'in', ['pending', 'active']),
                orderBy('startTime', 'desc')
            );
        } else if (filter === 'completed') {
            q = query(
                collection(db, 'tasks'),
                where('managerId', '==', userId),
                where('status', '==', 'completed'),
                orderBy('startTime', 'desc')
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData: Task[] = [];
            snapshot.forEach((doc) => {
                tasksData.push({ id: doc.id, ...doc.data() } as Task);
            });
            setTasks(tasksData);
        });

        return () => unsubscribe();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTasks();
        setRefreshing(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return colors.success;
            case 'active':
                return colors.primary;
            case 'delayed':
                return colors.error;
            default:
                return colors.warning;
        }
    };

    const renderTaskCard = ({ item }: { item: Task }) => (
        <TouchableOpacity
            style={styles.taskCard}
            onPress={() => (navigation.navigate as any)('TaskDetails', { taskId: item.id })}
        >
            <View style={styles.taskHeader}>
                <Text style={styles.taskName}>{item.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.taskInfo}>
                <Text style={styles.infoText}>📋 {item.type}</Text>
                <Text style={styles.infoText}>
                    👥 {item.assignedWorkers.length} worker{item.assignedWorkers.length !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.infoText}>⏱️ Progress: {item.progress}%</Text>
            </View>

            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
            </View>

            <View style={styles.taskFooter}>
                <Text style={styles.dateText}>
                    Deadline: {item.deadline.toDate ? item.deadline.toDate().toLocaleDateString() : 'N/A'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Task Management</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CreateTask' as never)}>
                    <Text style={styles.addText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabs}>
                <TouchableOpacity
                    style={[styles.tab, filter === 'all' && styles.activeTab]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.tabText, filter === 'all' && styles.activeTabText]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, filter === 'active' && styles.activeTab]}
                    onPress={() => setFilter('active')}
                >
                    <Text style={[styles.tabText, filter === 'active' && styles.activeTabText]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, filter === 'completed' && styles.activeTab]}
                    onPress={() => setFilter('completed')}
                >
                    <Text style={[styles.tabText, filter === 'completed' && styles.activeTabText]}>
                        Completed
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tasks List */}
            {tasks.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={styles.emptyTitle}>No Tasks Found</Text>
                    <Text style={styles.emptyText}>Create your first task to assign work</Text>
                </View>
            ) : (
                <FlatList
                    data={tasks}
                    renderItem={renderTaskCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
    addText: {
        color: colors.white,
        fontSize: typography.fontSize.md,
        fontWeight: '600',
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
    taskCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    taskName: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.gray900,
        flex: 1,
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
        textTransform: 'capitalize',
    },
    taskInfo: {
        marginBottom: spacing.md,
        gap: spacing.xs,
    },
    infoText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray700,
    },
    progressBar: {
        height: 6,
        backgroundColor: colors.gray200,
        borderRadius: borderRadius.full,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
    },
    taskFooter: {
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
        paddingTop: spacing.sm,
    },
    dateText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
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
