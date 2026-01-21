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
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import {
    getCurrentLocation,
    calculatePolygonArea,
    squareMetersToAcres,
    Coordinates,
} from '../../services/locationService';
import { colors, spacing, typography, borderRadius } from '../../theme';

export default function DrawFieldMapScreen() {
    const navigation = useNavigation();
    const mapRef = useRef<MapView>(null);

    const [region, setRegion] = useState({
        latitude: 12.9716,
        longitude: 77.5946,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    const [polygonCoords, setPolygonCoords] = useState<Coordinates[]>([]);
    const [fieldName, setFieldName] = useState('');
    const [cropType, setCropType] = useState('');
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
            setRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
            mapRef.current?.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
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
        if (!cropType.trim()) {
            Alert.alert('Error', 'Please enter a crop type');
            return;
        }
        if (polygonCoords.length < 3) {
            Alert.alert('Error', 'Please mark at least 3 points to create a field');
            return;
        }

        setLoading(true);
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            // Create GeoJSON polygon
            const boundary = {
                type: 'Polygon',
                coordinates: [
                    [
                        ...polygonCoords.map(coord => [coord.longitude, coord.latitude]),
                        [polygonCoords[0].longitude, polygonCoords[0].latitude], // Close the polygon
                    ],
                ],
            };

            await addDoc(collection(db, 'fields'), {
                name: fieldName,
                managerId: userId,
                cropType: cropType,
                boundary: boundary,
                area: area,
                status: 'active',
                createdAt: new Date(),
            });

            Alert.alert('Success', 'Field created successfully', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('FieldManagement' as never),
                },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (locationLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading your location...</Text>
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
                showsMyLocationButton
            >
                {/* Markers for each point */}
                {polygonCoords.map((coord, index) => (
                    <Marker
                        key={index}
                        coordinate={coord}
                        pinColor={colors.primary}
                    />
                ))}

                {/* Polygon */}
                {polygonCoords.length >= 3 && (
                    <Polygon
                        coordinates={polygonCoords}
                        fillColor={`${colors.primary}30`}
                        strokeColor={colors.primary}
                        strokeWidth={2}
                    />
                )}
            </MapView>

            {/* Top Panel */}
            <View style={styles.topPanel}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backText}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Draw Field Boundary</Text>
            </View>

            {/* Bottom Panel */}
            <View style={styles.bottomPanel}>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Field Name"
                        value={fieldName}
                        onChangeText={setFieldName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Crop Type"
                        value={cropType}
                        onChangeText={setCropType}
                    />
                </View>

                {area > 0 && (
                    <View style={styles.areaInfo}>
                        <Text style={styles.areaText}>
                            Area: {squareMeters ToAcres(area).toFixed(2)} acres ({area.toFixed(0)} m²)
                        </Text>
                        <Text style={styles.pointsText}>
                            {polygonCoords.length} points marked
                        </Text>
                    </View>
                )}

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, styles.undoButton]}
                        onPress={handleUndo}
                        disabled={polygonCoords.length === 0}
                    >
                        <Text style={styles.buttonText}>Undo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.clearButton]}
                        onPress={handleClear}
                        disabled={polygonCoords.length === 0}
                    >
                        <Text style={styles.buttonText}>Clear</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.saveButton]}
                        onPress={handleSave}
                        disabled={loading || polygonCoords.length < 3}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={[styles.buttonText, { color: colors.white }]}>
                                Save
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={styles.hint}>
                    Tap on the map to mark field boundary points
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: typography.fontSize.md,
        color: colors.gray600,
    },
    topPanel: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.primary,
        paddingTop: spacing.xxl * 2,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: spacing.md,
    },
    backText: {
        color: colors.white,
        fontSize: typography.fontSize.xl,
        fontWeight: '600',
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.white,
    },
    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
    },
    inputRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    input: {
        flex: 1,
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: typography.fontSize.md,
    },
    areaInfo: {
        backgroundColor: colors.primary + '10',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    areaText: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    pointsText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray700,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    button: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    undoButton: {
        backgroundColor: colors.gray200,
    },
    clearButton: {
        backgroundColor: colors.gray200,
    },
    saveButton: {
        backgroundColor: colors.primary,
    },
    buttonText: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.gray900,
    },
    hint: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
        textAlign: 'center',
    },
});
