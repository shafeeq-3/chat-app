import React from 'react';

const Notifications = ({ notifications }) => {
  return (
    <div>
      {notifications.map(notif => (
        <div key={notif.id} className={`p-4 hover:bg-gray-100/50 transition-colors ${!notif.read ? 'bg-sky-50/30' : ''}`}>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">{notif.user.split(' ').map(n => n[0]).join('')}</div>
            <div className="flex-1">
              <p className="text-sm text-gray-700"><span className="font-semibold">{notif.user}</span> {notif.action}</p>
              <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
