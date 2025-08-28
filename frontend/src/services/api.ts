import axios, { AxiosResponse } from 'axios';
import { ExerciseApiResponse, SearchApiResponse, ExerciseSearchParams } from '../types';

// Base API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor (logs outgoing requests)
api.interceptors.request.use(
    (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor (handles responses and errors)
api.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error);

        // Handle specific error cases
        if (error.code === 'ECONNREFUSED') {
            console.error('🔌 Backend server is not running! Start with: python app.py');
            throw new Error('Backend server is not running. Please start your Flask server.');
        }

        if (error.response) {
            // Server responded with error status
            console.error('Server Error:', error.response.status, error.response.data);
            throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
        } else if (error.request) {
            // Network error
            console.error('Network Error:', error.request);
            throw new Error('Network error. Please check your internet connection.');
        } else {
            // Something else went wrong
            console.error('Unknown Error:', error.message);
            throw new Error(error.message);
        }
    }
);

// API functions that call your Flask endpoints
export const exerciseApi = {
    // Health check - test if backend is running
    healthCheck: async () => {
        try {
            const response = await api.get('/health');
            return response.data;
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    },

    // Get all exercises with pagination
    getAllExercises: async (page = 1, perPage = 50): Promise<AxiosResponse<ExerciseApiResponse>> => {
        return api.get(`/exercises?page=${page}&per_page=${perPage}`);
    },

    // Search exercises
    searchExercises: async (params: ExerciseSearchParams): Promise<AxiosResponse<SearchApiResponse>> => {
        const queryString = new URLSearchParams();

        // Build query parameters
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryString.append(key, value.toString());
            }
        });

        const url = `/exercises/search${queryString.toString() ? '?' + queryString.toString() : ''}`;
        return api.get(url);
    },

    // Get exercises by muscle group
    getExercisesByMuscle: async (muscle: string) => {
        return api.get(`/exercises/by-muscle/${muscle}`);
    },

    // Get random exercises
    getRandomExercises: async (count = 5) => {
        return api.get(`/exercises/random?count=${count}`);
    },

    // Get muscle groups
    getMuscleGroups: async () => {
        return api.get('/muscle-groups');
    },

    // Get exercise statistics
    getExerciseStats: async () => {
        return api.get('/exercises/stats');
    },
};

// Test function to verify connection
export const testBackendConnection = async (): Promise<boolean> => {
    try {
        await exerciseApi.healthCheck();
        console.log('✅ Backend connection successful!');
        return true;
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        return false;
    }
};

export default api;