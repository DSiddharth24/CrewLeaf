import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import { fieldService } from '../../services/api';
import {
    getCurrentLocation,
    calculatePolygonArea,
    squareMetersToAcres,
} from '../../services/locationService';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export default function CreateFieldScreen() {
    const navigation = useNavigation();
    const mapRef = useRef<MapView>(null);

    const [region, setRegion] = useState({
        latitude: 12.9716,
        longitude: 77.5946,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    const [polygonCoords, setPolygonCoords] = useState<any[]>([]);
    const [fieldName, setFieldName] = useState('');
    const [area, setArea] = useState(0);
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(true);

    useEffect(() => {
        loadCurrentLocation();
    }, []);

    useEffect(() => {
        if (polygonCoords.length >= 3) {
            const calculatedArea = calculatePolygonArea(polygonCoords);
            setArea(calculatedArea);
        }
    }, [polygonCoords]);

    const loadCurrentLocation = async () => {
        const location = await getCurrentLocation();
        if (location) {
            const newRegion = {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion);
        }
        setLocationLoading(false);
    };

    const handleMapPress = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setPolygonCoords([...polygonCoords, { latitude, longitude }]);
    };

    const handleUndo = () => {
        if (polygonCoords.length > 0) {
            setPolygonCoords(polygonCoords.slice(0, -1));
        }
    };

    const handleClear = () => {
        setPolygonCoords([]);
        setArea(0);
    };

    const handleSave = async () => {
        if (!fieldName.trim()) {
            Alert.alert('Error', 'Please enter a field name');
            return;
        }
        if (polygonCoords.length < 3) {
            Alert.alert('Error', 'Please mark at least 3 points to create a field');
            return;
        }

        setLoading(true);
        try {
            await fieldService.createField({
                name: fieldName,
                boundary: {
                    type: 'Polygon',
                    coordinates: [polygonCoords.map(c => [c.longitude, c.latitude])]
                },
                area: area,
            });

            Alert.alert('Success', 'Field created successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    if (locationLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Locating Plantation...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
                onPress={handleMapPress}
                showsUserLocation
            >
                {polygonCoords.map((coord, index) => (
                    <Marker key={index} coordinate={coord} />
                ))}
                {polygonCoords.length >= 3 && (
                    <Polygon
                        coordinates={polygonCoords}
                        fillColor={`${colors.primary}30`}
                        strokeColor={colors.primary}
                        strokeWidth={2}
                    />
                )}
            </MapView>

            <View style={styles.overlay}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backText}>‹ Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Map New Field</Text>
                </View>

                <View style={styles.controlPanel}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Field Name (e.g. Block A1)"
                        value={fieldName}
                        onChangeText={setFieldName}
                    />

                    {area > 0 && (
                        <Text style={styles.areaInfo}>
                            Estimated Area: {squareMetersToAcres(area).toFixed(2)} Acres
                        </Text>
                    )}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={handleUndo}>
                            <Text>Undo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryButton} onPress={handleClear}>
                            <Text>Clear</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleSave}
                            disabled={loading || polygonCoords.length < 3}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Save Field</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: colors.gray600 },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'box-none' },
    header: {
        backgroundColor: colors.primary,
        paddingTop: spacing.xxl * 2,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center'
    },
    backText: { color: '#fff', fontSize: 24, marginRight: 15 },
    title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    controlPanel: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        ...shadows.lg
    },
    input: {
        backgroundColor: colors.gray100,
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        fontSize: 16
    },
    areaInfo: {
        color: colors.primary,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    buttonRow: { flexDirection: 'row', gap: 10 },
    secondaryButton: {
        flex: 1,
        backgroundColor: colors.gray200,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center'
    },
    primaryButton: {
        flex: 2,
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center'
    },
    primaryButtonText: { color: '#fff', fontWeight: 'bold' }
});
