import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { Wage } from '../../types';
import { payWage, paiseToRupees } from '../../services/paymentService';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function WageManagementScreen() {
    const navigation = useNavigation();
    const [wages, setWages] = useState<Wage[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);

    useEffect(() => {
        loadWages();
    }, []);

    const loadWages = async () => {
        // Load wages for all workers under this manager
        const q = query(
            collection(db, 'wages'),
            where('paymentStatus', '==', 'pending'),
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const wagesData: Wage[] = [];
            snapshot.forEach((doc) => {
                wagesData.push({ id: doc.id, ...doc.data() } as Wage);
            });
            setWages(wagesData);
        });

        return () => unsubscribe();
    };

    const toggleWorkerSelection = (wageId: string) => {
        setSelectedWorkers((prev) =>
            prev.includes(wageId) ? prev.filter((id) => id !== wageId) : [...prev, wageId]
        );
    };

    const calculateTotalPending = () => {
        return wages
            .filter((w) => selectedWorkers.includes(w.id))
            .reduce((sum, wage) => sum + wage.calculatedWage, 0);
    };

    const handlePaySelected = async () => {
        if (selectedWorkers.length === 0) {
            Alert.alert('Error', 'Please select at least one worker to pay');
            return;
        }

        const totalAmount = calculateTotalPending();

        Alert.alert(
            'Confirm Payment',
            `Pay ₹${totalAmount.toFixed(2)} to ${selectedWorkers.length} worker(s)?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Pay Now',
                    onPress: () => processPayments(),
                },
            ]
        );
    };

    const processPayments = async () => {
        setLoading(true);
        try {
            const selectedWages = wages.filter((w) => selectedWorkers.includes(w.id));

            for (const wage of selectedWages) {
                // Initiate payment via Razorpay
                const payment = await payWage(
                    `Worker #${wage.workerId.slice(-6)}`,
                    wage.calculatedWage,
                    wage.workerId
                );

                // Update wage record with transaction ID
                // (This would update Firestore with transaction ID)
                console.log('Payment successful:', payment.razorpay_payment_id);
            }

            Alert.alert('Success', 'Payments processed successfully!');
            setSelectedWorkers([]);
        } catch (error: any) {
            Alert.alert('Payment Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderWageCard = ({ item }: { item: Wage }) => {
        const isSelected = selectedWorkers.includes(item.id);

        return (
            <TouchableOpacity
                style={[styles.wageCard, isSelected && styles.selectedCard]}
                onPress={() => toggleWorkerSelection(item.id)}
            >
                <View style={styles.checkbox}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>

                <View style={styles.wageContent}>
                    <Text style={styles.workerName}>Worker #{item.workerId.slice(-6)}</Text>

                    <View style={styles.wageDetails}>
                        <Text style={styles.detailText}>
                            📅 {item.date.toDate ? item.date.toDate().toLocaleDateString() : 'N/A'}
                        </Text>
                        <Text style={styles.detailText}>⏱️ {item.hoursWorked.toFixed(1)} hours</Text>
                        <Text style={styles.detailText}>📦 Output: {item.outputQuantity} units</Text>
                    </View>
                </View>

                <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Wage</Text>
                    <Text style={styles.amountValue}>₹{item.calculatedWage.toFixed(2)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Wage & Payments</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* Summary */}
            <View style={styles.summary}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Pending</Text>
                    <Text style={styles.summaryValue}>
                        ₹{wages.reduce((sum, w) => sum + w.calculatedWage, 0).toFixed(2)}
                    </Text>
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Selected</Text>
                    <Text style={styles.summaryValue}>₹{calculateTotalPending().toFixed(2)}</Text>
                </View>
            </View>

            {/* Wages List */}
            {wages.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>💰</Text>
                    <Text style={styles.emptyTitle}>No Pending Wages</Text>
                    <Text style={styles.emptyText}>All wages are up to date!</Text>
                </View>
            ) : (
                <FlatList
                    data={wages}
                    renderItem={renderWageCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Pay Button */}
            {selectedWorkers.length > 0 && (
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.payButton}
                        onPress={handlePaySelected}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <>
                                <Text style={styles.payButtonText}>
                                    Pay {selectedWorkers.length} Worker{selectedWorkers.length > 1 ? 's' : ''}
                                </Text>
                                <Text style={styles.payButtonAmount}>
                                    ₹{calculateTotalPending().toFixed(2)}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
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
    summary: {
        flexDirection: 'row',
        padding: spacing.lg,
        gap: spacing.md,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.md,
    },
    summaryLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
        marginBottom: spacing.xs,
    },
    summaryValue: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.primary,
    },
    listContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl * 3,
    },
    wageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    selectedCard: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: borderRadius.sm,
        borderWidth: 2,
        borderColor: colors.gray400,
        marginRight: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmark: {
        color: colors.primary,
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
    },
    wageContent: {
        flex: 1,
    },
    workerName: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.gray900,
        marginBottom: spacing.sm,
    },
    wageDetails: {
        gap: spacing.xs,
    },
    detailText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amountLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
        marginBottom: spacing.xs,
    },
    amountValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.success,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
        ...shadows.lg,
    },
    payButton: {
        backgroundColor: colors.success,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    payButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
    },
    payButtonAmount: {
        color: colors.white,
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
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
