import React from 'react';
import { Home, Users, TrendingUp, Search, Plus, Bell, Mail, Settings, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({
  user,
  searchQuery,
  setSearchQuery,
  setShowExpandedCreate,
  showNotifications,
  setShowNotifications,
  showInbox,
  setShowInbox,
  showProfileMenu,
  setShowProfileMenu,
  setShowMobileMenu,
  showMobileMenu,
  handleLogout,
  notifications,
  messages
}) => {

  const navigate = useNavigate()
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
            <h1 className="text-xl sm:text-2xl font-bold text-sky-600">genZ Chat</h1>
            <nav className="hidden lg:flex space-x-6">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-sky-600 transition-colors">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
              <button onClick={()=> navigate("/friends")} className="flex items-center space-x-2 text-gray-700 hover:text-sky-600 transition-colors">
                <Users className="w-5 h-5" />
                <span>Friends</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-700 hover:text-sky-600 transition-colors">
                <TrendingUp className="w-5 h-5" />
                <span>Trending</span>
              </button>
            </nav>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-4 sm:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users or topics..."
                className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200/50 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-300/50 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setShowExpandedCreate(true)}
              className="hidden sm:flex items-center space-x-2 px-3 sm:px-4 py-2 bg-sky-500/80 hover:bg-sky-600/80 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden lg:inline">Create</span>
            </button>
            <button
              onClick={() => setShowExpandedCreate(true)}
              className="sm:hidden p-2 bg-sky-500/80 hover:bg-sky-600/80 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>

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
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {msg.user.split(' ').map(n => n[0]).join('')}
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

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                  setShowInbox(false);
                }}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>{user?.name ? user.name.split(' ').map(n => n.charAt(0)).slice(0,2).join('') : 'U'}</span>
                  )}
                </div>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg rounded-lg shadow-xl border border-white/50">
                  <button onClick={()=> navigate("/profile")} className="w-full text-left px-4 py-2 hover:bg-gray-100/50 text-gray-700 transition-colors">
                    Profile
                  </button>
                  <button  className="w-full text-left px-4 py-2 hover:bg-gray-100/50 text-gray-700 transition-colors">
                    Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100/50 text-gray-700 transition-colors">
                    Help
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;