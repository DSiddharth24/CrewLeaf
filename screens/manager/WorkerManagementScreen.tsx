import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { User } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function WorkerManagementScreen() {
    const navigation = useNavigation();
    const [workers, setWorkers] = useState<User[]>([]);
    const [searchText, setSearchText] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        loadWorkers();
    }, []);

    const loadWorkers = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const q = query(
            collection(db, 'users'),
            where('role', '==', 'worker'),
            where('managerId', '==', userId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const workersData: User[] = [];
            snapshot.forEach((doc) => {
                workersData.push({ uid: doc.id, ...doc.data() } as User);
            });
            setWorkers(workersData);
        });

        return () => unsubscribe();
    };

    const filteredWorkers = workers.filter((worker) =>
        worker.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderWorkerCard = ({ item }: { item: User }) => (
        <TouchableOpacity style={styles.workerCard}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                </Text>
            </View>

            <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{item.name}</Text>
                <Text style={styles.workerEmail}>{item.email}</Text>
                {item.rfidCardId && (
                    <Text style={styles.cardId}>Card: {item.rfidCardId}</Text>
                )}
            </View>

            <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: colors.gray400 }]} />
                <Text style={styles.statusText}>Offline</Text>
            </View>
        </TouchableOpacity>
    );

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
                <Text style={styles.title}>Worker Management</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)}>
                    <Text style={styles.addText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search workers..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {/* Stats */}
            <View style={styles.stats}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{workers.length}</Text>
                    <Text style={styles.statLabel}>Total Workers</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>0</Text>
                    <Text style={styles.statLabel}>Present Today</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>0</Text>
                    <Text style={styles.statLabel}>On Task</Text>
                </View>
            </View>

            {/* Workers List */}
            {filteredWorkers.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>👥</Text>
                    <Text style={styles.emptyTitle}>No Workers Found</Text>
                    <Text style={styles.emptyText}>
                        {searchText ? 'Try a different search' : 'Add workers to get started'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredWorkers}
                    renderItem={renderWorkerCard}
                    keyExtractor={(item) => item.uid}
                    contentContainerStyle={styles.listContent}
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
    searchContainer: {
        padding: spacing.lg,
    },
    searchInput: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: typography.fontSize.md,
        ...shadows.sm,
    },
    stats: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    statItem: {
        flex: 1,
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginRight: spacing.sm,
        alignItems: 'center',
        ...shadows.sm,
    },
    statNumber: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.primary,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    listContent: {
        padding: spacing.lg,
    },
    workerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.white,
    },
    workerInfo: {
        flex: 1,
    },
    workerName: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.gray900,
    },
    workerEmail: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
        marginTop: spacing.xs,
    },
    cardId: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        marginTop: spacing.xs,
    },
    statusIndicator: {
        alignItems: 'center',
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: borderRadius.full,
        marginBottom: spacing.xs,
    },
    statusText: {
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
