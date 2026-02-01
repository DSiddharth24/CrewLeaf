import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '../types';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface RoleOption {
    role: UserRole;
    icon: string;
    description: string;
}

const ROLES: RoleOption[] = [
    {
        role: 'manager',
        icon: '👨‍💼',
        description: 'Manage fields, workers, tasks, and payments',
    },
    {
        role: 'supervisor',
        icon: '👷',
        description: 'Monitor field activities and verify attendance',
    },
    {
        role: 'worker',
        icon: '👨‍🌾',
        description: 'Check in, complete tasks, and track wages',
    },
];

export default function RoleSelectionScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [scaleAnims] = useState(
        ROLES.map(() => new Animated.Value(1))
    );

    const handleRoleSelect = (role: UserRole, index: number) => {
        setSelectedRole(role);

        // Animate selection
        Animated.sequence([
            Animated.timing(scaleAnims[index], {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnims[index], {
                toValue: 1,
                tension: 50,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleContinue = async () => {
        if (selectedRole) {
            await AsyncStorage.setItem('user-role', selectedRole);
            (navigation.navigate as any)('Auth', { role: selectedRole });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('common.selectRole')}</Text>
                <Text style={styles.subtitle}>{t('common.selectRole')}</Text>
            </View>

            <ScrollView
                style={styles.roleList}
                contentContainerStyle={styles.roleListContent}
                showsVerticalScrollIndicator={false}
            >
                {ROLES.map((roleOption, index) => (
                    <Animated.View
                        key={roleOption.role}
                        style={{ transform: [{ scale: scaleAnims[index] }] }}
                    >
                        <TouchableOpacity
                            style={[
                                styles.roleCard,
                                selectedRole === roleOption.role && styles.roleCardSelected,
                            ]}
                            onPress={() => handleRoleSelect(roleOption.role, index)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.roleIcon}>{roleOption.icon}</Text>
                            <View style={styles.roleInfo}>
                                <Text style={styles.roleName}>
                                    {t(`roles.${roleOption.role}`)}
                                </Text>
                                <Text style={styles.roleDescription}>
                                    {t(`roles.${roleOption.role}Desc`)}
                                </Text>
                            </View>
                            {selectedRole === roleOption.role && (
                                <View style={styles.checkmark}>
                                    <Text style={styles.checkmarkText}>✓</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={[
                    styles.continueButton,
                    !selectedRole && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={!selectedRole}
                activeOpacity={0.8}
            >
                <Text style={styles.continueButtonText}>{t('common.continue')}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: spacing.xxl * 2,
    },
    header: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: colors.gray600,
    },
    roleList: {
        flex: 1,
    },
    roleListContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 2,
        borderColor: colors.gray200,
        ...shadows.md,
    },
    roleCardSelected: {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}10`,
    },
    roleIcon: {
        fontSize: 48,
        marginRight: spacing.md,
    },
    roleInfo: {
        flex: 1,
    },
    roleName: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.gray900,
        marginBottom: spacing.xs,
    },
    roleDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
    },
    checkmark: {
        width: 30,
        height: 30,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: colors.white,
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
    },
    continueButton: {
        backgroundColor: colors.primary,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.lg,
    },
    continueButtonDisabled: {
        backgroundColor: colors.gray400,
    },
    continueButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
    },
});
