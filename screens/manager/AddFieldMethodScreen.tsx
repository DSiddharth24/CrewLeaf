import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface MethodOption {
    id: string;
    title: string;
    description: string;
    icon: string;
    route: string;
}

const METHODS: MethodOption[] = [
    {
        id: 'draw',
        title: 'Draw on Map',
        description: 'Draw field boundaries on an interactive map',
        icon: '✏️',
        route: 'DrawFieldMap',
    },
    {
        id: 'walk',
        title: 'Walk & Mark',
        description: 'Walk around the field perimeter with GPS tracking',
        icon: '🚶',
        route: 'WalkFieldBoundary',
    },
    {
        id: 'manual',
        title: 'Manual Coordinates',
        description: 'Enter GPS coordinates manually',
        icon: '📍',
        route: 'ManualCoordinates',
    },
];

export default function AddFieldMethodScreen() {
    const navigation = useNavigation();

    const handleMethodSelect = (method: MethodOption) => {
        navigation.navigate(method.route as never);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backText}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Add New Field</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.subtitle}>
                    Choose how you want to create your field
                </Text>

                {METHODS.map((method) => (
                    <TouchableOpacity
                        key={method.id}
                        style={styles.methodCard}
                        onPress={() => handleMethodSelect(method)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.methodIcon}>{method.icon}</Text>
                        <View style={styles.methodContent}>
                            <Text style={styles.methodTitle}>{method.title}</Text>
                            <Text style={styles.methodDescription}>
                                {method.description}
                            </Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
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
    content: {
        padding: spacing.lg,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: colors.gray600,
        marginBottom: spacing.xl,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    methodIcon: {
        fontSize: 48,
        marginRight: spacing.md,
    },
    methodContent: {
        flex: 1,
    },
    methodTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.gray900,
        marginBottom: spacing.xs,
    },
    methodDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
    },
    arrow: {
        fontSize: 32,
        color: colors.gray400,
        fontWeight: '300',
    },
});
