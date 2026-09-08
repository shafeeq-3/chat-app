import React from 'react';
import { Home, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileMenu = ({ showMobileMenu }) => {
  const navigate = useNavigate();

  if (!showMobileMenu) return null;

  return (
    <div className="lg:hidden fixed inset-x-0 top-16 z-40 bg-white/90 backdrop-blur-lg border-b border-white/50">
      <div className="p-4 space-y-4">
        <nav className="space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
          <button 
            onClick={() => navigate('/friends')}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Friends</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
