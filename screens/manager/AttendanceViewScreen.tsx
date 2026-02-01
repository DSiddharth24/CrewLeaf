import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { attendanceService } from '../../services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function AttendanceViewScreen() {
    const navigation = useNavigation();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAttendance();
    }, []);

    const loadAttendance = async () => {
        try {
            setLoading(true);
            const response = await attendanceService.getLogs({});
            setAttendanceRecords(response.data);
        } catch (error) {
            console.error('Error loading attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAttendance();
        setRefreshing(false);
    };

    const renderAttendanceCard = ({ item }: { item: any }) => (
        <View style={styles.attendanceCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.workerName}>{item.workerName || 'Worker'}</Text>
                <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.label}>Field: <Text style={styles.value}>{item.fieldId}</Text></Text>
                <Text style={styles.label}>Date: <Text style={styles.value}>{new Date(item.timestamp).toLocaleDateString()}</Text></Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Live Attendance</Text>
            </View>

            {loading ? <ActivityIndicator style={{ marginTop: 50 }} color={colors.primary} /> : (
                <FlatList
                    data={attendanceRecords}
                    renderItem={renderAttendanceCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>No attendance records found</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: colors.primary, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    backText: { color: '#fff', fontSize: 24, marginRight: 15 },
    title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    listContent: { padding: 20 },
    attendanceCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, ...shadows.sm },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.gray100, paddingBottom: 8 },
    workerName: { fontWeight: 'bold', fontSize: 16, color: colors.gray900 },
    timestamp: { color: colors.primary, fontWeight: '600' },
    cardInfo: { gap: 4 },
    label: { fontSize: 13, color: colors.gray600 },
    value: { color: colors.gray800, fontWeight: '600' },
    emptyText: { textAlign: 'center', marginTop: 50, color: colors.gray500 }
});
