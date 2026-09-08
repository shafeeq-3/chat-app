import React, { useState, useEffect } from 'react';
import { TrendingUp, Hash, Search, Check, UserPlus } from 'lucide-react';
import axios from 'axios';

const Sidebar = ({ addedFriendIds, setAddedFriendIds, currentUserId, onFollowUser, onTopicClick }) => {
  const [topics, setTopics] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestedUsers();
    fetchTrendingTopics();
  }, []);

  const fetchSuggestedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:3000/api/user/suggested/users?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestedFriends(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch suggested users:', error);
      setLoading(false);
    }
  };

  const fetchTrendingTopics = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:3000/api/posts/trending/topics?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopics(data.map(t => t.topic));
    } catch (error) {
      console.error('Failed to fetch trending topics:', error);
    }
  };

  const toggleFriend = async (friendId) => {
    if (addedFriendIds.includes(friendId)) {
      setAddedFriendIds(addedFriendIds.filter(id => id !== friendId));
    } else {
      setAddedFriendIds([...addedFriendIds, friendId]);
      // Also call the follow function if provided
      if (onFollowUser) {
        await onFollowUser(friendId);
      }
    }
  };

  const filteredFriends = suggestedFriends.filter(friend =>
    (friend.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (friend.username?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="hidden lg:block space-y-6">
      {/* Trending Topics */}
      <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/50">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-sky-600" />
          Trending Topics
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {topics.length > 0 ? (
            topics.map((topic, index) => (
              <button 
                key={index}
                onClick={() => onTopicClick && onTopicClick(topic)}
                className="flex items-center space-x-2 text-gray-700 hover:text-sky-600 transition-colors w-full text-left"
              >
                <Hash className="w-4 h-4" />
                <span className="text-sm">{topic}</span>
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">No trending topics yet</p>
          )}
        </div>
      </div>

      {/* Suggested Friends */}
      <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Suggested Friends</h3>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full pl-8 pr-3 py-1.5 bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300/50 text-sm"
          />
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-4">Loading...</p>
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map(friend => (
              <div key={friend._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                    {friend.profilePicture ? (
                      <img 
                        src={friend.profilePicture} 
                        alt={friend.name || friend.username} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span>{(friend.name || friend.username || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700 font-medium">{friend.name || friend.username}</span>
                    {friend.username && friend.name && (
                      <span className="text-xs text-gray-500">@{friend.username}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleFriend(friend._id)}
                  className={`px-3 py-1 ${addedFriendIds.includes(friend._id) ? 'bg-green-500/80 hover:bg-green-600/80' : 'bg-sky-500/80 hover:bg-sky-600/80'} text-white text-xs rounded-full transition-colors flex items-center space-x-1`}
                  title={addedFriendIds.includes(friend._id) ? 'Request sent' : 'Send friend request'}
                >
                  {addedFriendIds.includes(friend._id) ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              {searchQuery ? 'No users found' : 'No suggestions available'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;