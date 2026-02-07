export{};
/*
import React, { useState, useEffect } from 'react';
import { exerciseApi, testBackendConnection } from '../services/api';
import { Exercise } from '../types';

const ApiTest: React.FC = () => {
    const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        setConnectionStatus('testing');
        const isConnected = await testBackendConnection();
        setConnectionStatus(isConnected ? 'connected' : 'failed');
    };

    const loadExercises = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await exerciseApi.getAllExercises(1, 10);
            setExercises(response.data.exercises);

            console.log('📊 Loaded exercises:', response.data);
        } catch (err: any) {
            setError(err.message);
            console.error('Failed to load exercises:', err);
        } finally {
            setLoading(false);
        }
    };

    const searchExercises = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await exerciseApi.searchExercises({ name: 'squat', limit: 5 });
            setExercises(response.data.exercises);

            console.log('🔍 Search results:', response.data);
        } catch (err: any) {
            setError(err.message);
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };


 */

/*    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>🧪 API Connection Test</h1>

            {}
            <div style={{
                padding: '15px',
                marginBottom: '20px',
                borderRadius: '8px',
                backgroundColor: connectionStatus === 'connected' ? '#d4edda' :
                    connectionStatus === 'failed' ? '#f8d7da' : '#fff3cd',
                border: `1px solid ${connectionStatus === 'connected' ? '#c3e6cb' :
                    connectionStatus === 'failed' ? '#f5c6cb' : '#ffeaa7'}`
            }}>
                <strong>Backend Status: </strong>
                {connectionStatus === 'testing' && '🔄 Testing connection...'}
                {connectionStatus === 'connected' && '✅ Connected successfully!'}
                {connectionStatus === 'failed' && '❌ Connection failed. Is your Flask server running?'}

                {connectionStatus === 'failed' && (
                    <div style={{ marginTop: '10px', fontSize: '14px' }}>
                        <p>Make sure your Flask backend is running:</p>
                        <code style={{ background: '#f1f1f1', padding: '5px' }}>
                            cd backend && python app.py
                        </code>
                    </div>
                )}
            </div>

            {}
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={checkConnection}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    🔄 Test Connection
                </button>

                <button
                    onClick={loadExercises}
                    disabled={connectionStatus !== 'connected' || loading}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        backgroundColor: connectionStatus !== 'connected' ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: connectionStatus !== 'connected' ? 'not-allowed' : 'pointer'
                    }}
                >
                    📋 Load All Exercises
                </button>

                <button
                    onClick={searchExercises}
                    disabled={connectionStatus !== 'connected' || loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: connectionStatus !== 'connected' ? '#ccc' : '#ffc107',
                        color: connectionStatus !== 'connected' ? '#666' : 'black',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: connectionStatus !== 'connected' ? 'not-allowed' : 'pointer'
                    }}
                >
                    🔍 Search "Squat"
                </button>
            </div>

            {}
            {loading && (
                <div style={{ color: '#007bff', marginBottom: '20px' }}>
                    ⏳ Loading...
                </div>
            )}

            {}
            {error && (
                <div style={{
                    color: '#dc3545',
                    backgroundColor: '#f8d7da',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '20px'
                }}>
                    ❌ Error: {error}
                </div>
            )}

            {}
            {exercises.length > 0 && (
                <div>
                    <h3>📊 Exercise Results ({exercises.length})</h3>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {exercises.map((exercise, index) => (
                            <div key={index} style={{
                                border: '1px solid #ddd',
                                padding: '15px',
                                borderRadius: '8px',
                                backgroundColor: '#f9f9f9'
                            }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                                    {exercise.name}
                                </h4>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    <p><strong>Category:</strong> {exercise.category}</p>
                                    <p><strong>Equipment:</strong> {exercise.equipment}</p>
                                    <p><strong>Level:</strong> {exercise.level}</p>
                                    <p><strong>Primary Muscles:</strong> {exercise.primaryMuscles.join(', ')}</p>
                                    {exercise.secondaryMuscles.length > 0 && (
                                        <p><strong>Secondary Muscles:</strong> {exercise.secondaryMuscles.join(', ')}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
*/
//export default ApiTest;