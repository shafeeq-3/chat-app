
import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import {
  Heart, MessageCircle, Share2, Bookmark, Search, Settings, LogOut,
  Home, Users, Bell, Plus, MoreHorizontal, Send, Camera, ImageIcon,
  MapPin, Smile, X, TrendingUp, Hash, Mail, Menu, Edit, Trash2,
  Flag, Reply, ThumbsUp, Check, ChevronUp, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlassHomePage = () => {
    const navigate = useNavigate()
  const [posts, setPosts] = useState([]);

  const [newPost, setNewPost] = useState('');
  const [showExpandedCreate, setShowExpandedCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showComments, setShowComments] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [replyTexts, setReplyTexts] = useState({}); // {commentId: text}
  const [replyTo, setReplyTo] = useState(null);
  const [comments, setComments] = useState({});
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(null);
  const [addedFriendIds, setAddedFriendIds] = useState([]);

  const notifications = [
    { id: 1, user: 'Alex Turner', action: 'liked your post', time: '5 min ago', read: false },
    { id: 2, user: 'Lisa Wong', action: 'commented on your photo', time: '1 hour ago', read: false },
    { id: 3, user: 'James Brown', action: 'started following you', time: '2 hours ago', read: true },
    { id: 4, user: 'Sarah Johnson', action: 'shared your post', time: '3 hours ago', read: true }
  ];

  const messages = [
    { id: 1, user: 'Alex Turner', message: 'Hey! How are you?', time: '2 min ago', unread: true },
    { id: 2, user: 'Lisa Wong', message: 'Thanks for the follow!', time: '15 min ago', unread: true },
    { id: 3, user: 'James Brown', message: 'See you tomorrow!', time: '1 hour ago', unread: false },
    { id: 4, user: 'Sarah Johnson', message: 'Great post today!', time: '3 hours ago', unread: false }
  ];

  const suggestedFriends = [
    { id: 1, name: 'Alex Turner' },
    { id: 2, name: 'Lisa Wong' },
    { id: 3, name: 'James Brown' }
  ];

  // === Handlers ===
  const handleLike = (postId) => {
    const toggle = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.post(`http://localhost:3000/api/posts/${postId}/like`, null, { headers: { Authorization: `Bearer ${token}` } });
        setPosts(prev => prev.map(p => p.id === data.post.id ? data.post : p));
      } catch (err) {
        console.error('Failed to toggle like', err);
      }
    };
    toggle();
  };

  const handleSave = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, isSaved: !post.isSaved };
      }
      return post;
    }));
  };

  const handleShare = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 };
      }
      return post;
    }));
    alert('Post shared!');
  };

  const handleCreatePost = () => {
    // This component currently calls handleCreatePost without an image File; call backend
    const create = async () => {
      if (!newPost.trim()) return;
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('content', newPost);
      try {
        const { data } = await axios.post('http://localhost:3000/api/posts/create', form, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        setPosts([data.post, ...posts]);
        setNewPost('');
        setShowExpandedCreate(false);
      } catch (err) {
        console.error('Failed to create post', err);
      }
    };
    create();
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem('token');
      try {
        const { data } = await axios.get('http://localhost:3000/api/posts/', { headers: { Authorization: `Bearer ${token}` } });
        setPosts(data);
        const commentsMap = {};
        data.forEach(p => {
          commentsMap[p.id] = normalizeComments(p.commentsList);
        });
        setComments(commentsMap);
      } catch (err) {
        console.error('Failed to load posts', err);
      }
    };
    fetchPosts();
  }, []);

  const handleAddComment = (postId) => {
    const submit = async () => {
      if (!commentText.trim()) return;
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.post(`http://localhost:3000/api/posts/${postId}/comment`, { content: commentText }, { headers: { Authorization: `Bearer ${token}` } });
  setPosts(prev => prev.map(p => p.id === data.post.id ? data.post : p));
  const normalized = normalizeComments(data.post.commentsList);
  setComments(prev => ({ ...prev, [postId]: mergeShowReplies(prev, postId, normalized) }));
        setCommentText('');
      } catch (err) {
        console.error('Failed to add comment', err);
      }
    };
    submit();
  };

  const updateComment = (commentsArray, targetId, updater) => {
    return commentsArray.map(item => {
      if (item.id === targetId) {
        return updater(item);
      } else if (item.replies && item.replies.length > 0) {
        return { ...item, replies: updateComment(item.replies, targetId, updater) };
      } else {
        return item;
      }
    });
  };

  const normalizeComments = (arr) => {
    const userId = localStorage.getItem('userId') || null;
    return (arr || []).map(c => ({
      id: (c._id || c.id).toString(),
      author: c.author,
      authorId: c.authorId,
      profilePicture: c.profilePicture || '',
      content: c.content,
      time: c.time,
      likes: c.likes || 0,
      isLiked: c.isLiked || (c.likedBy || []).some(id => id === userId),
      replies: (c.replies || []).map(r => ({ id: (r._id || r.id).toString(), author: r.author, profilePicture: r.profilePicture || '', content: r.content, time: r.time, likes: r.likes || 0, isLiked: r.isLiked || (r.likedBy||[]).some(id => id === userId), replyingTo: r.replyingTo || null })),
      showReplies: false
    }));
  };

  const mergeShowReplies = (prevMap, postId, newComments, ensureOpenId = null) => {
    const prev = (prevMap && prevMap[postId]) || [];
    const prevById = {};
    prev.forEach(c => { prevById[String(c.id)] = c; });
    const merged = newComments.map(c => ({ ...c, showReplies: prevById[String(c.id)] ? !!prevById[String(c.id)].showReplies : false }));
    if (ensureOpenId) {
      const ensureStr = String(ensureOpenId);
      for (let i = 0; i < merged.length; i++) {
        if (String(merged[i].id) === ensureStr) {
          merged[i].showReplies = true;
          break;
        }
      }
    }
    return merged;
  };

  const handleLikeComment = (postId, commentId) => {
    const toggle = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.post(`http://localhost:3000/api/posts/${postId}/comment/${commentId}/like`, null, { headers: { Authorization: `Bearer ${token}` } });
  setPosts(prev => prev.map(p => p.id === data.post.id ? data.post : p));
  const normalized = normalizeComments(data.post.commentsList);
  setComments(prev => ({ ...prev, [postId]: mergeShowReplies(prev, postId, normalized, commentId) }));
      } catch (err) {
        console.error('Failed to toggle comment like', err);
      }
    };
    toggle();
  };

  const handleToggleReplies = (postId, commentId) => {
    setComments(prev => {
      const updatedComments = updateComment(prev[postId] || [], commentId, c => ({
        ...c,
        showReplies: !c.showReplies
      }));
      return { ...prev, [postId]: updatedComments };
    });
  };

  const handleAddReply = (postId, parentId) => {
    const text = replyTexts[parentId] || '';
    if (!text.trim()) return;

    // Find parent to get replyingTo
    const findComment = (arr, id) => {
      for (const c of arr) {
        if (c.id === id) return c;
        if (c.replies?.length) {
          const found = findComment(c.replies, id);
          if (found) return found;
        }
      }
      return null;
    };

    const parent = findComment(comments[postId] || [], parentId);
    const replyingTo = parent?.author || null;

    const submit = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.post(`http://localhost:3000/api/posts/${postId}/comment/${parentId}/reply`, { content: text }, { headers: { Authorization: `Bearer ${token}` } });
  setPosts(prev => prev.map(p => p.id === data.post.id ? data.post : p));
  const normalized = normalizeComments(data.post.commentsList);
  setComments(prev => ({ ...prev, [postId]: mergeShowReplies(prev, postId, normalized, parentId) }));
  setReplyTexts(prev => ({ ...prev, [parentId]: '' }));
  setReplyTo(null);
      } catch (err) {
        console.error('Failed to add reply', err);
      }
    };
    submit();
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(post => post.id !== postId));
      setShowPostMenu(null);
    }
  };

  const handleEditPost = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      const newContent = prompt('Edit your post:', post.content);
      if (newContent && newContent.trim()) {
        setPosts(posts.map(p => p.id === postId ? { ...p, content: newContent } : p));
      }
    }
    setShowPostMenu(null);
  };

  const handleLogout = () => {
    navigate("/login")
  };

  // === Recursive Reply Flattening ===
  const flattenReplies = (replies, depth = 0) => {
    let result = [];
    for (const reply of replies) {
      result.push({ ...reply, depth });
      if (reply.replies && reply.replies.length > 0) {
        result = result.concat(flattenReplies(reply.replies, depth + 1));
      }
    }
    return result;
  };

  // === Comment Component ===
  const CommentItem = ({ comment, postId }) => {
    const isTopLevel = !comment.replyingTo; // top-level comment

    return (
      <div className="space-y-2">
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold">
            {comment.author.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="bg-white/50 rounded-lg p-3">
              {comment.replyingTo && (
                <p className="text-xs text-gray-500 mb-1">
                  {comment.author} :&gt; {comment.replyingTo}
                </p>
              )}
              <p className="font-semibold text-sm text-gray-800">{comment.author}</p>
              <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
            </div>

            <div className="flex items-center space-x-4 mt-2 px-1">
              <button
                onClick={() => handleLikeComment(postId, comment.id)}
                className={`flex items-center space-x-1 text-xs transition-colors ${comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
              >
                <ThumbsUp className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                <span>{comment.likes || 0}</span>
              </button>
              <button
                onClick={() => setReplyTo(comment.id)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-sky-600 transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
              <span className="text-xs text-gray-400">{comment.time}</span>
            </div>

            {/* Reply Input */}
            {replyTo === comment.id && (
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="text"
                  value={replyTexts[comment.id] || ''}
                  onChange={(e) =>
                    setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))
                  }
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-1 bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300/50 text-sm"
                />
                <button
                  onClick={() => handleAddReply(postId, comment.id)}
                  className="px-3 py-1 bg-sky-500/80 hover:bg-sky-600/80 text-white rounded-lg transition-colors text-sm"
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setReplyTo(null);
                    setReplyTexts(prev => {
                      const updated = { ...prev };
                      delete updated[comment.id];
                      return updated;
                    });
                  }}
                  className="px-3 py-1 bg-gray-300/50 hover:bg-gray-400/50 text-gray-700 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
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
                <button className="flex items-center space-x-2 text-gray-700 hover:text-sky-600 transition-colors">
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

              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                    setShowInbox(false);
                  }}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    YU
                  </div>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg rounded-lg shadow-xl border border-white/50">
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100/50 text-gray-700 transition-colors">
                      Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100/50 text-gray-700 transition-colors">
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

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-x-0 top-16 z-40 bg-white/90 backdrop-blur-lg border-b border-white/50">
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users or topics..."
                className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200/50 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-300/50 text-gray-700 placeholder-gray-400"
              />
            </div>
            <nav className="space-y-2">
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg transition-colors">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg transition-colors">
                <Users className="w-5 h-5" />
                <span>Friends</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg transition-colors">
                <TrendingUp className="w-5 h-5" />
                <span>Trending</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white/30 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white/50">
              {showExpandedCreate ? (
                <div>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-semibold">
                      YU
                    </div>
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="What's on your mind?"
                      className="flex-1 p-3 bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300/50 resize-none h-32 text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-sky-600 transition-colors">
                        <Camera className="w-5 h-5" />
                        <span className="text-sm">Photo</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-sky-600 transition-colors">
                        <Smile className="w-5 h-5" />
                        <span className="text-sm">Feeling</span>
                      </button>
                    </div>
                    <div>
                      <button onClick={() => setShowExpandedCreate(false)} className="mr-2 px-3 py-1 text-gray-600 hover:text-gray-800">Cancel</button>
                      <button onClick={handleCreatePost} className="px-4 py-2 bg-sky-500/80 hover:bg-sky-600/80 text-white rounded-lg transition-colors">Post</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-semibold">
                      YU
                    </div>
                    <button onClick={() => setShowExpandedCreate(true)} className="flex-1 px-3 sm:px-4 py-2 bg-white/50 rounded-full text-gray-500 text-left hover:bg-white/70 transition-colors text-sm sm:text-base">
                      What's on your mind?
                    </button>
                  </div>
                  <div className="flex items-center justify-around mt-4 pt-4 border-t border-gray-200/30">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-sky-600 transition-colors">
                      <Camera className="w-5 h-5" />
                      <span className="hidden sm:inline text-sm">Photo</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-sky-600 transition-colors">
                      <ImageIcon className="w-5 h-5" />
                      <span className="hidden sm:inline text-sm">Media</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-sky-600 transition-colors">
                      <MapPin className="w-5 h-5" />
                      <span className="hidden sm:inline text-sm">Location</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Posts Feed */}
            {posts.map(post => (
              <div key={post.id} className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/50 overflow-hidden">
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {post.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{post.author}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{post.time}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)}
                        className="p-2 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5 text-gray-600" />
                      </button>
                      {showPostMenu === post.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg rounded-lg shadow-xl border border-white/50">
                          {post.author === 'You' ? (
                            <>
                              <button
                                onClick={() => handleEditPost(post.id)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100/50 text-gray-700 transition-colors flex items-center space-x-2"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100/50 text-red-600 transition-colors flex items-center space-x-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="w-full text-left px-4 py-2 hover:bg-gray-100/50 text-gray-700 transition-colors">
                                Save Post
                              </button>
                              <button className="w-full text-left px-4 py-2 hover:bg-gray-100/50 text-gray-700 transition-colors">
                                Hide Post
                              </button>
                            </>
                          )}
                          <button className="w-full text-left px-4 py-2 hover:bg-gray-100/50 text-gray-700 transition-colors flex items-center space-x-2">
                            <Flag className="w-4 h-4" />
                            <span>Report</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <p className="text-gray-700 text-sm sm:text-base">{post.content}</p>
                  {post.image && (
                    <div className="mt-4 bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 sm:h-64" />
                  )}
                </div>

                <div className="px-3 sm:px-4 py-3 border-t border-gray-200/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-1 sm:space-x-2 transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                      >
                        <Heart className={`w-4 sm:w-5 h-4 sm:h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-xs sm:text-sm">{post.likes}</span>
                      </button>
                      <button
                        onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                        className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-sky-600 transition-colors"
                      >
                        <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                        <span className="text-xs sm:text-sm">{post.comments}</span>
                      </button>
                      <button
                        onClick={() => handleShare(post.id)}
                        className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-sky-600 transition-colors"
                      >
                        <Share2 className="w-4 sm:w-5 h-4 sm:h-5" />
                        <span className="text-xs sm:text-sm">{post.shares}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleSave(post.id)}
                      className={`transition-colors ${post.isSaved ? 'text-sky-600' : 'text-gray-600 hover:text-sky-600'}`}
                    >
                      <Bookmark className={`w-4 sm:w-5 h-4 sm:h-5 ${post.isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {showComments === post.id && (
                  <div className="px-3 sm:px-4 pb-4 border-t border-gray-200/30">
                    <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                      {(comments[post.id] || []).map(comment => (
                        <React.Fragment key={comment.id}>
                          <CommentItem comment={comment} postId={post.id} />

                          {/* Flattened Replies */}
                          {comment.showReplies && comment.replies && comment.replies.length > 0 && (
                            <div className="ml-8 mt-2 space-y-2">
                              {flattenReplies(comment.replies).map(reply => (
                                <CommentItem key={reply.id} comment={reply} postId={post.id} />
                              ))}
                            </div>
                          )}

                          {/* Show/Hide Replies Button at the END */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-8 mt-2">
                              <button
                                onClick={() => handleToggleReplies(post.id, comment.id)}
                                className="text-xs text-sky-600 hover:text-sky-700 flex items-center"
                              >
                                {comment.showReplies ? (
                                  <>
                                    <ChevronUp className="w-3 h-3 mr-1" /> Hide replies
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3 h-3 mr-1" /> Show replies ({comment.replies.length})
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Add top-level comment */}
                    <div className="mt-4 flex items-center space-x-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300/50 text-sm"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-2 bg-sky-500/80 hover:bg-sky-600/80 text-white rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* Trending Topics */}
            <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/50">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-sky-600" />
                Trending Topics
              </h3>
              <div className="space-y-3">
                {['#innovation', '#tech', '#lifestyle', '#travel'].map((topic, index) => (
                  <button key={index} className="flex items-center space-x-2 text-gray-700 hover:text-sky-600 transition-colors w-full text-left">
                    <Hash className="w-4 h-4" />
                    <span className="text-sm">{topic}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Friends */}
            <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Suggested Friends</h3>
                <button className="text-sky-600 hover:text-sky-700">
                  <Search className="w-4 h-4" />
                </button>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search friends..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300/50 text-sm"
                />
              </div>
              <div className="space-y-3">
                {suggestedFriends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {friend.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-gray-700">{friend.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (addedFriendIds.includes(friend.id)) {
                          setAddedFriendIds(addedFriendIds.filter(id => id !== friend.id));
                        } else {
                          setAddedFriendIds([...addedFriendIds, friend.id]);
                        }
                      }}
                      className={`px-3 py-1 ${addedFriendIds.includes(friend.id) ? 'bg-green-500/80 hover:bg-green-600/80' : 'bg-sky-500/80 hover:bg-sky-600/80'} text-white text-xs rounded-full transition-colors flex items-center space-x-1`}
                    >
                      {addedFriendIds.includes(friend.id) ? <Check className="w-4 h-4" /> : 'Add'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassHomePage;