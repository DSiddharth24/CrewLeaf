import React, { useEffect } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, borderRadius } from '../theme';

export default function SplashScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 20,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleGetStarted = () => {
        navigation.navigate('LanguageSelection' as never);
    };

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Image
                    source={require('../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.appName}>CrewLeaf</Text>
                <Text style={styles.tagline}>Smart Plantation Management</Text>
            </Animated.View>

            <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleGetStarted}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>{t('common.getStarted')}</Text>
            </TouchableOpacity>

            <Text style={styles.version}>Version 1.0.0</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.xxl * 2,
    },
    logoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: spacing.lg,
    },
    appName: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.sm,
    },
    tagline: {
        fontSize: typography.fontSize.md,
        color: colors.gray600,
    },
    getStartedButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl * 2,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonText: {
        color: colors.white,
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
    },
    version: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
        marginTop: spacing.md,
    },
});
