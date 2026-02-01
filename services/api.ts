import axios, { InternalAxiosRequestConfig } from 'axios';
import { auth } from '../config/firebase';
import { User, Field } from '../types';


const API_BASE_URL = 'http://192.168.1.XX:5000'; // REPLACE '192.168.1.XX' with your computer's local IP address

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to include the Firebase ID token
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error: any) => {
    return Promise.reject(error);
});

export const userService = {
    getProfile: () => api.get<User>('/users/profile'),
    createUser: (userData: Partial<User>) => api.post('/users/create', userData),
    getWorkers: () => api.get<User[]>('/users/workers'),
    getManagers: () => api.get<User[]>('/users/managers'),
};

export const fieldService = {
    createField: (fieldData: Partial<Field>) => api.post('/fields/create', fieldData),
    getAllFields: () => api.get<Field[]>('/fields/all'),
};

export const deviceService = {
    getUnassignedDevices: () => api.get<any[]>('/devices/unassigned'),
    assignDevice: (assignmentData: { deviceId: string; assignedFieldId: string; assignedGateName: string }) => api.post('/devices/assign', assignmentData),
    getAllDevices: () => api.get<any[]>('/devices/all'),
};

export const attendanceService = {
    getLogs: (filters: any) => api.get('/attendance', { params: filters }),
};

export default api;
