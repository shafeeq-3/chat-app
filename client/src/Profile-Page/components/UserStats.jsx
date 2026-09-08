import React from 'react';

const UserStats = ({ userStats, onFollowersClick, onFollowingClick }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-white/30 backdrop-blur-lg rounded-lg p-4 text-center border border-white/50">
        <p className="text-2xl font-bold text-gray-800">{userStats.posts}</p>
        <p className="text-sm text-gray-600 mt-1">Posts</p>
      </div>
      <button
        onClick={onFollowersClick}
        className="bg-white/30 backdrop-blur-lg rounded-lg p-4 text-center border border-white/50 hover:bg-white/40 transition-colors cursor-pointer"
      >
        <p className="text-2xl font-bold text-gray-800">{userStats.followers}</p>
        <p className="text-sm text-gray-600 mt-1">Followers</p>
      </button>
      <button
        onClick={onFollowingClick}
        className="bg-white/30 backdrop-blur-lg rounded-lg p-4 text-center border border-white/50 hover:bg-white/40 transition-colors cursor-pointer"
      >
        <p className="text-2xl font-bold text-gray-800">{userStats.following}</p>
        <p className="text-sm text-gray-600 mt-1">Following</p>
      </button>
      <div className="bg-white/30 backdrop-blur-lg rounded-lg p-4 text-center border border-white/50">
        <p className="text-2xl font-bold text-gray-800">{userStats.likes}</p>
        <p className="text-sm text-gray-600 mt-1">Likes</p>
      </div>
    </div>
  );
};

export default UserStats;
