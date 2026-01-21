import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import DateTimePicker from '@react-native-community/datetimepicker';

interface SelectionItem {
    id: string;
    name: string;
}

export default function CreateTaskScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [taskType, setTaskType] = useState('Harvesting');
    const [priority, setPriority] = useState('Normal');

    // Data selections
    const [fields, setFields] = useState<SelectionItem[]>([]);
    const [workers, setWorkers] = useState<SelectionItem[]>([]);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);

    // Date Picker
    const [deadline, setDeadline] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const managerId = auth.currentUser?.uid;
            if (!managerId) return;

            // Fetch Fields
            const fieldsQuery = query(collection(db, 'fields'), where('managerId', '==', managerId));
            const fieldsSnap = await getDocs(fieldsQuery);
            const fieldsList = fieldsSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setFields(fieldsList);

            // Fetch Workers
            const workersQuery = query(collection(db, 'users'), where('managerId', '==', managerId), where('role', '==', 'worker'));
            const workersSnap = await getDocs(workersQuery);
            const workersList = workersSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setWorkers(workersList);

        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to load fields and workers');
        }
    };

    const handleCreateTask = async () => {
        if (!title || !selectedField || selectedWorkers.length === 0) {
            Alert.alert('Missing Info', 'Please fill in Title, select a Field, and assign at least one Worker.');
            return;
        }

        try {
            setLoading(true);
            const managerId = auth.currentUser?.uid;

            await addDoc(collection(db, 'tasks'), {
                name: title,
                description,
                type: taskType,
                priority,
                fieldId: selectedField,
                assignedWorkers: selectedWorkers,
                managerId,
                status: 'pending',
                progress: 0,
                deadline: deadline,
                startTime: serverTimestamp(), // Available from now
                createdAt: serverTimestamp(),
            });

            Alert.alert('Success', 'Task created successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Error creating task:', error);
            Alert.alert('Error', 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    const toggleWorkerSelection = (workerId: string) => {
        if (selectedWorkers.includes(workerId)) {
            setSelectedWorkers(selectedWorkers.filter(id => id !== workerId));
        } else {
            setSelectedWorkers([...selectedWorkers, workerId]);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create New Task</Text>
                <TouchableOpacity onPress={handleCreateTask} disabled={loading}>
                    {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.saveText}>Save</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Task Title */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Task Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Harvest Section A"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Task Type */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Task Type</Text>
                    <View style={styles.tagContainer}>
                        {['Harvesting', 'Fertilizing', 'Weeding', 'Maintenance'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.tag, taskType === type && styles.tagSelected]}
                                onPress={() => setTaskType(type)}
                            >
                                <Text style={[styles.tagText, taskType === type && styles.tagTextSelected]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Priority */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Priority</Text>
                    <View style={styles.tagContainer}>
                        {['High', 'Normal', 'Low'].map((p) => (
                            <TouchableOpacity
                                key={p}
                                style={[styles.tag, priority === p && styles.tagSelected]}
                                onPress={() => setPriority(p)}
                            >
                                <Text style={[styles.tagText, priority === p && styles.tagTextSelected]}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Field Selection */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Select Field</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {fields.map((field) => (
                            <TouchableOpacity
                                key={field.id}
                                style={[styles.cardSelect, selectedField === field.id && styles.cardSelected]}
                                onPress={() => setSelectedField(field.id)}
                            >
                                <Text style={[styles.cardText, selectedField === field.id && styles.cardTextSelected]}>
                                    {field.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        {fields.length === 0 && <Text style={styles.emptyText}>No fields available</Text>}
                    </ScrollView>
                </View>

                {/* Worker Selection */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Assign Workers</Text>
                    <View style={styles.workerList}>
                        {workers.map((worker) => (
                            <TouchableOpacity
                                key={worker.id}
                                style={[styles.workerRow, selectedWorkers.includes(worker.id) && styles.workerRowSelected]}
                                onPress={() => toggleWorkerSelection(worker.id)}
                            >
                                <Text style={styles.workerName}>{worker.name}</Text>
                                {selectedWorkers.includes(worker.id) && <Text style={styles.checkIcon}>✓</Text>}
                            </TouchableOpacity>
                        ))}
                        {workers.length === 0 && <Text style={styles.emptyText}>No workers available</Text>}
                    </View>
                </View>

                {/* Deadline */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Deadline</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.dateText}>{deadline.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={deadline}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) setDeadline(selectedDate);
                            }}
                        />
                    )}
                </View>

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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        paddingTop: spacing.xxl,
        backgroundColor: colors.white,
        ...shadows.sm,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.gray900,
    },
    backButton: {
        padding: spacing.sm,
    },
    backButtonText: {
        fontSize: 24,
        color: colors.gray900,
    },
    saveText: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.primary,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    formGroup: {
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
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray200,
        fontSize: typography.fontSize.md,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    tag: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.gray300,
        backgroundColor: colors.white,
    },
    tagSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    tagText: {
        color: colors.gray600,
    },
    tagTextSelected: {
        color: colors.white,
        fontWeight: '600',
    },
    horizontalScroll: {
        flexDirection: 'row',
    },
    cardSelect: {
        padding: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginRight: spacing.md,
        borderWidth: 1,
        borderColor: colors.gray200,
        minWidth: 100,
        alignItems: 'center',
    },
    cardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10', // 10% opacity
    },
    cardText: {
        color: colors.gray700,
        fontWeight: '500',
    },
    cardTextSelected: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    workerList: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    workerRow: {
        padding: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    workerRowSelected: {
        backgroundColor: colors.primary + '10',
    },
    workerName: {
        fontSize: typography.fontSize.md,
        color: colors.gray900,
    },
    checkIcon: {
        color: colors.primary,
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
    },
    dateButton: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    dateText: {
        fontSize: typography.fontSize.md,
        color: colors.gray900,
    },
    emptyText: {
        color: colors.gray500,
        fontStyle: 'italic',
        padding: spacing.sm,
    }
});
