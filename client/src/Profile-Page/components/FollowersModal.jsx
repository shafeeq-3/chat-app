import React, { useState, useEffect } from 'react';
import { X, UserMinus, UserX } from 'lucide-react';
import axios from 'axios';

const FollowersModal = ({ isOpen, onClose, userId, type, onUpdate }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = type === 'followers' 
        ? `http://localhost:3000/api/user/${userId}/followers`
        : `http://localhost:3000/api/user/${userId}/following`;
      
      const { data } = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
      setLoading(false);
    }
  };

  const handleRemoveFollower = async (followerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/user/${followerId}/remove-follower`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== followerId));
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to remove follower:', error);
      alert('Failed to remove follower. Please try again.');
    }
  };

  const handleUnfollow = async (followingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/user/${followingId}/follow`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== followingId));
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to unfollow:', error);
      alert('Failed to unfollow. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden border border-white/50">
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-800 capitalize">{type}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {type} yet
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-white/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={user.name || user.username} 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span>{(user.name || user.username || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-800">{user.name || user.username}</p>
                      {user.username && user.name && (
                        <p className="text-sm text-gray-600">@{user.username}</p>
                      )}
                    </div>
                  </div>
                  
                  {type === 'followers' ? (
                    <button
                      onClick={() => handleRemoveFollower(user._id)}
                      className="px-3 py-1.5 bg-red-500/80 hover:bg-red-600/80 text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
                      title="Remove follower"
                    >
                      <UserMinus className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnfollow(user._id)}
                      className="px-3 py-1.5 bg-gray-500/80 hover:bg-gray-600/80 text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
                      title="Unfollow"
                    >
                      <UserX className="w-4 h-4" />
                      <span>Unfollow</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
