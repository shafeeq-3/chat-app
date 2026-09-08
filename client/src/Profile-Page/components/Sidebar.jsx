import React from 'react';
import { Bookmark, Heart, Settings, ArrowLeft } from 'lucide-react';

const Sidebar = ({ onViewSavedPosts, onViewLikedPosts, onBackToProfile, viewMode }) => {
  return (
    <div className="hidden lg:block space-y-6">
      {/* Quick Actions */}
      <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/50">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          {viewMode !== 'info' && (
            <button 
              onClick={onBackToProfile}
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Profile</span>
            </button>
          )}
          <button 
            onClick={onViewSavedPosts}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'saved' 
                ? 'bg-sky-500 text-white' 
                : 'text-gray-700 hover:bg-white/50'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span className="text-sm">Saved Posts</span>
          </button>
          <button 
            onClick={onViewLikedPosts}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'liked' 
                ? 'bg-sky-500 text-white' 
                : 'text-gray-700 hover:bg-white/50'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm">Liked Posts</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-white/50 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/50">
        <h3 className="font-semibold text-gray-800 mb-4">Account Info</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Account Type</span>
            <span className="text-sm font-medium text-gray-800">Personal</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Verification</span>
            <span className="text-sm font-medium text-sky-600">Verified</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Privacy</span>
            <span className="text-sm font-medium text-gray-800">Public</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/30 backdrop-blur-lg rounded-xl p-4 border border-red-200/50">
        <h3 className="font-semibold text-red-800 mb-4">Danger Zone</h3>
        <div className="space-y-2">
          <button className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-700 rounded-lg transition-colors text-sm">
            Deactivate Account
          </button>
          <button className="w-full px-4 py-2 bg-red-500/80 hover:bg-red-600/80 text-white rounded-lg transition-colors text-sm">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
