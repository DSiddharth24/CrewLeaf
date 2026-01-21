import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { getCurrentLocation } from '../../services/locationService';

export default function ReportIssueScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Equipment');
    const [priority, setPriority] = useState('Medium');

    const categories = ['Equipment', 'Irrigation', 'Pest', 'Safety', 'Other'];

    const handleSubmit = async () => {
        if (!description.trim()) {
            Alert.alert('Missing Info', 'Please describe the issue.');
            return;
        }

        try {
            setLoading(true);
            const userId = auth.currentUser?.uid;
            const location = await getCurrentLocation();

            await addDoc(collection(db, 'issues'), {
                reporterId: userId,
                description,
                category,
                priority,
                location: location,
                status: 'open',
                createdAt: serverTimestamp(),
            });

            Alert.alert('Reported', 'Issue has been reported to supervisors.');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to submit report.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Report Issue</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.chip, category === cat && styles.chipActive]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.label}>Severity</Text>
                <View style={styles.priorityRow}>
                    {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[
                                styles.priorityChip,
                                priority === p && styles.priorityActive,
                                priority === p && p === 'Critical' && { backgroundColor: colors.error },
                                priority === p && p === 'High' && { backgroundColor: colors.warning },
                            ]}
                            onPress={() => setPriority(p)}
                        >
                            <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={styles.inputArea}
                    placeholder="Describe the problem..."
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                />

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.submitText}>Submit Report</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        backgroundColor: colors.white,
        paddingTop: spacing.xxl * 1.2,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...shadows.sm,
    },
    backButton: { padding: spacing.sm },
    backText: { fontSize: 32, color: colors.gray900, lineHeight: 32 },
    headerTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray900 },
    content: { padding: spacing.lg },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: 'bold',
        color: colors.gray700,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    categoryRow: { flexDirection: 'row', marginBottom: spacing.md },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.white,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.gray300,
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: { color: colors.gray600, fontWeight: '600' },
    chipTextActive: { color: colors.white },
    priorityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    priorityChip: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray300,
    },
    priorityActive: {
        backgroundColor: colors.primary, // Default active
        borderColor: 'transparent',
    },
    priorityText: { color: colors.gray600, fontWeight: '600' },
    priorityTextActive: { color: colors.white },
    inputArea: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: typography.fontSize.md,
        height: 150,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.gray300,
    },
    submitButton: {
        backgroundColor: colors.error, // Red for issues usually
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.md,
    },
    submitText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: typography.fontSize.lg,
    },
});
