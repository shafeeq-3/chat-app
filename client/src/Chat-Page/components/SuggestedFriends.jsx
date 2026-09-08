import React from 'react';
import { UserPlus } from 'lucide-react';

const SuggestedFriends = ({ suggestedFriends, handleAddFriend }) => {
  return (
    <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/50">
      <h3 className="font-semibold text-gray-800 mb-3">Suggested Friends</h3>
      <div className="space-y-2">
        {suggestedFriends.map(friend => (
          <div key={friend.id} className="p-3 bg-white/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                {friend.profilePicture ? (
                  <img src={friend.profilePicture} alt={friend.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span>{friend.avatar}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{friend.name}</p>
                <p className="text-xs text-gray-600">{friend.username}</p>
              </div>
              <button onClick={() => handleAddFriend(friend.id)} className="p-2 text-sky-600 hover:bg-sky-100/50 rounded-lg transition-colors">
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedFriends;
