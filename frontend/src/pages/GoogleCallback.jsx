import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');

            if (!code || !state) {
                console.error('Missing code or state in callback');
                navigate('/calendar?error=missing_params');
                return;
            }

            try {
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
                // Call the backend callback endpoint with the parameters
                const response = await axios.get(`${apiBaseUrl}/api/google/callback`, {
                    params: { code, state }
                });

                // The backend response is an HTML redirect or a JSON. 
                // Since we are calling it via AJAX, we need to handle the result.
                // However, our backend's callback endpoint is designed to be a direct browser redirect.
                
                // If we want the frontend to handle it, we might need a specific "exchange" endpoint 
                // OR we can just hope the backend handles the tokens and returns success.
                
                if (response.status === 200) {
                    navigate('/calendar?google=connected');
                } else {
                    navigate('/calendar?error=sync_failed');
                }
            } catch (error) {
                console.error('Google callback error:', error);
                navigate('/calendar?error=sync_failed');
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mb-6" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Finalizing Sync</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">Connecting your Google Calendar...</p>
        </div>
    );
};

export default GoogleCallback;
