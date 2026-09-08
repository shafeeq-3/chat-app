import React from 'react';
import { Search, Play,X, Settings, Rewind, SkipBack, SkipForward, FastForward, Users, ChevronUp, ChevronDown, Camera, Send, Pause } from 'lucide-react';

const ChatArea = ({
  selectedChat,
  currentUser,
  showChatSearch,
  setShowChatSearch,
  showMusicPlayer,
  setShowMusicPlayer,
  showPlaylist,
  setShowPlaylist,
  musicSearchQuery,
  setMusicSearchQuery,
  filteredMusic,
  currentSong,
  currentTime,
  duration,
  formatTime,
  playMusic,
  togglePlayPause,
  isPlaying,
  skipToPrevious,
  skipToNext,
  rewindSeconds,
  forwardSeconds,
  isMusicShared,
  setIsMusicShared,
  searchType,
  setSearchType,
  chatSearchQuery,
  setChatSearchQuery,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  searchChatHistory,
  searchResults,
  currentSearchIndex,
  navigateSearchResults,
  messages,
  messagesContainerRef,
  highlightedMessageId,
  showChatSearchLocal,
  highlightText,
  messageInput,
  setMessageInput,
  handleSendMessage,
  handleMessageInputChange,
  fileInputRef,
  handleImageUpload,
  messagesEndRef,
  getStatusIcon,
  typingUsers
}) => {
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

  return (
    <div className="lg:col-span-2 flex flex-col">
      {selectedChat ? (
        <>
          <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/50 h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                    {selectedChat.profilePicture ? (
                      <img 
                        src={selectedChat.profilePicture} 
                        alt={selectedChat.name} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span>{selectedChat.avatar}</span>
                    )}
                  </div>
                  {getStatusIcon(selectedChat.status)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedChat.name}</p>
                  <p className="text-xs text-gray-600">
                    {selectedChat.isOnline ? (
                      <span className="text-green-600 font-medium">Active now</span>
                    ) : selectedChat.lastActive ? (
                      <span>Last seen {formatLastSeen(selectedChat.lastActive)}</span>
                    ) : (
                      <span>Offline</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => setShowChatSearch(!showChatSearch)} className={`p-2 rounded-lg transition-colors ${showChatSearch ? 'bg-sky-100/50' : 'hover:bg-white/30'}`} title="Search Chat"><Search className="w-5 h-5 text-gray-600" /></button>
                <button onClick={() => { setShowMusicPlayer(!showMusicPlayer); setShowChatSearch(false); setShowPlaylist(false); }} className={`p-2 rounded-lg transition-colors ${showMusicPlayer ? 'bg-sky-100/50' : 'hover:bg-white/30'}`} title="Music Player"><Play className="w-5 h-5 text-gray-600" /></button>
                <button className="p-2 hover:bg-white/30 rounded-lg transition-colors"><Settings className="w-5 h-5 text-gray-600" /></button>
              </div>
            </div>

            {showMusicPlayer && (
              <div className="p-3 border-b border-gray-200/30 bg-gradient-to-r from-sky-50/50 to-blue-50/50">
                {showPlaylist ? (
                  <div>
                      <div className="mb-2 flex items-center space-x-2">
                        <input type="text" value={musicSearchQuery} onChange={(e) => setMusicSearchQuery(e.target.value)} placeholder="Search music by title or artist..." className="flex-1 px-3 py-2 bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300/50" />
                        <button onClick={() => setShowPlaylist(false)} title="Close playlist" className="p-2 rounded-lg hover:bg-white/50 transition-colors">
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredMusic.map(song => (
                        <div key={song.id} className="flex items-center space-x-2 p-2 hover:bg-white/50 rounded cursor-pointer" onClick={() => playMusic(song)}>
                          <img src={song.cover} alt={song.title} className="w-8 h-8 rounded" />
                          <div className="flex-1"><p className="text-xs font-semibold">{song.title}</p><p className="text-xs text-gray-600">{song.artist}</p></div>
                          <p className="text-xs text-gray-500">{song.duration}</p>
                        </div>
                      ))}
                      {filteredMusic.length === 0 && <p className="text-center text-gray-500 py-4">No songs found</p>}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    {currentSong && (
                      <>
                        <img src={currentSong.cover} alt={currentSong.title} className="w-12 h-12 rounded-lg" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm">{currentSong.title}</p>
                          <p className="text-xs text-gray-600">{currentSong.artist}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
                            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} /></div>
                            <span className="text-xs text-gray-500">{formatTime(duration)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button onClick={rewindSeconds} className="p-1 hover:bg-white/50 rounded transition-colors" title="Rewind 10s"><Rewind className="w-4 h-4 text-gray-600" /></button>
                          <button onClick={skipToPrevious} className="p-1 hover:bg-white/50 rounded transition-colors" title="Previous"><SkipBack className="w-4 h-4 text-gray-600" /></button>
                          <button onClick={togglePlayPause} className="p-2 bg-sky-500/80 hover:bg-sky-600/80 text-white rounded-full transition-colors" title={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
                          <button onClick={skipToNext} className="p-1 hover:bg-white/50 rounded transition-colors" title="Next"><SkipForward className="w-4 h-4 text-gray-600" /></button>
                          <button onClick={forwardSeconds} className="p-1 hover:bg-white/50 rounded transition-colors" title="Forward 10s"><FastForward className="w-4 h-4 text-gray-600" /></button>
                          <button onClick={() => setIsMusicShared(!isMusicShared)} className={`p-1 ${isMusicShared ? 'bg-sky-500 text-white' : 'hover:bg-white/50'} rounded transition-colors`} title={isMusicShared ? 'Stop sharing music' : 'Share music with friend'}><Users className="w-4 h-4" /></button>
                          <button onClick={() => { setShowPlaylist(prev => !prev); setShowMusicPlayer(true); setShowChatSearch(false); }} className={`p-1 hover:bg-white/50 rounded transition-colors ${showPlaylist ? 'bg-sky-100/50' : ''}`} title={showPlaylist ? 'Close playlist' : 'Open playlist'}><Search className="w-4 h-4 text-gray-600" /></button>
                        </div>
                      </>
                    )}

                    {!currentSong && (
                      <div className="flex-1">
                        <input type="text" value={musicSearchQuery} onChange={(e) => setMusicSearchQuery(e.target.value)} placeholder="Search music by title or artist..." className="w-full px-3 py-2 bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300/50" />
                        <div className="max-h-32 overflow-y-auto mt-2">
                          {filteredMusic.map(song => (
                            <div key={song.id} className="flex items-center space-x-2 p-2 hover:bg-white/50 rounded cursor-pointer" onClick={() => playMusic(song)}>
                              <img src={song.cover} alt={song.title} className="w-8 h-8 rounded" />
                              <div className="flex-1"><p className="text-xs font-semibold">{song.title}</p><p className="text-xs text-gray-600">{song.artist}</p></div>
                              <p className="text-xs text-gray-500">{song.duration}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {showChatSearch && (
              <div className="p-3 border-b border-gray-200/30">
                <div className="flex space-x-2 mb-2">
                  <button className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${searchType === 'text' ? 'bg-sky-500 text-white' : 'bg-white/50 text-gray-700 hover:bg-sky-100/50'}`} onClick={() => { setSearchType('text'); setChatSearchQuery(''); setSelectedDate(''); setSelectedTime(''); }} >Text</button>
                  <button className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${searchType === 'date' ? 'bg-sky-500 text-white' : 'bg-white/50 text-gray-700 hover:bg-sky-100/50'}`} onClick={() => { setSearchType('date'); setChatSearchQuery(''); setSelectedDate(''); setSelectedTime(''); }} >Date</button>
                  <button className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${searchType === 'time' ? 'bg-sky-500 text-white' : 'bg-white/50 text-gray-700 hover:bg-sky-100/50'}`} onClick={() => { setSearchType('time'); setChatSearchQuery(''); setSelectedDate(''); setSelectedTime(''); }} >Time</button>
                  <button onClick={() => { setShowChatSearch(false); setChatSearchQuery(''); setSelectedDate(''); setSelectedTime(''); }} className="ml-auto p-2 rounded-lg hover:bg-gray-200 transition-colors" title="Close Search"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex items-center space-x-2">
                  {searchType === 'text' && (<input type="text" value={chatSearchQuery} onChange={e => { setChatSearchQuery(e.target.value); searchChatHistory(e.target.value, 'text'); }} placeholder="Search by text..." className="flex-1 px-3 py-2 bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300/50" />)}
                  {searchType === 'date' && (<input type="date" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); searchChatHistory(e.target.value, 'date'); }} className="flex-1 px-3 py-2 bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300/50" />)}
                  {searchType === 'time' && (<input type="time" value={selectedTime} onChange={e => { setSelectedTime(e.target.value); searchChatHistory(e.target.value, 'time'); }} className="flex-1 px-3 py-2 bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300/50" />)}
                  <button onClick={() => navigateSearchResults('prev')} disabled={searchResults.length === 0} className={`p-2 rounded-lg transition-colors ${searchResults.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-sky-600'}`} title="Previous Result"><ChevronUp className="w-5 h-5" /></button>
                  <button onClick={() => navigateSearchResults('next')} disabled={searchResults.length === 0} className={`p-2 rounded-lg transition-colors ${searchResults.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-sky-600'}`} title="Next Result"><ChevronDown className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3">
              {(messages[selectedChat.id] || []).map(message => {
                const isMe = message.sender === 'me';
                const isHighlighted = highlightedMessageId === message.id;
                return (
                  <div key={message.id} id={`message-${message.id}`} className={`flex items-end space-x-2 ${isMe ? 'justify-end' : 'justify-start'} ${isHighlighted ? 'bg-yellow-200 rounded-lg p-1' : ''}`}>
                    {!isMe && (
                      <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                        {selectedChat.profilePicture ? (
                          <img 
                            src={selectedChat.profilePicture} 
                            alt={selectedChat.name} 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span>{selectedChat.avatar}</span>
                        )}
                      </div>
                    )}
                    <div className={`max-w-xs sm:max-w-md rounded-lg p-3 ${isMe ? 'bg-sky-500/80 text-white' : 'bg-white/50 text-gray-800'}`}>
                      {message.image ? (<img src={message.image} alt="Shared" className="rounded-lg mb-2 max-w-full h-auto" />) : (<p className="text-sm break-words whitespace-pre-wrap">{showChatSearch ? highlightText(message.content, chatSearchQuery) : message.content}</p>)}
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${isMe ? 'text-sky-100' : 'text-gray-500'}`}>{message.time}</p>
                        {isMe && (
                          <span className="text-xs ml-2">
                            {message.read ? (
                              <span className="text-sky-100" title="Seen">✓✓</span>
                            ) : (
                              <span className="text-sky-200" title="Delivered">✓</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    {isMe && (
                      <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                        {currentUser?.profilePicture ? (
                          <img src={currentUser.profilePicture} alt={currentUser.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{(currentUser?.name || 'U').slice(0,2).toUpperCase()}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Typing Indicator */}
              {typingUsers[selectedChat?.id] && (
                <div className="flex items-end space-x-2 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                    {selectedChat.profilePicture ? (
                      <img 
                        src={selectedChat.profilePicture} 
                        alt={selectedChat.name} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span>{selectedChat.avatar}</span>
                    )}
                  </div>
                  <div className="bg-white/50 rounded-lg p-3 flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200/30">
              <div className="flex items-center space-x-2">
                <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/30 rounded-lg transition-colors"><Camera className="w-5 h-5 text-gray-600" /></button>
                <input 
                  type="text" 
                  value={messageInput} 
                  onChange={handleMessageInputChange} 
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                  placeholder="Type a message..." 
                  className="flex-1 px-4 py-2 bg-white/50 border border-gray-200/50 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-300/50" 
                />
                <button onClick={handleSendMessage} className="p-2 bg-sky-500/80 hover:bg-sky-600/80 text-white rounded-lg transition-colors"><Send className="w-5 h-5" /></button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white/30 backdrop-blur-lg rounded-xl p-8 border border-white/50 h-[600px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-200/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a conversation</h3>
            <p className="text-gray-600">Choose a friend from the list to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
