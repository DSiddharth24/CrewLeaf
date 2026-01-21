import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { Field } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function FieldManagementScreen() {
    const navigation = useNavigation();
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFields();
    }, []);

    const loadFields = async () => {
        // Real-time listener for fields
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const q = query(
            collection(db, 'fields'),
            where('managerId', '==', userId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fieldsData: Field[] = [];
            snapshot.forEach((doc) => {
                fieldsData.push({ id: doc.id, ...doc.data() } as Field);
            });
            setFields(fieldsData);
            setLoading(false);
        });

        return () => unsubscribe();
    };

    const handleAddField = () => {
        navigation.navigate('AddFieldMethod' as never);
    };

    const handleFieldPress = (field: Field) => {
        navigation.navigate('FieldDetails' as never, { fieldId: field.id } as never);
    };

    const renderFieldCard = ({ item }: { item: Field }) => (
        <TouchableOpacity
            style={styles.fieldCard}
            onPress={() => handleFieldPress(item)}
        >
            <View style={styles.fieldHeader}>
                <Text style={styles.fieldName}>{item.name}</Text>
                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor:
                                item.status === 'active' ? colors.success : colors.gray400,
                        },
                    ]}
                >
                    <Text style={styles.statusText}>
                        {item.status === 'active' ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            </View>

            <View style={styles.fieldInfo}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Crop:</Text>
                    <Text style={styles.infoValue}>{item.cropType}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Area:</Text>
                    <Text style={styles.infoValue}>
                        {(item.area / 4046.86).toFixed(2)} acres
                    </Text>
                </View>
            </View>

            <View style={styles.fieldFooter}>
                <Text style={styles.workersText}>👥 0 workers inside</Text>
                <Text style={styles.tasksText}>📋 0 active tasks</Text>
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
                <Text style={styles.title}>Field Management</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* Add Field Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddField}>
                <Text style={styles.addButtonText}>+ Add New Field</Text>
            </TouchableOpacity>

            {/* Fields List */}
            {fields.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🗺️</Text>
                    <Text style={styles.emptyTitle}>No Fields Yet</Text>
                    <Text style={styles.emptyText}>
                        Create your first field to start managing workers and tasks
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={fields}
                    renderItem={renderFieldCard}
                    keyExtractor={(item) => item.id}
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
    addButton: {
        backgroundColor: colors.accent,
        marginHorizontal: spacing.lg,
        marginTop: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.md,
    },
    addButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
    },
    listContent: {
        padding: spacing.lg,
    },
    fieldCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    fieldHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    fieldName: {
        fontSize: typography.fontSize.lg,
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
    },
    fieldInfo: {
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: spacing.xs,
    },
    infoLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
        width: 60,
    },
    infoValue: {
        fontSize: typography.fontSize.sm,
        color: colors.gray900,
        fontWeight: '500',
    },
    fieldFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    workersText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray700,
    },
    tasksText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray700,
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
