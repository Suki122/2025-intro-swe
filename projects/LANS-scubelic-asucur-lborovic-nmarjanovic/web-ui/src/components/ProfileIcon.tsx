
import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import ApiKeysModal from './modals/ApiKeysModal';

interface ProfileIconProps {
  onClick: () => void;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ onClick }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.reload();
  };

  const handleIconClick = () => {
    if (isLoggedIn) {
      setShowApiKeysModal(true);
    } else {
      onClick();
    }
  };

  return (
    <>
      <div className="relative">
        <button onClick={handleIconClick} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <User className="h-6 w-6 text-gray-800 dark:text-gray-200" />
        </button>
        {isLoggedIn && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-navy-800 rounded-md shadow-lg py-1 z-50">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-navy-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      {showApiKeysModal && <ApiKeysModal onClose={() => setShowApiKeysModal(false)} />}
    </>
  );
};

export default ProfileIcon;

