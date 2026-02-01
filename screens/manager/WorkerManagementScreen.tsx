import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../../services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function WorkerManagementScreen() {
    const navigation = useNavigation();
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        loadWorkers();
    }, []);

    const loadWorkers = async () => {
        try {
            setLoading(true);
            const response = await userService.getWorkers();
            setWorkers(response.data);
        } catch (error) {
            console.error('Error loading workers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredWorkers = workers.filter((w: any) =>
        w.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderWorkerCard = ({ item }: { item: any }) => (
        <View style={styles.workerCard}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.phone}>{item.phoneNumber}</Text>
                <Text style={styles.field}>Field: {item.assignedFieldId || 'Not Assigned'}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>My Workforce</Text>
            </View>

            <View style={styles.searchBar}>
                <TextInput
                    style={styles.input}
                    placeholder="Search by name..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {loading ? <ActivityIndicator style={{ marginTop: 50 }} color={colors.primary} /> : (
                <FlatList
                    data={filteredWorkers}
                    renderItem={renderWorkerCard}
                    keyExtractor={(item: any) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>No workers found</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: colors.primary, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    backText: { color: '#fff', fontSize: 24, marginRight: 15 },
    title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    searchBar: { padding: 20 },
    input: { backgroundColor: '#fff', padding: 12, borderRadius: 10, ...shadows.sm },
    listContent: { paddingHorizontal: 20 },
    workerCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', ...shadows.sm },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    avatarText: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
    info: { flex: 1 },
    name: { fontWeight: 'bold', fontSize: 16, color: colors.gray900 },
    phone: { color: colors.gray600, fontSize: 13, marginTop: 2 },
    field: { color: colors.gray500, fontSize: 12, marginTop: 4 },
    emptyText: { textAlign: 'center', marginTop: 50, color: colors.gray500 }
});
