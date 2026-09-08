import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import Cookies from 'js-cookie';
import Header from './components/Header';
import MobileMenu from './components/MobileMenu';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import Sidebar from './components/Sidebar';
import ConfirmationModal from '../components/ConfirmationModal';
import { X } from 'lucide-react';
import axios from 'axios';
const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [showExpandedCreate, setShowExpandedCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showComments, setShowComments] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [replyTexts, setReplyTexts] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [comments, setComments] = useState({});
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(null);
  const [addedFriendIds, setAddedFriendIds] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [realNotifications, setRealNotifications] = useState([]);
  const [feedFilter, setFeedFilter] = useState('all'); // 'all', 'following', or topic keyword
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchType, setSearchType] = useState('posts'); // 'posts' or 'users'
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
    }

    const fetchUserAndPosts = async () => {
      try {
        // Fetch user data
        const userResponse = await axios.get('http://localhost:3000/api/user/getuser', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const fetchedUser = userResponse.data;
        setUser(fetchedUser);

        // Fetch posts
        const postsResponse = await axios.get('http://localhost:3000/api/posts/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const postsWithFlags = addIsOwnPostFlag(postsResponse.data, fetchedUser._id);
        setPosts(postsWithFlags);

        const commentsMap = {};
        postsResponse.data.forEach(p => {
          commentsMap[p.id] = normalizeComments(p.commentsList);
        });
        setComments(commentsMap);

        const notificationsResponse = await axios.get('http://localhost:3000/api/notifications/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRealNotifications(notificationsResponse.data);

      } catch (error) {
        console.error('Failed to load user or posts', error);
      }
    };
    fetchUserAndPosts();
  }, []);


  const notifications = realNotifications.length > 0 ? realNotifications : [
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

  // Handler Functions
  const handleLike = (postId) => {
    const toggle = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.post(`http://localhost:3000/api/posts/${postId}/like`, null, { headers: { Authorization: `Bearer ${token}` } });
        // update posts array with returned post and preserve isOwnPost flag
        setPosts(prev => prev.map(p => {
          if (p.id === data.post.id) {
            return { ...data.post, isOwnPost: p.isOwnPost };
          }
          return p;
        }));
      } catch (err) {
        console.error('Failed to toggle like', err);
      }
    };
    toggle();
  };

  const handleSave = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      // Toggle save on backend
      await axios.post(`http://localhost:3000/api/posts/${postId}/save`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update UI
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, isSaved: !post.isSaved };
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to save post:', error);
    }
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

  const handleCreatePost = async (imageFile) => {
    if (!newPost.trim() && !imageFile) return;
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('content', newPost);
    if (imageFile) form.append('image', imageFile);

    setIsPosting(true);

    try {
      const { data } = await axios.post('http://localhost:3000/api/posts/create', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      const postWithFlag = { ...data.post, isOwnPost: true };
      setPosts(prev => [postWithFlag, ...prev]);
      setNewPost('');
      setShowExpandedCreate(false);
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setIsPosting(false);
    }
  };

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
    return (arr || []).map(c => ({
      id: c.id,
      author: c.author || 'Unknown',
      authorId: c.authorId,
      profilePicture: c.profilePicture || '',
      content: c.content || '',
      time: c.time || '',
      likes: c.likes || 0,
      isLiked: c.isLiked,
      showReplies: false,
      replyingTo: c.replyingTo || null,
      replies: (c.replies || []).map(r => ({
        id: r.id,
        author: r.author || 'Unknown',
        authorId: r.authorId,
        profilePicture: r.profilePicture || '',
        content: r.content || '',
        time: r.time || '',
        likes: r.likes || 0,
        isLiked: r.isLiked,
        replyingTo: r.replyingTo || null
      }))
    }));
  };

  const addIsOwnPostFlag = (postsArray, currentUserId) => {
    if (!currentUserId) return postsArray;
    return postsArray.map(p => ({
      ...p,
      isOwnPost: p.authorId === currentUserId
    }));
  };

  const handleFollowToggle = async (targetUserId) => {
    if (!user || !user._id) {
      console.error('User not logged in.');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`http://localhost:3000/api/user/${targetUserId}/follow`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(data.message);

      setUser(prevUser => {
        if (!prevUser) return null;
        const newFollowing = prevUser.following.includes(targetUserId)
          ? prevUser.following.filter(id => id !== targetUserId)
          : [...prevUser.following, targetUserId];
        return { ...prevUser, following: newFollowing };
      });


    } catch (error) {
      console.error('Failed to toggle follow status', error);
      alert(error.response?.data?.message || 'Failed to update follow status.');
    }
  };

  const mergeShowReplies = (prevMap, postId, newComments, ensureOpenId = null) => {
    const prev = (prevMap && prevMap[postId]) || [];
    const prevById = {};


    const buildIdMap = (comments, map) => {
      comments.forEach(c => {
        map[String(c.id)] = c;
        if (c.replies && c.replies.length > 0) {
          buildIdMap(c.replies, map);
        }
      });
    };
    buildIdMap(prev, prevById);

    const mergeRecursive = (comments) => {
      return comments.map(c => {
        const prevComment = prevById[String(c.id)];
        const mergedComment = {
          ...c,
          showReplies: prevComment ? prevComment.showReplies : false,
        };

        // Recursively merge replies
        if (c.replies && c.replies.length > 0) {
          mergedComment.replies = mergeRecursive(c.replies);
        } else {
          mergedComment.replies = [];
        }

        return mergedComment;
      });
    };

    const merged = mergeRecursive(newComments);

    if (ensureOpenId) {
      const ensureStr = String(ensureOpenId);
      const ensureOpenRecursive = (comments) => {
        for (let i = 0; i < comments.length; i++) {
          if (String(comments[i].id) === ensureStr) {
            comments[i].showReplies = true;
            return true;
          }
          if (comments[i].replies && ensureOpenRecursive(comments[i].replies)) {
            return true;
          }
        }
        return false;
      };
      ensureOpenRecursive(merged);
    }

    return merged;
  };


  const handleLikeComment = (postId, commentId) => {
    const toggle = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.post(`http://localhost:3000/api/posts/${postId}/comment/${commentId}/like`, null, { headers: { Authorization: `Bearer ${token}` } });
        // update posts and comments map with returned post
        setPosts(prev => prev.map(p => p.id === data.post.id ? data.post : p));
        // normalize comments into local structure and preserve showReplies (keep target comment open)
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
      const postComments = prev[postId] || [];

      // Helper function to update comment and its replies recursively
      const updateCommentAndReplies = (comments) => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              showReplies: !comment.showReplies
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentAndReplies(comment.replies)
            };
          }
          return comment;
        });
      };

      const updatedComments = updateCommentAndReplies(postComments);
      return { ...prev, [postId]: updatedComments };
    });
  };

  const handleLikeReply = (postId, replyId) => {
    const toggle = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.post(`http://localhost:3000/api/posts/${postId}/reply/${replyId}/like`, null, { headers: { Authorization: `Bearer ${token}` } });
        setPosts(prev => prev.map(p => p.id === data.post.id ? data.post : p));
        const normalized = normalizeComments(data.post.commentsList);
        setComments(prev => ({ ...prev, [postId]: mergeShowReplies(prev, postId, normalized) }));
      } catch (err) {
        console.error('Failed to toggle reply like', err);
      }
    };
    toggle();
  };

  const handleAddReply = (postId, parentId) => {
    const text = replyTexts[parentId] || '';
    if (!text.trim()) return;

    const submit = async () => {
      try {
        const token = localStorage.getItem('token');
        let endpoint;
        if (replyTo?.isReplyToReply) {
          endpoint = `http://localhost:3000/api/posts/${postId}/comment/${replyTo.rootCommentId}/reply/${parentId}`;
        } else {
          endpoint = `http://localhost:3000/api/posts/${postId}/comment/${parentId}/reply`;
        }
        const { data } = await axios.post(endpoint, { content: text }, { headers: { Authorization: `Bearer ${token}` } });
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
    setPostToDelete(postId);
    setShowDeleteModal(true);
    setShowPostMenu(null);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/posts/${postToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.filter(post => post.id !== postToDelete));
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (err) {
      console.error('Failed to delete post', err);
      alert('Failed to delete post. Please try again.');
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  const cancelDeletePost = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
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
    navigate("/login");
    // Cookies.remove('token');
    localStorage.removeItem('token');
    // setUser(null);
    // setToken(null);
  };

  // Filter and Search handlers
  const handleFilterChange = async (filter) => {
    setFeedFilter(filter);
    setSelectedTopic(null);
    setSearchQuery('');
    setIsSearching(false);

    const token = localStorage.getItem('token');
    try {
      let response;
      if (filter === 'following') {
        response = await axios.get('http://localhost:3000/api/posts/following', {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.get('http://localhost:3000/api/posts/', {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      const postsWithFlags = addIsOwnPostFlag(response.data, user?._id);
      setPosts(postsWithFlags);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const handleTopicClick = async (topic) => {
    setSelectedTopic(topic);
    setFeedFilter('topic');
    setSearchQuery('');
    setIsSearching(false);

    const token = localStorage.getItem('token');
    try {
      const cleanTopic = topic.replace('#', '');
      const response = await axios.get(`http://localhost:3000/api/posts/search?query=${cleanTopic}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const postsWithFlags = addIsOwnPostFlag(response.data, user?._id);
      setPosts(postsWithFlags);
    } catch (error) {
      console.error('Failed to search posts:', error);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      handleFilterChange('all');
      return;
    }

    setIsSearching(true);
    const token = localStorage.getItem('token');

    try {
      if (searchType === 'posts') {
        const response = await axios.get(`http://localhost:3000/api/posts/search?query=${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const postsWithFlags = addIsOwnPostFlag(response.data, user?._id);
        setSearchResults(postsWithFlags);
      } else {
        const response = await axios.get(`http://localhost:3000/api/user/search/users?query=${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Failed to search:', error);
    }
  };

  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchType]);

  const displayedPosts = isSearching && searchType === 'posts' ? searchResults : posts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
      <Header
        user={user}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setShowExpandedCreate={setShowExpandedCreate}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        showInbox={showInbox}
        setShowInbox={setShowInbox}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        setShowMobileMenu={setShowMobileMenu}
        showMobileMenu={showMobileMenu}
        handleLogout={handleLogout}
        notifications={notifications}
        messages={messages}
      />

      {/* Mobile Menu */}
      <MobileMenu
        showMobileMenu={showMobileMenu}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Filter Buttons */}
            {!isSearching && (
              <div className="bg-white/30 backdrop-blur-lg rounded-xl p-3 border border-white/50">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleFilterChange('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${feedFilter === 'all' && !selectedTopic
                        ? 'bg-sky-500 text-white shadow-lg'
                        : 'bg-white/50 text-gray-700 hover:bg-white/70'
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterChange('following')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${feedFilter === 'following'
                        ? 'bg-sky-500 text-white shadow-lg'
                        : 'bg-white/50 text-gray-700 hover:bg-white/70'
                      }`}
                  >
                    Following
                  </button>
                  {selectedTopic && (
                    <button
                      className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg flex items-center gap-2"
                    >
                      <span>{selectedTopic}</span>
                      <X
                        className="w-4 h-4 cursor-pointer hover:bg-white/20 rounded"
                        onClick={() => {
                          setSelectedTopic(null);
                          handleFilterChange('all');
                        }}
                      />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Search Type Toggle */}
            {isSearching && (
              <div className="bg-white/30 backdrop-blur-lg rounded-xl p-3 border border-white/50">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSearchType('posts')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${searchType === 'posts'
                        ? 'bg-sky-500 text-white shadow-lg'
                        : 'bg-white/50 text-gray-700 hover:bg-white/70'
                      }`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setSearchType('users')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${searchType === 'users'
                        ? 'bg-sky-500 text-white shadow-lg'
                        : 'bg-white/50 text-gray-700 hover:bg-white/70'
                      }`}
                  >
                    Users
                  </button>
                </div>
              </div>
            )}

            {/* Create Post */}
            <CreatePost
              user={user}
              showExpandedCreate={showExpandedCreate}
              setShowExpandedCreate={setShowExpandedCreate}
              newPost={newPost}
              setNewPost={setNewPost}
              handleCreatePost={handleCreatePost}
              isPosting={isPosting}
            />

            {/* Posts Feed or User Search Results */}
            {isSearching && searchType === 'users' ? (
              <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 border border-white/50">
                <h3 className="font-semibold text-gray-800 mb-4">Search Results</h3>
                {searchResults.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No users found</p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {searchResults.map(user => (
                      <div key={user._id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-white/30">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{(user.name || user.username || 'U')[0].toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{user.name || user.username}</p>
                            {user.username && user.name && (
                              <p className="text-sm text-gray-600">@{user.username}</p>
                            )}
                            {user.bio && <p className="text-sm text-gray-600 mt-1">{user.bio}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleFollowToggle(user._id)}
                          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium"
                        >
                          Follow
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              displayedPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  showComments={showComments}
                  setShowComments={setShowComments}
                  showPostMenu={showPostMenu}
                  setShowPostMenu={setShowPostMenu}
                  handleLike={handleLike}
                  handleSave={handleSave}
                  handleShare={handleShare}
                  handleEditPost={handleEditPost}
                  handleDeletePost={handleDeletePost}
                  comments={comments}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  handleAddComment={handleAddComment}
                  handleLikeComment={handleLikeComment}
                  handleLikeReply={handleLikeReply}
                  handleToggleReplies={handleToggleReplies}
                  handleAddReply={handleAddReply}
                  replyTo={replyTo}
                  setReplyTo={setReplyTo}
                  replyTexts={replyTexts}
                  setReplyTexts={setReplyTexts}
                  currentUserId={user?._id}
                  isFollowing={user?.following.includes(post.authorId)}
                  handleFollowToggle={handleFollowToggle}
                />
              ))
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Sidebar
              addedFriendIds={addedFriendIds}
              setAddedFriendIds={setAddedFriendIds}
              currentUserId={user?._id}
              onFollowUser={handleFollowToggle}
              onTopicClick={handleTopicClick}
            />
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        message="Are you sure you want to delete this post? This action cannot be undone."
        onConfirm={confirmDeletePost}
        onCancel={cancelDeletePost}
      />
    </div>
  );
};

export default HomePage;
