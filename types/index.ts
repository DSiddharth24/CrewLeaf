export type UserRole = 'manager' | 'supervisor' | 'worker';

export interface User {
    uid: string;
    email: string;
    role: UserRole;
    name: string;
    language: 'en' | 'kn' | 'hi' | 'tuu';
    managerId?: string;
    supervisorId?: string;
    rfidCardId?: string;
    createdAt: Date;
    permissions?: Record<string, boolean>;
}

export interface Field {
    id: string;
    name: string;
    managerId: string;
    cropType: string;
    boundary: GeoJSON.Polygon;
    area: number; // in square meters
    status: 'active' | 'inactive';
    createdAt: Date;
}

export interface Attendance {
    id: string;
    workerId: string;
    fieldId: string;
    checkInTime: Date;
    checkInLocation: {
        latitude: number;
        longitude: number;
    };
    checkOutTime?: Date;
    checkOutLocation?: {
        latitude: number;
        longitude: number;
    };
    status: 'present' | 'absent' | 'left-early';
    supervisorVerified: boolean;
}

export interface Task {
    id: string;
    name: string;
    fieldId: string;
    managerId: string;
    supervisorId?: string;
    assignedWorkers: string[];
    type: string; // Renamed from taskType to match DB
    priority?: 'High' | 'Normal' | 'Low'; // Added priority
    startTime: any; // Changed to any to handle Firestore Timestamp
    deadline: any; // Changed to any to handle Firestore Timestamp
    status: 'pending' | 'active' | 'completed' | 'delayed' | 'verified';
    progress: number; // 0-100
    machineId?: string;
    description?: string;
    verificationRating?: number;
    verificationNotes?: string;
}

export interface Wage {
    id: string;
    workerId: string;
    date: Date;
    hoursWorked: number;
    outputQuantity: number;
    calculatedWage: number;
    paymentStatus: 'pending' | 'paid';
    transactionId?: string;
}
