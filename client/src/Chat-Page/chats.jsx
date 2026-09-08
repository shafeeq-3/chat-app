import React, { useState, useRef, useEffect } from 'react';
import { Circle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  ChatHeader,
  FriendsList,
  SuggestedFriends,
  ChatArea,
  FriendRequests,
  Notifications
} from './components';

const FriendsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [searchType, setSearchType] = useState('text'); // 'text' | 'date' | 'time'
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMusicShared, setIsMusicShared] = useState(false);
  const [sharedMusicData, setSharedMusicData] = useState(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const audioRef = useRef(null);
  let [list, setList] = useState([])
  const [friends, setFriends] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef({});
  const socketRef = useRef(null);





  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
    return;
  }
  useEffect(() => {


    const fetchUser = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/api/user/getuser', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(data);
        // init socket
        if (!socketRef.current) {
          const s = io('http://localhost:3000', { transports: ['websocket'] });
          socketRef.current = s;
          s.on('connect', () => {
            s.emit('join', data._id);
          });
          s.on('new_message', (msg) => {
            const otherId = msg.sender === data._id ? msg.recipient : msg.sender;
            setMessages(prev => {
              let thread = prev[otherId] || [];
              if (msg.clientMessageId) {
                thread = thread.filter(m => m.id !== msg.clientMessageId);
              }
              return { ...prev, [otherId]: [...thread, mapServerMessage(msg, data._id)] };
            });
            // update friends preview
            setFriends(prev => prev.map(f => f.id === otherId ? { ...f, lastMessagePreview: msg.content || (msg.imageUrl ? '📷 Image' : ''), lastMessageAt: msg.createdAt } : f));
          });
          s.on('presence_update', (p) => {
            setFriends(prev => prev.map(f => f.id === p.userId ? { ...f, isOnline: p.isOnline, lastActive: p.lastActive || f.lastActive } : f));
          });
          s.on('user_typing', (data) => {
            setTypingUsers(prev => ({ ...prev, [data.userId]: data.isTyping }));
            if (data.isTyping) {
              if (typingTimeoutRef.current[data.userId]) {
                clearTimeout(typingTimeoutRef.current[data.userId]);
              }
              typingTimeoutRef.current[data.userId] = setTimeout(() => {
                setTypingUsers(prev => ({ ...prev, [data.userId]: false }));
              }, 3000);
            }
          });
          s.on('messages_read', (data) => {
            setMessages(prev => {
              const updated = { ...prev };
              Object.keys(updated).forEach(friendId => {
                if (friendId === data.userId) {
                  updated[friendId] = updated[friendId].map(msg => 
                    msg.sender === 'me' ? { ...msg, read: true } : msg
                  );
                }
              });
              return updated;
            });
          });
        }

        // fetch real friends, requests, suggested
        const [friendsRes, requestsRes, suggestedRes] = await Promise.all([
          axios.get('http://localhost:3000/api/chat/friends', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3000/api/chat/friend-requests', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3000/api/user/suggested/users', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setFriends(friendsRes.data.map(u => ({ id: u._id, name: u.name, username: `@${u.username || ''}`, profilePicture: u.profilePicture || '', avatar: (u.name || 'U').slice(0,2).toUpperCase(), lastMessagePreview: u.lastMessagePreview || '', lastMessageAt: u.lastMessageAt || null, isOnline: !!u.isOnline, lastActive: u.lastActive || null, unreadCount: u.unreadCount || 0 })));
        setFriendRequests(requestsRes.data.map(u => ({ id: u._id, name: u.name, username: `@${u.username || ''}`, profilePicture: u.profilePicture || '', avatar: (u.name || 'U').slice(0,2).toUpperCase() })));
        setSuggestedFriends(suggestedRes.data.map(u => ({ id: u._id, name: u.name, username: `@${u.username || ''}`, profilePicture: u.profilePicture || '', avatar: (u.name || 'U').slice(0,2).toUpperCase() })));



      } catch (error) {
        console.error(error);
        // navigate('/login');
      }
    };
    fetchUser();
  }, []);

  const mapServerMessage = (msg, myId) => ({
    id: msg._id,
    sender: msg.sender === myId ? 'me' : 'friend',
    content: msg.content,
    image: msg.imageUrl || null,
    read: !!msg.readAt,
    time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date(msg.createdAt).toISOString().split('T')[0]
  });

  useEffect(() => {
    const load = async () => {
      if (!selectedChat || !user) return;
      const friendId = selectedChat.id || selectedChat;
      if (messages[friendId]) {
        // Mark messages as read when opening chat
        if (socketRef.current) {
          socketRef.current.emit('mark_read', { userId: user._id, otherUserId: friendId });
        }
        // Update unread count in friends list
        setFriends(prev => prev.map(f => f.id === friendId ? { ...f, unreadCount: 0 } : f));
        return;
      }
      try {
        const { data } = await axios.get(`http://localhost:3000/api/chat/messages/${friendId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const mapped = data.map(d => mapServerMessage(d, user._id));
        setMessages(prev => ({ ...prev, [friendId]: mapped }));
        // Mark messages as read
        if (socketRef.current) {
          socketRef.current.emit('mark_read', { userId: user._id, otherUserId: friendId });
        }
        // Update unread count
        setFriends(prev => prev.map(f => f.id === friendId ? { ...f, unreadCount: 0 } : f));
      } catch (e) { console.error(e); }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat, user]);

  // Typing indicator handler
  const handleTyping = (isTyping) => {
    if (!selectedChat || !user || !socketRef.current) return;
    socketRef.current.emit('typing', {
      userId: user._id,
      recipientId: selectedChat.id,
      isTyping
    });
  };

  // Handle message input change with typing indicator
  const handleMessageInputChange = (e) => {
    setMessageInput(e.target.value);
    handleTyping(true);
  };



  // useEffect(() => {
  //   const fetchFriends = async () => {
  //     const { data } = await axios.get(`http://localhost:3000/api/`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       }
  //     })
  //     setFriends(data)
  //   }
  //   fetchFriends()
  // }, [])




  const [musicPlaylist, setMusicPlaylist] = useState([
    {
      id: 1,
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      duration: '3:20',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      cover: 'https://via.placeholder.com/60x60/3b82f6/ffffff?text=BL'
    },
    {
      id: 2,
      title: 'Watermelon Sugar',
      artist: 'Harry Styles',
      duration: '2:54',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      cover: 'https://via.placeholder.com/60x60/10b981/ffffff?text=WS'
    },
    {
      id: 3,
      title: 'Levitating',
      artist: 'Dua Lipa',
      duration: '3:23',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      cover: 'https://via.placeholder.com/60x60/f59e0b/ffffff?text=LV'
    },
    {
      id: 4,
      title: 'Good 4 U',
      artist: 'Olivia Rodrigo',
      duration: '2:58',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      cover: 'https://via.placeholder.com/60x60/ef4444/ffffff?text=G4U'
    },
    {
      id: 5,
      title: 'Stay',
      artist: 'The Kid LAROI & Justin Bieber',
      duration: '2:21',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      cover: 'https://via.placeholder.com/60x60/8b5cf6/ffffff?text=ST'
    },
    {
      id: 6,
      title: 'Heat Waves',
      artist: 'Glass Animals',
      duration: '3:58',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      cover: 'https://via.placeholder.com/60x60/06b6d4/ffffff?text=HW'
    }
  ]);


  const [friendRequests, setFriendRequests] = useState([]);

  // Extended dummy chat for testing search functionality
  const [messages, setMessages] = useState({});

  const [suggestedFriends, setSuggestedFriends] = useState([]);

  const notifications = [
    { id: 1, user: 'Alex Turner', action: 'sent you a message', time: '5 min ago', read: false },
    { id: 2, user: 'Lisa Wong', action: 'liked your post', time: '1 hour ago', read: false },
  ];

  // Music functionality
  const filteredMusic = musicPlaylist.filter(song =>
    song.title.toLowerCase().includes(musicSearchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(musicSearchQuery.toLowerCase())
  );

  const playMusic = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setShowMusicPlayer(true);
    setShowChatSearch(false);
    setShowPlaylist(false);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const skipToNext = () => {
    if (currentSong) {
      const currentIndex = musicPlaylist.findIndex(song => song.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % musicPlaylist.length;
      playMusic(musicPlaylist[nextIndex]);
    }
  };

  const skipToPrevious = () => {
    if (currentSong) {
      const currentIndex = musicPlaylist.findIndex(song => song.id === currentSong.id);
      const prevIndex = currentIndex === 0 ? musicPlaylist.length - 1 : currentIndex - 1;
      playMusic(musicPlaylist[prevIndex]);
    }
  };

  const forwardSeconds = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
    }
  };

  const rewindSeconds = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [currentSong]);

  // Search functionality
  const searchChatHistory = (query, type = 'text') => {
    if (!selectedChat) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      setHighlightedMessageId(null);
      return;
    }

    const chatMessages = messages[selectedChat.id] || [];
    let results = [];

    // Helper functions
    const normalizeTime = (timeStr) => {
      if (!timeStr) return 0;
      // Accepts 'HH:MM' (24h) or 'HH:MM AM/PM'
      let [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period) {
        if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
        if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      return hours * 60 + minutes;
    };
    const normalizeDate = (dateStr) => new Date(dateStr).getTime();

    if (type === 'date' && query) {
      const targetDate = normalizeDate(query);
      const messagesWithDiff = chatMessages.map((message, index) => ({
        message,
        index,
        diff: Math.abs(normalizeDate(message.date) - targetDate)
      }));
      messagesWithDiff.sort((a, b) => a.diff - b.diff);
      results = messagesWithDiff.slice(0, 5).map(item => ({
        messageId: item.message.id,
        index: item.index,
        type: 'date',
        match: query,
        diff: Math.floor(item.diff / (1000 * 60 * 60 * 24))
      }));
    } else if (type === 'time' && query) {
      const targetTime = normalizeTime(query);
      const messagesWithDiff = chatMessages.map((message, index) => ({
        message,
        index,
        diff: Math.abs(normalizeTime(message.time) - targetTime)
      }));
      messagesWithDiff.sort((a, b) => a.diff - b.diff);
      results = messagesWithDiff.slice(0, 5).map(item => ({
        messageId: item.message.id,
        index: item.index,
        type: 'time',
        match: query,
        diff: item.diff
      }));
    } else if (type === 'text' && query.trim()) {
      chatMessages.forEach((message, index) => {
        if (message.content.toLowerCase().includes(query.toLowerCase())) {
          results.push({ messageId: message.id, index, type: 'content', match: query });
        }
      });
    } else {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      setHighlightedMessageId(null);
      return;
    }

    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
    if (results.length > 0) {
      scrollToMessage(results[0].messageId);
    }
  };

  const scrollToMessage = (messageId) => {
    setHighlightedMessageId(messageId);
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement && messagesContainerRef.current) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Show time difference tooltip if available
      const result = searchResults.find(r => r.messageId === messageId);
      if (result && (result.type === 'time' || result.type === 'date')) {
        const diffText = result.type === 'date'
          ? `${result.diff} day${result.diff !== 1 ? 's' : ''} ${result.diff > 0 ? 'from' : 'to'} requested date`
          : `${result.diff} minute${result.diff !== 1 ? 's' : ''} ${result.diff > 0 ? 'from' : 'to'} requested time`;

        // You might want to show this difference in the UI
        // For now, we'll just console.log it
        console.log(diffText);
      }

      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 3000);
    }
  };

  const navigateSearchResults = (direction) => {
    if (searchResults.length === 0) return;
    let newIndex;
    if (direction === 'next') {
      newIndex = currentSearchIndex < searchResults.length - 1 ? currentSearchIndex + 1 : 0;
    } else {
      newIndex = currentSearchIndex > 0 ? currentSearchIndex - 1 : searchResults.length - 1;
    }
    setCurrentSearchIndex(newIndex);
    scrollToMessage(searchResults[newIndex].messageId);
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-300 text-gray-900 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || !user) return;
    const content = messageInput.trim();
    const friendId = selectedChat.id || selectedChat;
    const clientMessageId = `temp-${Date.now()}`;
    setMessageInput('');
    const optimistic = {
      id: clientMessageId,
      sender: 'me',
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0]
    };
    setMessages(prev => ({ ...prev, [friendId]: [...(prev[friendId] || []), optimistic] }));
    scrollToBottom();
    try {
      if (socketRef.current) {
        socketRef.current.emit('send_message', { senderId: user._id, recipientId: friendId, content, clientMessageId });
      } else {
        await axios.post('http://localhost:3000/api/chat/messages', { recipientId: friendId, content }, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (e) { console.error(e); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat || !user) return;
    
    const friendId = selectedChat.id || selectedChat;
    const clientMessageId = `temp-img-${Date.now()}`;
    
    // Show optimistic image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const optimistic = {
        id: clientMessageId,
        sender: 'me',
        content: '',
        image: reader.result,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0]
      };
      setMessages(prev => ({
        ...prev,
        [friendId]: [...(prev[friendId] || []), optimistic]
      }));
    };
    reader.readAsDataURL(file);
    
    // Upload image to server
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const { data } = await axios.post('http://localhost:3000/api/chat/upload-image', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Send message with uploaded image URL
      if (socketRef.current) {
        socketRef.current.emit('send_message', {
          senderId: user._id,
          recipientId: friendId,
          content: '',
          imageUrl: data.imageUrl,
          clientMessageId
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // Remove optimistic message on error
      setMessages(prev => ({
        ...prev,
        [friendId]: (prev[friendId] || []).filter(m => m.id !== clientMessageId)
      }));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!showChatSearch && !showMusicPlayer) {
      scrollToBottom();
    }
  }, [messages, selectedChat, showChatSearch, showMusicPlayer]);

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post(`http://localhost:3000/api/user/${requestId}/follow`, {}, { headers: { Authorization: `Bearer ${token}` } });
      // refetch friends and requests to reflect server state
      const [friendsRes, requestsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/chat/friends', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/api/chat/friend-requests', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setFriends(friendsRes.data.map(u => ({ id: u._id, name: u.name, username: `@${u.username || ''}`, profilePicture: u.profilePicture || '', avatar: (u.name || 'U').slice(0,2).toUpperCase(), lastMessagePreview: u.lastMessagePreview || '', lastMessageAt: u.lastMessageAt || null })));
      setFriendRequests(requestsRes.data.map(u => ({ id: u._id, name: u.name, username: `@${u.username || ''}`, profilePicture: u.profilePicture || '', avatar: (u.name || 'U').slice(0,2).toUpperCase() })));
    } catch (e) { console.error(e); }
  };

  const handleDeclineRequest = (requestId) => {
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleAddFriend = async (friendId) => {
    try {
      await axios.post(`http://localhost:3000/api/user/${friendId}/follow`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const [friendsRes, suggestedRes] = await Promise.all([
        axios.get('http://localhost:3000/api/chat/friends', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/api/user/suggested/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setFriends(friendsRes.data.map(u => ({ id: u._id, name: u.name, username: `@${u.username || ''}`, profilePicture: u.profilePicture || '', avatar: (u.name || 'U').slice(0,2).toUpperCase(), lastMessagePreview: u.lastMessagePreview || '', lastMessageAt: u.lastMessageAt || null })));
      setSuggestedFriends(suggestedRes.data.map(u => ({ id: u._id, name: u.name, username: `@${u.username || ''}`, profilePicture: u.profilePicture || '', avatar: (u.name || 'U').slice(0,2).toUpperCase() })));
    } catch (e) { console.error(e); }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <Circle className="w-3 h-3 fill-green-500 text-green-500" />;
      case 'away':
        return <Circle className="w-3 h-3 fill-yellow-500 text-yellow-500" />;
      case 'offline':
        return <Circle className="w-3 h-3 fill-gray-400 text-gray-400" />;
      default:
        return null;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      <ChatHeader
        user={user}
        onToggleMobileMenu={() => setShowMobileMenu(prev => !prev)}
        onBack={() => window.history.back()}
        onToggleFriendRequests={() => setShowFriendRequests(prev => !prev)}
        friendRequestsLength={friendRequests.length}
        onToggleNotifications={() => { setShowNotifications(prev => !prev); setShowInbox(false); setShowProfileMenu(false); }}
        showNotifications={showNotifications}
        notifications={notifications}
        onToggleProfileMenu={() => { setShowProfileMenu(prev => !prev); setShowNotifications(false); setShowInbox(false); }}
        showProfileMenu={showProfileMenu}
      />

      <FriendRequests showFriendRequests={showFriendRequests} setShowFriendRequests={setShowFriendRequests} friendRequests={friendRequests} handleAcceptRequest={handleAcceptRequest} handleDeclineRequest={handleDeclineRequest} />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-1 space-y-4">
            <FriendsList searchQuery={searchQuery} setSearchQuery={setSearchQuery} filteredFriends={filteredFriends} selectedChat={selectedChat} setSelectedChat={setSelectedChat} getStatusIcon={getStatusIcon} />
            <SuggestedFriends suggestedFriends={suggestedFriends} handleAddFriend={handleAddFriend} />
          </div>

          <ChatArea
            selectedChat={selectedChat}
            currentUser={user}
            showChatSearch={showChatSearch}
            setShowChatSearch={setShowChatSearch}
            searchChatHistory={searchChatHistory}
            showMusicPlayer={showMusicPlayer}
            setShowMusicPlayer={setShowMusicPlayer}
            showPlaylist={showPlaylist}
            setShowPlaylist={setShowPlaylist}
            musicSearchQuery={musicSearchQuery}
            setMusicSearchQuery={setMusicSearchQuery}
            filteredMusic={filteredMusic}
            currentSong={currentSong}
            currentTime={currentTime}
            duration={duration}
            formatTime={formatTime}
            playMusic={playMusic}
            togglePlayPause={togglePlayPause}
            isPlaying={isPlaying}
            skipToPrevious={skipToPrevious}
            skipToNext={skipToNext}
            rewindSeconds={rewindSeconds}
            forwardSeconds={forwardSeconds}
            isMusicShared={isMusicShared}
            setIsMusicShared={setIsMusicShared}
            searchType={searchType}
            setSearchType={setSearchType}
            chatSearchQuery={chatSearchQuery}
            setChatSearchQuery={setChatSearchQuery}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            searchResults={searchResults}
            currentSearchIndex={currentSearchIndex}
            navigateSearchResults={navigateSearchResults}
            messages={messages}
            messagesContainerRef={messagesContainerRef}
            highlightedMessageId={highlightedMessageId}
            highlightText={highlightText}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            handleSendMessage={handleSendMessage}
            handleMessageInputChange={handleMessageInputChange}
            fileInputRef={fileInputRef}
            handleImageUpload={handleImageUpload}
            messagesEndRef={messagesEndRef}
            getStatusIcon={getStatusIcon}
            typingUsers={typingUsers}
          />
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={currentSong ? currentSong.url : ''} onEnded={skipToNext} className="hidden" />
    </div>
  );
};

export default FriendsPage;