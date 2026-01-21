import React, { useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import * as Google from 'expo-auth-session/providers/google';
import { auth, db } from '../config/firebase';
import { UserRole } from '../types';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

export default function AuthScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const role = (route.params as any)?.role as UserRole;

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    // Google Sign In configuration
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            handleGoogleSignIn(credential);
        }
    }, [response]);

    const handleEmailAuth = async () => {
        if (!email || !password || (!isLogin && !name)) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            let userCredential;

            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);

                // Create user profile in Firestore
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    uid: userCredential.user.uid,
                    email: email,
                    name: name,
                    role: role,
                    language: 'en', // Default, will be updated based on selection
                    createdAt: new Date(),
                });
            }

            // Navigate based on role
            navigateToRoleDashboard(role);

        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async (credential: any) => {
        setLoading(true);
        try {
            const userCredential = await signInWithCredential(auth, credential);

            // Create or update user profile
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                name: userCredential.user.displayName,
                role: role,
                language: 'en',
                createdAt: new Date(),
            }, { merge: true });

            navigateToRoleDashboard(role);

        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const navigateToRoleDashboard = (userRole: UserRole) => {
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
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.roleText}>
                        {role.charAt(0).toUpperCase() + role.slice(1)} Account
                    </Text>
                    <Text style={styles.title}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isLogin ? 'Login to continue' : 'Sign up to get started'}
                    </Text>
                </View>

                <View style={styles.form}>
                    {!isLogin && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your name"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleEmailAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.primaryButtonText}>
                                {isLogin ? 'Login' : 'Sign Up'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={() => promptAsync()}
                        disabled={loading || !request}
                    >
                        <Text style={styles.googleIcon}>G</Text>
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.switchButton}
                        onPress={() => setIsLogin(!isLogin)}
                    >
                        <Text style={styles.switchButtonText}>
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            <Text style={styles.switchButtonTextBold}>
                                {isLogin ? 'Sign Up' : 'Login'}
                            </Text>
                        </Text>
                    </TouchableOpacity>
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
    roleText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.sm,
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
        marginTop: spacing.md,
        ...shadows.md,
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.xl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.gray300,
    },
    dividerText: {
        marginHorizontal: spacing.md,
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
        fontWeight: '600',
    },
    googleButton: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray300,
        paddingVertical: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    googleIcon: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        marginRight: spacing.sm,
        color: colors.primary,
    },
    googleButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.gray700,
    },
    switchButton: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    switchButtonText: {
        fontSize: typography.fontSize.md,
        color: colors.gray600,
    },
    switchButtonTextBold: {
        fontWeight: 'bold',
        color: colors.primary,
    },
});
