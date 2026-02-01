import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { userService, fieldService } from '../../services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { UserRole } from '../../types';

export default function CreateUserScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [fields, setFields] = useState<any[]>([]);
    const [managers, setManagers] = useState<any[]>([]);

    const [form, setForm] = useState({
        name: '',
        phoneNumber: '',
        role: 'worker' as UserRole, // 'manager' or 'worker'
        assignedFieldId: '',
        managerId: '',
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [fieldsRes, managersRes] = await Promise.all([
                fieldService.getAllFields(),
                userService.getManagers(),
            ]);
            setFields(fieldsRes.data);
            setManagers(managersRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleCreate = async () => {
        if (!form.name || !form.phoneNumber || !form.role) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            await userService.createUser(form);
            Alert.alert('Success', 'User created successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || error.message);
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
                <Text style={styles.title}>Create New account</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={form.name}
                        onChangeText={(val) => setForm({ ...form, name: val })}
                        placeholder="Enter full name"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Phone Number *</Text>
                    <TextInput
                        style={styles.input}
                        value={form.phoneNumber}
                        onChangeText={(val) => setForm({ ...form, phoneNumber: val })}
                        placeholder="+91 1234567890"
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Role *</Text>
                    <View style={styles.roleContainer}>
                        {(['manager', 'worker'] as UserRole[]).map((role) => (
                            <TouchableOpacity
                                key={role}
                                style={[
                                    styles.roleButton,
                                    form.role === role && styles.roleButtonActive
                                ]}
                                onPress={() => setForm({ ...form, role })}
                            >

                                <Text style={[
                                    styles.roleButtonText,
                                    form.role === role && styles.roleButtonTextActive
                                ]}>
                                    {role.charAt(0) + role.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Assign to Field / Area</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                        {fields.map((field: any) => (
                            <TouchableOpacity
                                key={field.id}
                                style={[
                                    styles.chip,
                                    form.assignedFieldId === field.id && styles.chipActive
                                ]}
                                onPress={() => setForm({ ...form, assignedFieldId: field.id })}
                            >
                                <Text style={[
                                    styles.chipText,
                                    form.assignedFieldId === field.id && styles.chipTextActive
                                ]}>
                                    {field.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {form.role === 'worker' && (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Assign to Manager</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                            {managers.map((manager: any) => (
                                <TouchableOpacity
                                    key={manager.id}
                                    style={[
                                        styles.chip,
                                        form.managerId === manager.id && styles.chipActive
                                    ]}
                                    onPress={() => setForm({ ...form, managerId: manager.id })}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        form.managerId === manager.id && styles.chipTextActive
                                    ]}>
                                        {manager.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color={colors.white} /> : (
                        <Text style={styles.submitButtonText}>Create User Account</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
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
    },
    backText: {
        color: colors.white,
        fontSize: typography.fontSize.xl,
        marginRight: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.white,
    },
    form: {
        padding: spacing.lg,
    },
    inputContainer: {
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray300,
        padding: spacing.md,
        fontSize: typography.fontSize.md,
    },
    roleContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    roleButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray300,
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    roleButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    roleButtonText: {
        fontWeight: '600',
        color: colors.gray700,
    },
    roleButtonTextActive: {
        color: colors.white,
    },
    chipContainer: {
        flexDirection: 'row',
    },
    chip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.gray300,
        marginRight: spacing.sm,
        backgroundColor: colors.white,
    },
    chipActive: {
        backgroundColor: colors.primary + '20',
        borderColor: colors.primary,
    },
    chipText: {
        color: colors.gray700,
        fontSize: typography.fontSize.sm,
    },
    chipTextActive: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        marginTop: spacing.xl,
        ...shadows.md,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
    },
});
