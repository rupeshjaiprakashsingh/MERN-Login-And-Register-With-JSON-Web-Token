import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE, getAuthHeaders } from '../config/api';
import '../styles/CheckIn.css';

const CheckIn = () => {
    const [location, setLocation] = useState({
        checkInLocation: '',
        latitude: null,
        longitude: null,
        currentAddress: '',
        accuracy: null,
        loading: false,
        error: null
    });
    const [saving, setSaving] = useState(false);
    const ACCURACY_THRESHOLD_METERS = 50; // recommended threshold for GPS accuracy

    const getCurrentLocation = async () => {
        setLocation(prev => ({ ...prev, loading: true, error: null, accuracy: null }));

        if (!navigator.geolocation) {
            setLocation(prev => ({
                ...prev,
                loading: false,
                error: 'Geolocation is not supported by your browser'
            }));
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        };

        // Helper: wrap getCurrentPosition in a promise
        const getPosition = () => new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });

        const maxAttempts = 4;
        let bestPosition = null;

        toast.info('Attempting to get accurate GPS fix (this may take a few seconds)');

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const pos = await getPosition();
                const { latitude, longitude, accuracy } = pos.coords;

                // Keep the best (smallest) accuracy
                if (!bestPosition || (accuracy != null && accuracy < bestPosition.coords.accuracy)) {
                    bestPosition = pos;
                }

                // If accuracy is good enough, stop
                if (accuracy != null && accuracy <= ACCURACY_THRESHOLD_METERS) {
                    bestPosition = pos;
                    break;
                }

                // If not last attempt, wait a moment and retry
                if (attempt < maxAttempts) {
                    // small delay before next attempt
                    await new Promise(r => setTimeout(r, 1000));
                }
            } catch (err) {
                // If user denied or other fatal error, stop
                setLocation(prev => ({ ...prev, loading: false, error: `Failed to get location: ${err.message}` }));
                toast.error('Failed to get location: ' + err.message);
                return;
            }
        }

        if (!bestPosition) {
            setLocation(prev => ({ ...prev, loading: false, error: 'Could not obtain location' }));
            toast.error('Could not obtain location');
            return;
        }

        try {
            const { latitude, longitude, accuracy } = bestPosition.coords;
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const address = response.data.display_name;

            setLocation(prev => ({
                ...prev,
                latitude,
                longitude,
                currentAddress: address,
                accuracy,
                loading: false,
                error: null
            }));

            toast.success(`Location captured (accuracy ${Math.round(accuracy)} m)`);
        } catch (error) {
            setLocation(prev => ({ ...prev, loading: false, error: 'Failed to get address from coordinates' }));
            toast.error('Failed to get address from coordinates');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!location.latitude || !location.longitude || !location.currentAddress) {
            setLocation(prev => ({ ...prev, error: 'Please capture your current location first.' }));
            return;
        }

        // Warn if accuracy is poor
        if (location.accuracy && location.accuracy > ACCURACY_THRESHOLD_METERS) {
            const proceed = window.confirm(
                `GPS accuracy is ${Math.round(location.accuracy)} meters which is lower than recommended. Do you want to proceed?`
            );
            if (!proceed) return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            setSaving(true);

            const checkInData = {
                checkInLocation: location.checkInLocation,
                latitude: location.latitude,
                longitude: location.longitude,
                currentAddress: location.currentAddress
            };

            await axios.post(
                `${API_BASE}/api/v1/check-in`,
                checkInData,
                {
                    headers: getAuthHeaders()
                }
            );

            toast.success('Attendance recorded successfully!');
            // Clear only the location name so user can check in again later
            setLocation(prev => ({
                ...prev,
                checkInLocation: ''
            }));
        } catch (error) {
            setLocation(prev => ({
                ...prev,
                error: error.response?.data?.msg || error.message || 'Failed to record attendance'
            }));
            toast.error(error.response?.data?.msg || error.message || 'Failed to record attendance');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="check-in-container">
            <h2>Record Attendance</h2>
            {location.error && (
                <div className="error-message">
                    {location.error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="check-in-form">
                <div className="form-group">
                    <label htmlFor="checkInLocation">Location Name:</label>
                    <input
                        type="text"
                        id="checkInLocation"
                        value={location.checkInLocation}
                        onChange={(e) => setLocation(prev => ({
                            ...prev,
                            checkInLocation: e.target.value
                        }))}
                        placeholder="e.g., Office, Home Office, Client Site"
                        required
                    />
                </div>

                <button 
                    type="button" 
                    onClick={getCurrentLocation}
                    className="location-btn"
                    disabled={location.loading}
                >
                    {location.loading ? 'Getting Location...' : 'Get Current Location'}
                </button>

                {location.currentAddress && (
                    <div className="location-details">
                        <p><strong>Current Address:</strong> {location.currentAddress}</p>
                        <p><strong>Latitude:</strong> {location.latitude}</p>
                        <p><strong>Longitude:</strong> {location.longitude}</p>
                        {location.accuracy != null && (
                            <p><strong>GPS accuracy:</strong> {Math.round(location.accuracy)} meters</p>
                        )}
                        {location.accuracy != null && location.accuracy > ACCURACY_THRESHOLD_METERS && (
                            <p className="error-message">GPS accuracy is low — try moving a bit or wait a few seconds and retry.</p>
                        )}
                    </div>
                )}

                <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={saving || !location.currentAddress || !location.checkInLocation}
                >
                    {saving ? 'Saving...' : 'Record Attendance'}
                </button>
            </form>
        </div>
    );
};

export default CheckIn;