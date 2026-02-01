import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../config/firebase';
import { attendanceService, userService } from '../../services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function WorkerHome() {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [profileRes, attendanceRes] = await Promise.all([
                userService.getProfile(),
                attendanceService.getLogs({ limit: 10 })
            ]);
            setProfile(profileRes.data);
            setAttendanceLogs(attendanceRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleSignOut = async () => {
        await auth.signOut();
        navigation.navigate('Splash' as never);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{profile?.name?.charAt(0) || 'W'}</Text>
                    </View>
                    <View>
                        <Text style={styles.greeting}>Worker Dashboard</Text>
                        <Text style={styles.userName}>{profile?.name || 'Loading...'}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Status Section */}
                <View style={styles.statusCard}>
                    <Text style={styles.statusLabel}>Current Status</Text>
                    <Text style={styles.statusValue}>RFID Card System Enabled</Text>
                    <Text style={styles.statusDesc}>
                        Scan your card at the field gates to mark attendance automatically.
                    </Text>
                </View>

                {/* Profile Section */}
                <View style={styles.profileBox}>
                    <Text style={styles.sectionTitle}>Employment Details</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Field/Area:</Text>
                        <Text style={styles.detailValue}>{profile?.assignedFieldId || 'General'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Phone:</Text>
                        <Text style={styles.detailValue}>{profile?.phoneNumber}</Text>
                    </View>
                </View>

                {/* Attendance History */}
                <Text style={styles.sectionTitle}>Recent Attendance</Text>
                {loading ? <ActivityIndicator color={colors.primary} /> : (
                    attendanceLogs.length === 0 ? (
                        <Text style={styles.emptyText}>No recent scans found</Text>
                    ) : (
                        attendanceLogs.map((log: any) => (
                            <View key={log.id} style={styles.historyCard}>
                                <View>
                                    <Text style={styles.logField}>{log.fieldId}</Text>
                                    <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</Text>
                                </View>
                                <Text style={styles.logStatus}>Present</Text>
                            </View>
                        ))
                    )
                )}

                <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => Alert.alert('History', 'Full history coming soon')}
                >
                    <Text style={styles.historyButtonText}>View Full Work History</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: colors.white, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...shadows.sm },
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 45, height: 45, borderRadius: 25, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
    greeting: { fontSize: 14, color: colors.gray600 },
    userName: { fontSize: 18, fontWeight: 'bold', color: colors.gray900 },
    signOutText: { color: colors.error, fontWeight: 'bold' },
    content: { padding: 20 },
    statusCard: { backgroundColor: colors.primary, padding: 25, borderRadius: 20, marginBottom: 25, ...shadows.lg },
    statusLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 5 },
    statusValue: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    statusDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 18 },
    profileBox: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 25, ...shadows.sm },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.gray900, marginBottom: 15 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    detailLabel: { color: colors.gray600 },
    detailValue: { fontWeight: '600', color: colors.gray800 },
    historyCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.gray200 },
    logField: { fontWeight: 'bold', color: colors.gray800 },
    logTime: { fontSize: 12, color: colors.gray500, marginTop: 4 },
    logStatus: { color: colors.success, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', color: colors.gray500, marginVertical: 20 },
    historyButton: { marginTop: 10, padding: 15, alignItems: 'center' },
    historyButtonText: { color: colors.primary, fontWeight: 'bold' }
});
