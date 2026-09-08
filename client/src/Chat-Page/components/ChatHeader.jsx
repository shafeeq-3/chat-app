import React from 'react';
import { ArrowLeft, Menu, UserPlus, Bell, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatHeader = ({
    user,
    onToggleMobileMenu,
    onBack,
    onToggleFriendRequests,
    friendRequestsLength,
    onToggleNotifications,
    showNotifications,
    notifications,
    onToggleProfileMenu,
    showProfileMenu,
    showFriendRequests
}) => {
    const navigate = useNavigate();
    // if (showFriendRequests) return null;


    return (
        <header className="sticky top-0 z-50 bg-white/30 backdrop-blur-lg border-b border-white/50">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <button onClick={onToggleMobileMenu} className="lg:hidden p-2 text-gray-600 hover:text-sky-600 transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        <button onClick={onBack} className="flex items-center space-x-2 text-gray-700 hover:text-sky-600 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <h1 className="text-xl sm:text-2xl font-bold text-sky-600">Friends & Chat</h1>
                        </button>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button onClick={onToggleFriendRequests} className="relative p-2 text-gray-600 hover:text-sky-600 transition-colors">
                            <UserPlus className="w-6 h-6" />
                            {friendRequestsLength > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
                        </button>

                        <div className="relative">
                            <button onClick={onToggleNotifications} className="relative p-2 text-gray-600 hover:text-sky-600 transition-colors">
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
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
                                                        <p className="text-sm text-gray-700"><span className="font-semibold">{notif.user}</span> {notif.action}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
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

                        <div className="relative hidden sm:block">
                            <button onClick={onToggleProfileMenu} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/30 transition-colors">
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
                                    <button onClick={() => navigate("/profile")} className="w-full text-left px-4 py-2 hover:bg-gray-100/50 text-gray-700 transition-colors">Profile</button>
                                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100/50 text-gray-700 transition-colors">Settings</button>
                                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100/50 text-gray-700 transition-colors">Help</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ChatHeader;
