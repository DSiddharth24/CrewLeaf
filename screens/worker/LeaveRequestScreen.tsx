import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function LeaveRequestScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [leaveType, setLeaveType] = useState('Sick Leave');
    const [reason, setReason] = useState('');

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const leaveTypes = ['Sick Leave', 'Casual Leave', 'Emergency', 'Other'];

    const handleSubmit = async () => {
        if (!reason) {
            Alert.alert('Missing Info', 'Please provide a reason.');
            return;
        }

        try {
            setLoading(true);
            const userId = auth.currentUser?.uid;

            await addDoc(collection(db, 'leave_requests'), {
                workerId: userId,
                type: leaveType,
                startDate: startDate,
                endDate: endDate,
                reason,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            Alert.alert('Submitted', 'Your leave request has been sent for approval.');
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', 'Failed to submit request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Request Leave</Text>
                <View style={{ width: 20 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.label}>Leave Type</Text>
                <View style={styles.typeRow}>
                    {leaveTypes.map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.typeChip, leaveType === t && styles.typeActive]}
                            onPress={() => setLeaveType(t)}
                        >
                            <Text style={[styles.typeText, leaveType === t && styles.typeTextActive]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Dates</Text>
                <View style={styles.dateRow}>
                    <View style={styles.dateBox}>
                        <Text style={styles.dateLabel}>From</Text>
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStartPicker(true)}>
                            <Text style={styles.dateVal}>{startDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.toArrow}>→</Text>
                    <View style={styles.dateBox}>
                        <Text style={styles.dateLabel}>To</Text>
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEndPicker(true)}>
                            <Text style={styles.dateVal}>{endDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {showStartPicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display="default"
                        onChange={(e, d) => { setShowStartPicker(false); if (d) setStartDate(d); }}
                    />
                )}
                {showEndPicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display="default"
                        onChange={(e, d) => { setShowEndPicker(false); if (d) setEndDate(d); }}
                    />
                )}

                <Text style={styles.label}>Reason</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Why do you need leave?"
                    multiline
                    value={reason}
                    onChangeText={setReason}
                />

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                    <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Send Request'}</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        backgroundColor: colors.primary,
        paddingTop: spacing.xxl,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...shadows.md,
    },
    back: { color: colors.white, fontSize: 32 },
    title: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
    content: { padding: spacing.lg },
    label: { fontSize: 14, fontWeight: 'bold', color: colors.gray700, marginBottom: 8, marginTop: 16 },
    typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    typeChip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray300
    },
    typeActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    typeText: { color: colors.gray700 },
    typeTextActive: { color: colors.white, fontWeight: 'bold' },
    dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    dateBox: { flex: 1 },
    dateLabel: { fontSize: 12, color: colors.gray500, marginBottom: 4 },
    dateBtn: { backgroundColor: colors.white, padding: 12, borderRadius: 8, ...shadows.sm },
    dateVal: { fontSize: 16, color: colors.gray900 },
    toArrow: { fontSize: 24, color: colors.gray400, marginHorizontal: 12 },
    input: {
        backgroundColor: colors.white, padding: 16, borderRadius: 12,
        height: 120, textAlignVertical: 'top', fontSize: 16, ...shadows.sm
    },
    submitBtn: {
        backgroundColor: colors.primary, padding: 16, borderRadius: 12,
        alignItems: 'center', marginTop: 32, ...shadows.md
    },
    submitText: { color: colors.white, fontSize: 18, fontWeight: 'bold' }
});
