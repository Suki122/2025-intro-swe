import React, { useState, useEffect } from 'react';
import { getCurrentUser, storeApiKeys } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

interface ApiKeysModalProps {
  onClose: () => void;
}

const ApiKeysModal: React.FC<ApiKeysModalProps> = ({ onClose }) => {
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { completeOnboarding, isAuthenticated } = useAuth(); // Use completeOnboarding and isAuthenticated from AuthContext

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (isAuthenticated && token) { // Only fetch if authenticated and token exists
          const response = await getCurrentUser(token);
          if (response.data.google_api_key) {
            setGoogleApiKey(response.data.google_api_key);
          }
          if (response.data.groq_api_key) {
            setGroqApiKey(response.data.groq_api_key);
          }
        }
      } catch (err) {
        setError('Failed to load user data.');
      }
    };
    fetchUserData();
  }, [isAuthenticated]); // Rerun effect when isAuthenticated changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await storeApiKeys(token, { google_api_key: googleApiKey, groq_api_key: groqApiKey });
        setSuccess('API keys saved successfully!');
        completeOnboarding(); // Mark onboarding as complete
        setTimeout(() => {
            onClose();
        }, 1000)
      }
    } catch (err) {
      setError('Failed to save API keys.');
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 flex justify-center items-center z-[9999]">
      <div className="glass-card p-8 rounded-lg shadow-lg w-full max-w-md mx-4 sm:mx-0">
        <h2 className="text-2xl font-bold mb-4 text-white">API Keys</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300">Google API Key</label>
            <input
              type="text"
              value={googleApiKey}
              onChange={(e) => setGoogleApiKey(e.target.value)}
              className="input-field bg-navy-800/30 border-navy-700/50 text-white placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300">Groq API Key</label>
            <input
              type="text"
              value={groqApiKey}
              onChange={(e) => setGroqApiKey(e.target.value)}
              className="input-field bg-navy-800/30 border-navy-700/50 text-white placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 w-full"
            />
          </div>
          <div className="flex justify-between items-center">
            <button type="submit" className="btn-primary">
              Save Keys
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeysModal;
