
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { login } from '../../services/api'; // Import the login function

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSwitchToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await login(email, password); // Use the imported login function
      authLogin(response.data.access_token);
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="glass-card p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field bg-navy-800/30 border-navy-700/50 text-white placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field bg-navy-800/30 border-navy-700/50 text-white placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 w-full"
            />
          </div>
          <div className="flex justify-between items-center">
            <button type="submit" className="btn-primary">
              Login
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">
              Close
            </button>
          </div>
        </form>
        <p className="mt-4 text-gray-400">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="text-primary-400 hover:text-primary-300">
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;


