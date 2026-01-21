import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../config/firebase'; // Adjust path if needed
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [language, setLanguage] = useState('English');

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Splash' as never }],
            });
        } catch (error) {
            console.error(error);
        }
    };

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionContent}>{children}</View>
        </View>
    );

    const SettingItem = ({
        label,
        value,
        onPress,
        rightElement
    }: {
        label: string;
        value?: string;
        onPress?: () => void;
        rightElement?: React.ReactNode;
    }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.itemLabel}>{label}</Text>
            <View style={styles.itemRight}>
                {value && <Text style={styles.itemValue}>{value}</Text>}
                {rightElement}
                {onPress && !rightElement && <Text style={styles.arrow}>›</Text>}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings & Permissions</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>

                <Section title="General">
                    <SettingItem
                        label="Language"
                        value={language}
                        onPress={() => Alert.alert('Coming Soon', 'Language selection will be here.')}
                    />
                    <SettingItem
                        label="Profile"
                        onPress={() => Alert.alert('Profile', 'Edit Profile coming soon')}
                    />
                </Section>

                <Section title="Notifications">
                    <SettingItem
                        label="Push Notifications"
                        rightElement={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: colors.gray300, true: colors.primary }}
                            />
                        }
                    />
                    <SettingItem
                        label="Sound & Vibration"
                        rightElement={
                            <Switch
                                value={soundEnabled}
                                onValueChange={setSoundEnabled}
                                trackColor={{ false: colors.gray300, true: colors.primary }}
                            />
                        }
                    />
                </Section>

                <Section title="Administration">
                    <SettingItem
                        label="Manage Roles & Permissions"
                        onPress={() => Alert.alert("Admin", "Manage staff permissions here.")}
                    />
                    <SettingItem
                        label="Export Data Reports"
                        onPress={() => Alert.alert("Export", "CSV/PDF Export started...")}
                    />
                </Section>

                <Section title="About">
                    <SettingItem label="Version" value="1.0.0" />
                    <SettingItem label="Terms of Service" onPress={() => { }} />
                    <SettingItem label="Privacy Policy" onPress={() => { }} />
                </Section>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.footerText}>CrewLeaf Mobile App</Text>

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
    backBtn: { padding: spacing.sm },
    backText: { fontSize: 32, color: colors.gray900, lineHeight: 32 },
    headerTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.gray900 },
    scroll: { padding: spacing.lg },
    section: { marginBottom: spacing.xl },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: 'bold',
        color: colors.gray500,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    sectionContent: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        ...shadows.sm,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    itemLabel: { fontSize: 16, color: colors.gray900 },
    itemRight: { flexDirection: 'row', alignItems: 'center' },
    itemValue: { fontSize: 14, color: colors.gray500, marginRight: 8 },
    arrow: { fontSize: 20, color: colors.gray400 },
    logoutBtn: {
        backgroundColor: colors.error + '15', // Light red bg
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    logoutText: { color: colors.error, fontWeight: 'bold', fontSize: 16 },
    footerText: { textAlign: 'center', marginVertical: spacing.xl, color: colors.gray400, fontSize: 12 }
});
