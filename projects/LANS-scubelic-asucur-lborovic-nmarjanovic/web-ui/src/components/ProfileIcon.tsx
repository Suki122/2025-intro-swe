
import React from 'react';
import { User } from 'lucide-react';

interface ProfileIconProps {
  onClick: () => void;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className="p-2 rounded-full hover:bg-gray-200">
      <User className="h-6 w-6" />
    </button>
  );
};

export default ProfileIcon;
