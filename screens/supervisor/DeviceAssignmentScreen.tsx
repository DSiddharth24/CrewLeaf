import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { deviceService, fieldService } from '../../services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function DeviceAssignmentScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [devices, setDevices] = useState<any[]>([]);
    const [fields, setFields] = useState<any[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<any>(null);
    const [selectedField, setSelectedField] = useState<any>(null);


    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [devRes, fieldRes] = await Promise.all([
                deviceService.getUnassignedDevices(),
                fieldService.getAllFields()
            ]);
            setDevices(devRes.data);
            setFields(fieldRes.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load devices or fields');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedDevice || !selectedField) {
            Alert.alert('Error', 'Please select both a device and a field');
            return;
        }

        setLoading(true);
        try {
            await deviceService.assignDevice({
                deviceId: selectedDevice.id,
                assignedFieldId: selectedField.id,
                assignedGateName: 'Main Gate' // Default for now
            });
            Alert.alert('Success', 'Device assigned successfully');
            loadData();
            setSelectedDevice(null);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Assignment failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Assign IoT Devices</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Select Unassigned Device</Text>
                {devices.length === 0 ? <Text style={styles.empty}>No new devices found</Text> : (
                    devices.map((dev: any) => (
                        <TouchableOpacity
                            key={dev.id}
                            style={[styles.item, selectedDevice?.id === dev.id && styles.selected]}
                            onPress={() => setSelectedDevice(dev)}
                        >
                            <Text style={styles.itemName}>Device ID: {dev.chipId}</Text>
                            <Text style={styles.itemSub}>{dev.model} - {dev.firmware}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Select Target Field</Text>
                {fields.map((field: any) => (
                    <TouchableOpacity
                        key={field.id}
                        style={[styles.item, selectedField?.id === field.id && styles.selected]}
                        onPress={() => setSelectedField(field)}
                    >
                        <Text style={styles.itemName}>{field.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.assignButton, (!selectedDevice || !selectedField) && styles.disabled]}
                onPress={handleAssign}
                disabled={loading || !selectedDevice || !selectedField}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.assignButtonText}>Finalize Assignment</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: colors.primary, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    backText: { color: '#fff', fontSize: 24, marginRight: 15 },
    title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    section: { padding: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.gray700, marginBottom: 15 },
    item: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.gray300 },
    selected: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
    itemName: { fontWeight: 'bold', fontSize: 16 },
    itemSub: { color: colors.gray600, fontSize: 12, marginTop: 4 },
    empty: { textAlign: 'center', color: colors.gray500, marginVertical: 20 },
    assignButton: { backgroundColor: colors.primary, margin: 20, padding: 18, borderRadius: 12, alignItems: 'center', ...shadows.md },
    assignButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    disabled: { opacity: 0.5 }
});
