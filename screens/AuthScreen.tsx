import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
    signInWithPhoneNumber,
    FirebaseRecaptchaVerifierModal,
} from 'expo-firebase-recaptcha';
import { auth } from '../config/firebase';
import { userService } from '../services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

export default function AuthScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const recaptchaVerifier = useRef(null);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('phone'); // 'phone' or 'code'

    const handleSendVerificationCode = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            const phoneProvider = new (require('firebase/auth').PhoneAuthProvider)(auth);
            const id = await phoneProvider.verifyPhoneNumber(
                phoneNumber,
                recaptchaVerifier.current
            );
            setVerificationId(id);
            setStep('code');
            Alert.alert('Success', 'Verification code sent!');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!verificationCode) {
            Alert.alert('Error', 'Please enter the verification code');
            return;
        }

        setLoading(true);
        try {
            const credential = (require('firebase/auth').PhoneAuthProvider).credential(
                verificationId,
                verificationCode
            );
            await (require('firebase/auth').signInWithCredential)(auth, credential);

            // Fetch profile from backend
            const response = await userService.getProfile();
            const userProfile = response.data;

            // Navigate based on role
            navigateToRoleDashboard(userProfile.role);

        } catch (error: any) {
            Alert.alert('Error', 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const navigateToRoleDashboard = (userRole: string) => {
        switch (userRole) {
            case 'manager':
                navigation.navigate('ManagerDashboard' as never);
                break;
            case 'supervisor':
                navigation.navigate('SupervisorDashboard' as never);
                break;
            case 'worker':
                navigation.navigate('WorkerHome' as never);
                break;
            default:
                Alert.alert('Error', 'Unauthorized role. Please contact supervisor.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={auth.app.options}
                attemptInvisibleVerification={true}
            />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Crewlief Login</Text>
                    <Text style={styles.subtitle}>
                        {step === 'phone'
                            ? 'Enter your phone number to continue'
                            : 'Enter the 6-digit code sent to your phone'}
                    </Text>
                </View>

                <View style={styles.form}>
                    {step === 'phone' ? (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+91 1234567890"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                autoFocus
                            />
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleSendVerificationCode}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.white} />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Send Code</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Verification Code</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="123456"
                                value={verificationCode}
                                onChangeText={setVerificationCode}
                                keyboardType="number-pad"
                                autoFocus
                            />
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleVerifyCode}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.white} />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Verify & Login</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.switchButton}
                                onPress={() => setStep('phone')}
                            >
                                <Text style={styles.switchButtonText}>Change Phone Number</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: spacing.xxl * 2,
        paddingHorizontal: spacing.lg,
    },
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.gray900,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: colors.gray600,
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: spacing.lg,
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
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: typography.fontSize.md,
        color: colors.gray900,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.xl,
        ...shadows.md,
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
    },
    switchButton: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    switchButtonText: {
        fontSize: typography.fontSize.md,
        color: colors.primary,
        fontWeight: '600',
    },
});
