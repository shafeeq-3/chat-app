import React from 'react';
import { Home, Users, TrendingUp, Search } from 'lucide-react';

const MobileMenu = ({ showMobileMenu, searchQuery, setSearchQuery }) => {
  if (!showMobileMenu) return null;

  return (
    <div className="lg:hidden fixed inset-x-0 top-16 z-40 bg-white/90 backdrop-blur-lg border-b border-white/50">
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users or topics..."
            className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200/50 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-300/50 text-gray-700 placeholder-gray-400"
          />
        </div>
        <nav className="space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg transition-colors">
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg transition-colors">
            <Users className="w-5 h-5" />
            <span>Friends</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg transition-colors">
            <TrendingUp className="w-5 h-5" />
            <span>Trending</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;