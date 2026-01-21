import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function TaskOutputScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { taskId, taskName } = route.params as { taskId: string; taskName: string };

    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('kg');
    const [notes, setNotes] = useState('');

    const units = ['kg', 'liters', 'crates', 'units', 'rows'];

    const handleSubmit = async () => {
        if (!quantity || isNaN(Number(quantity))) {
            Alert.alert('Invalid Input', 'Please enter a valid numeric quantity.');
            return;
        }

        try {
            setLoading(true);
            const userId = auth.currentUser?.uid;

            // 1. Log the output
            await addDoc(collection(db, 'task_outputs'), {
                taskId,
                workerId: userId,
                quantity: Number(quantity),
                unit,
                notes,
                status: 'pending_verification',
                createdAt: serverTimestamp(),
            });

            // 2. Ideally, update task progress too.
            // For now, we assume this action marks a contribution.
            Alert.alert('Success', 'Work output logged successfully!');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to log output.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Log Work Output</Text>
                    <Text style={styles.headerSub}>{taskName}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.label}>Quantity Produced</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.mainInput}
                            placeholder="00"
                            keyboardType="numeric"
                            value={quantity}
                            onChangeText={setQuantity}
                            placeholderTextColor={colors.gray300}
                        />
                        <View style={styles.unitSelector}>
                            <Text style={styles.unitTextLabel}>Unit:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {units.map(u => (
                                    <TouchableOpacity
                                        key={u}
                                        style={[styles.unitChip, unit === u && styles.unitActive]}
                                        onPress={() => setUnit(u)}
                                    >
                                        <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>{u}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Notes (Optional)</Text>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="e.g. Broken crates, heavy rain..."
                        multiline
                        value={notes}
                        onChangeText={setNotes}
                        placeholderTextColor={colors.gray400}
                    />
                </View>

                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitText}>Submit Work</Text>}
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        backgroundColor: colors.primary,
        paddingTop: spacing.xxl * 1.2,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: borderRadius.xl,
        borderBottomRightRadius: borderRadius.xl,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.md,
    },
    backBtn: { marginRight: spacing.md },
    backText: { color: colors.white, fontSize: 32, marginTop: -4 },
    headerTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.white },
    headerSub: { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.8)' },
    content: { padding: spacing.lg },
    card: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: 'bold',
        color: colors.gray600,
        marginBottom: spacing.md,
        textTransform: 'uppercase',
    },
    inputRow: {
        gap: spacing.md,
    },
    mainInput: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.primary,
        borderBottomWidth: 2,
        borderBottomColor: colors.gray200,
        paddingVertical: spacing.sm,
        textAlign: 'center',
    },
    unitSelector: {
        marginTop: spacing.md,
    },
    unitTextLabel: { fontSize: 12, color: colors.gray500, marginBottom: 8 },
    unitChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.full,
        marginRight: 8,
    },
    unitActive: { backgroundColor: colors.accent },
    unitText: { color: colors.gray600, fontWeight: '600' },
    unitTextActive: { color: colors.white },
    notesInput: {
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        height: 100,
        textAlignVertical: 'top',
    },
    submitBtn: {
        backgroundColor: colors.primary,
        padding: spacing.lg,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        ...shadows.lg,
        marginTop: spacing.md,
    },
    submitText: {
        color: colors.white,
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
    },
});
