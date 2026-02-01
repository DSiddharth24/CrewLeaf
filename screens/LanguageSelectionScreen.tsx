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
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface Language {
    code: 'en' | 'kn' | 'hi' | 'tuu';
    name: string;
    nativeName: string;
    flag: string;
}

const LANGUAGES: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'tuu', name: 'Tulu', nativeName: 'ತುಳು', flag: '🇮🇳' },
];

export default function LanguageSelectionScreen() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
    const [scaleAnims] = useState(
        LANGUAGES.map(() => new Animated.Value(1))
    );

    const handleLanguageSelect = (languageCode: string, index: number) => {
        setSelectedLanguage(languageCode);

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
        await i18n.changeLanguage(selectedLanguage);
        await AsyncStorage.setItem('user-language', selectedLanguage);
        navigation.navigate('RoleSelection' as never);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('common.selectLanguage')}</Text>
                <Text style={styles.subtitle}>{t('common.selectLanguage')}</Text>
            </View>

            <ScrollView
                style={styles.languageList}
                contentContainerStyle={styles.languageListContent}
                showsVerticalScrollIndicator={false}
            >
                {LANGUAGES.map((language, index) => (
                    <Animated.View
                        key={language.code}
                        style={{ transform: [{ scale: scaleAnims[index] }] }}
                    >
                        <TouchableOpacity
                            style={[
                                styles.languageCard,
                                selectedLanguage === language.code && styles.languageCardSelected,
                            ]}
                            onPress={() => handleLanguageSelect(language.code, index)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.flag}>{language.flag}</Text>
                            <View style={styles.languageInfo}>
                                <Text style={styles.languageName}>{t(`languages.${language.name.toLowerCase()}`)}</Text>
                                <Text style={styles.languageNative}>{language.nativeName}</Text>
                            </View>
                            {selectedLanguage === language.code && (
                                <View style={styles.checkmark}>
                                    <Text style={styles.checkmarkText}>✓</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
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
    languageList: {
        flex: 1,
    },
    languageListContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    languageCard: {
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
    languageCardSelected: {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}10`,
    },
    flag: {
        fontSize: 40,
        marginRight: spacing.md,
    },
    languageInfo: {
        flex: 1,
    },
    languageName: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.gray900,
        marginBottom: spacing.xs,
    },
    languageNative: {
        fontSize: typography.fontSize.md,
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
    continueButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
    },
});
