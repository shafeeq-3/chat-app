import React from 'react';
import { X } from 'lucide-react';

const FriendRequests = ({ showFriendRequests, setShowFriendRequests, friendRequests, handleAcceptRequest, handleDeclineRequest }) => {
  if (!showFriendRequests) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-auto border border-white/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Friend Requests</h3>
          <button onClick={() => setShowFriendRequests(false)} className="p-2 hover:bg-gray-100/50 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-600" /></button>
        </div>
        <div className="space-y-3">
          {friendRequests.map(request => (
            <div key={request.id} className="p-4 bg-white/50 rounded-lg border border-white/30">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                  {request.profilePicture ? (
                    <img src={request.profilePicture} alt={request.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span>{request.avatar}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{request.name}</p>
                  <p className="text-sm text-gray-600">{request.username}</p>
                  <p className="text-xs text-gray-500">{request.username}</p>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <button onClick={() => handleAcceptRequest(request.id)} className="flex-1 px-3 py-2 bg-sky-500/80 hover:bg-sky-600/80 text-white rounded-lg transition-colors text-sm">Accept</button>
                <button onClick={() => handleDeclineRequest(request.id)} className="flex-1 px-3 py-2 bg-gray-300/50 hover:bg-gray-400/50 text-gray-700 rounded-lg transition-colors text-sm">Decline</button>
              </div>
            </div>
          ))}
          {friendRequests.length === 0 && <p className="text-center text-gray-500 py-8">No pending friend requests</p>}
        </div>
      </div>
    </div>
  );
};

export default FriendRequests;
