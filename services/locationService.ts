import * as Location from 'expo-location';

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface FieldBoundary {
    type: 'Polygon';
    coordinates: number[][][]; // GeoJSON format
}

/**
 * Request location permissions from user
 */
export const requestLocationPermission = async (): Promise<boolean> => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error requesting location permission:', error);
        return false;
    }
};

/**
 * Get current user location
 */
export const getCurrentLocation = async (): Promise<Coordinates | null> => {
    try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            throw new Error('Location permission denied');
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    } catch (error) {
        console.error('Error getting location:', error);
        return null;
    }
};

/**
 * Check if a point is inside a polygon (geofencing)
 * Using ray-casting algorithm
 */
export const isPointInPolygon = (
    point: Coordinates,
    polygon: Coordinates[]
): boolean => {
    let inside = false;
    const x = point.latitude;
    const y = point.longitude;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].latitude;
        const yi = polygon[i].longitude;
        const xj = polygon[j].latitude;
        const yj = polygon[j].longitude;

        const intersect =
            yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

        if (intersect) inside = !inside;
    }

    return inside;
};

/**
 * Calculate distance between two points in meters
 * Using Haversine formula
 */
export const calculateDistance = (
    point1: Coordinates,
    point2: Coordinates
): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

/**
 * Calculate area of a polygon in square meters
 */
export const calculatePolygonArea = (polygon: Coordinates[]): number => {
    const R = 6371000; // Earth's radius in meters
    let area = 0;

    if (polygon.length < 3) return 0;

    for (let i = 0; i < polygon.length; i++) {
        const j = (i + 1) % polygon.length;
        const lat1 = (polygon[i].latitude * Math.PI) / 180;
        const lat2 = (polygon[j].latitude * Math.PI) / 180;
        const lon1 = (polygon[i].longitude * Math.PI) / 180;
        const lon2 = (polygon[j].longitude * Math.PI) / 180;

        area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    area = (area * R * R) / 2;
    return Math.abs(area);
};

/**
 * Convert square meters to acres
 */
export const squareMetersToAcres = (sqMeters: number): number => {
    return sqMeters / 4046.86;
};

/**
 * Watch user location in real-time
 */
export const watchLocation = async (
    callback: (location: Coordinates) => void
): Promise<Location.LocationSubscription | null> => {
    try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            throw new Error('Location permission denied');
        }

        const subscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000, // Update every 5 seconds
                distanceInterval: 10, // Update if moved 10 meters
            },
            (location) => {
                callback({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            }
        );

        return subscription;
    } catch (error) {
        console.error('Error watching location:', error);
        return null;
    }
};
