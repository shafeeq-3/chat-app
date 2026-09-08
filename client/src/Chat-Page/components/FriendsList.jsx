import React from 'react';
import { Search } from 'lucide-react';

const FriendsList = ({ searchQuery, setSearchQuery, filteredFriends, selectedChat, setSelectedChat, getStatusIcon }) => {
  const formatLastSeen = (lastActive) => {
    if (!lastActive) return 'Offline';
    const now = new Date();
    const lastSeenDate = new Date(lastActive);
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return lastSeenDate.toLocaleDateString();
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const msgDate = new Date(timestamp);
    const diffMs = now - msgDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d`;
    return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/50">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search friends..."
          className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300/50"
        />
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredFriends.map(friend => (
          <button
            key={friend.id}
            onClick={() => setSelectedChat(friend)}
            className={`w-full p-3 rounded-lg transition-colors flex items-center space-x-3 ${selectedChat?.id === friend.id ? 'bg-sky-100/50' : 'hover:bg-white/50'}`}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                {friend.profilePicture ? (
                  <img 
                    src={friend.profilePicture} 
                    alt={friend.name} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{friend.avatar}</span>
                )}
              </div>
              {/* status dot based on presence */}
              <div className="absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: friend.isOnline ? '#22c55e' : '#9ca3af' }} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-gray-800 text-sm">{friend.name}</p>
              <p className="text-xs text-gray-600 truncate">{friend.lastMessagePreview || friend.lastMessage || 'No messages yet'}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-500 mb-1">
                {friend.lastMessageAt ? formatMessageTime(friend.lastMessageAt) : ''}
              </p>
              {friend.unreadCount > 0 && (
                <span className="inline-block px-2 py-0.5 bg-sky-500 text-white text-xs rounded-full min-w-[20px] text-center">
                  {friend.unreadCount > 99 ? '99+' : friend.unreadCount}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;
