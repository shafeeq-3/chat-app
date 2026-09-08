import React from 'react';
import {
  ArrowLeft, Menu, Home, Users, Bell, Mail, Settings, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({
  showMobileMenu,
  setShowMobileMenu,
  showNotifications,
  setShowNotifications,
  showInbox,
  setShowInbox,
  setShowProfileMenu,
  notifications,
  messages,
  handleLogout
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/30 backdrop-blur-lg border-b border-white/50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-600 hover:text-sky-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-700 hover:text-sky-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <h1 className="text-xl sm:text-2xl font-bold text-sky-600">Profile</h1>
            </button>
            <nav className="hidden lg:flex space-x-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-700 hover:text-sky-600 transition-colors"
              >
                <Home className="w-5 h-5 " />
                <span>Home</span>
              </button>
              <button 
                onClick={() => navigate("/friends")} 
                className="flex items-center space-x-2 text-gray-700 hover:text-sky-600 transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>Friends</span>
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowInbox(false);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 text-gray-600 hover:text-sky-600 transition-colors"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 sm:w-80 bg-white/90 backdrop-blur-lg rounded-lg shadow-xl border border-white/50 max-h-[80vh] overflow-auto">
                  <div className="p-4 border-b border-gray-200/30">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-4 hover:bg-gray-100/50 transition-colors ${!notif.read ? 'bg-sky-50/30' : ''}`}>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {notif.user.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">{notif.user}</span> {notif.action}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Inbox */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowInbox(!showInbox);
                  setShowNotifications(false);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 text-gray-600 hover:text-sky-600 transition-colors"
              >
                <Mail className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
              </button>
              {showInbox && (
                <div className="absolute right-0 mt-2 w-64 sm:w-80 bg-white/90 backdrop-blur-lg rounded-lg shadow-xl border border-white/50 max-h-[80vh] overflow-auto">
                  <div className="p-4 border-b border-gray-200/30 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Messages</h3>
                    <button className="text-xs text-sky-600 hover:text-sky-700">View all</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {messages.map(msg => (
                      <div key={msg.id} className={`p-4 hover:bg-gray-100/50 transition-colors cursor-pointer ${msg.unread ? 'bg-sky-50/30' : ''}`}>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                            {msg.profilePicture ? (
                              <img
                                src={msg.profilePicture}
                                alt={msg.user}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span>{msg.user.split(' ').map(n => n[0]).join('')}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-800">{msg.user}</p>
                              <p className="text-xs text-gray-500">{msg.time}</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{msg.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="hidden sm:block p-2 text-gray-600 hover:text-sky-600 transition-colors">
              <Settings className="w-6 h-6" />
            </button>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-red-500/80 hover:bg-red-600/80 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden lg:inline">Logout</span>
            </button>
            <button
              onClick={handleLogout}
              className="sm:hidden p-2 bg-red-500/80 hover:bg-red-600/80 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
