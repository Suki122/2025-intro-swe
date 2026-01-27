
import React, { useState } from 'react';
import { register } from '../../services/api';

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await register(email, password);
      onSwitchToLogin();
    } catch (err) {
      setError('Failed to register. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="glass-card p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Register</h2>
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
          <div className="mb-4">
            <label className="block text-gray-300">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field bg-navy-800/30 border-navy-700/50 text-white placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 w-full"
            />
          </div>
          <div className="flex justify-between items-center">
            <button type="submit" className="btn-primary">
              Register
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">
              Close
            </button>
          </div>
        </form>
        <p className="mt-4 text-gray-400">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-primary-400 hover:text-primary-300">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;


