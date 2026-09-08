import React, { useState,useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Import components
import Header from './components/Header';
import MobileMenu from './components/MobileMenu';
import ProfileHeader from './components/ProfileHeader';
import UserStats from './components/UserStats';
import ProfileInformation from './components/ProfileInformation';
import RecentPosts from './components/RecentPosts';
import Sidebar from './components/Sidebar';
import FollowersModal from './components/FollowersModal';
import PostsView from './components/PostsView';
import ConfirmationModal from '../components/ConfirmationModal';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const fileInputRef = useRef(null);




  


  const [profileData, setProfileData] = useState({
    // will be replaced by fetched user
    name: '',
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    birthday: '',
    work: '',
    joinDate: '',
    profilePicture: null,
    followers: [],
    following: []
  });

  // temporary edit snapshot is no longer stored in state - we keep an original snapshot in a ref
  const originalProfileRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followModalType, setFollowModalType] = useState('followers');
  const [viewMode, setViewMode] = useState('info'); // 'info', 'saved', 'liked'
  const [savedPosts, setSavedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [postsViewLoading, setPostsViewLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
    }
    // const payload = JSON.parse(atob(token.split('.')[1]));
    // setUser(payload);

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const {data} = await axios.get('http://localhost:3000/api/user/getuser', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // map backend user shape to profileData used by components
        // backend user has `name` (full name), username, email, profilePicture, bio, location, website, phone, birthday, work, joinDate, followers, following
        const name = data.name || '';

        setProfileData(prev => ({
          ...prev,
          name,
          username: data.username || '',
          email: data.email || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          phone: data.phone || '',
          birthday: data.birthday || '',
          work: data.work || '',
          joinDate: data.joinDate || '',
          profilePicture: data.profilePicture || null,
          followers: Array.isArray(data.followers) ? data.followers : [],
          following: Array.isArray(data.following) ? data.following : []
        }));
        
        setUserId(data._id);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(error?.response?.data?.message || error.message || 'Failed to load user');
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUserPosts = async () => {
      try {
        setPostsLoading(true);
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`http://localhost:3000/api/posts/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserPosts(data);
        setPostsLoading(false);
      } catch (error) {
        console.error('Failed to fetch user posts:', error);
        setPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);



  const notifications = [
    { id: 1, user: 'Alex Turner', action: 'liked your post', time: '5 min ago', read: false },
    { id: 2, user: 'Lisa Wong', action: 'commented on your photo', time: '1 hour ago', read: false },
    { id: 3, user: 'James Brown', action: 'started following you', time: '2 hours ago', read: true }
  ];

  const messages = [
    { id: 1, user: 'Alex Turner', message: 'Hey! How are you?', time: '2 min ago', unread: true },
    { id: 2, user: 'Lisa Wong', message: 'Thanks for the follow!', time: '15 min ago', unread: true },
    { id: 3, user: 'James Brown', message: 'See you tomorrow!', time: '1 hour ago', unread: false }
  ];

  const userStats = {
    posts: userPosts.length,
    followers: profileData.followers ? profileData.followers.length : 0,
    following: profileData.following ? profileData.following.length : 0,
    likes: userPosts.reduce((total, post) => total + (post.likes || 0), 0)
  };

  const handleEdit = () => {
    originalProfileRef.current = JSON.parse(JSON.stringify(profileData));
    setSaveError(null); 
    setIsEditing(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    setSaveStatus('saving');
    setSaveError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add profile picture file if it exists
      if (profileData.profilePictureFile) {
        formData.append('profilePicture', profileData.profilePictureFile);
      }
      
      // Add other profile data (excluding the file and preview)
      const { profilePictureFile, profilePicture, ...otherData } = profileData;
      Object.keys(otherData).forEach(key => {
        if (otherData[key] !== null && otherData[key] !== undefined) {
          formData.append(key, otherData[key]);
        }
      });

      const {data} = await axios.patch('http://localhost:3000/api/user/getuser', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(data);
      
      // Update profile data with server response (including new profile picture URL)
      if (data.updatedUser) {
        setProfileData(prev => ({
          ...prev,
          ...data.updatedUser,
          profilePictureFile: null // Clear the file after successful upload
        }));
      }
      
      // Success - close edit mode and show success message
      setIsEditing(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.log(error);
      setSaveStatus(null);
      
      // Handle different error types
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      setSaveError(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => setSaveError(null), 5000);
    }
  };

  const handleCancel = () => {
    // restore original values if available
    if (originalProfileRef.current) {
      setProfileData(originalProfileRef.current);
    }
    setSaveError(null); // Clear any errors
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the actual file for upload
      setProfileData(prev => ({ ...prev, profilePictureFile: file }));
      
      // Create preview URL for display
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleLogout = () => {
    navigate('/login');
    // Cookies.remove('token');
    localStorage.removeItem('token');
    // setUser(null);
    // setToken(null);
  };

  const handleShowFollowers = () => {
    setFollowModalType('followers');
    setShowFollowersModal(true);
  };

  const handleShowFollowing = () => {
    setFollowModalType('following');
    setShowFollowersModal(true);
  };

  const handleFollowModalUpdate = async () => {
    // Refresh user data after removing follower or unfollowing
    try {
      const token = localStorage.getItem('token');
      const {data} = await axios.get('http://localhost:3000/api/user/getuser', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProfileData(prev => ({
        ...prev,
        followers: Array.isArray(data.followers) ? data.followers : [],
        following: Array.isArray(data.following) ? data.following : []
      }));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const handleViewSavedPosts = async () => {
    setViewMode('saved');
    setPostsViewLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:3000/api/posts/saved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedPosts(data);
    } catch (error) {
      console.error('Failed to fetch saved posts:', error);
    } finally {
      setPostsViewLoading(false);
    }
  };

  const handleViewLikedPosts = async () => {
    setViewMode('liked');
    setPostsViewLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:3000/api/posts/liked', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLikedPosts(data);
    } catch (error) {
      console.error('Failed to fetch liked posts:', error);
    } finally {
      setPostsViewLoading(false);
    }
  };

  const handleBackToProfile = () => {
    setViewMode('info');
  };

  const handleDeletePostClick = (postId) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      setDeletingPostId(postToDelete);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/posts/${postToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from all post lists
      setUserPosts(prev => prev.filter(p => p.id !== postToDelete));
      setSavedPosts(prev => prev.filter(p => p.id !== postToDelete));
      setLikedPosts(prev => prev.filter(p => p.id !== postToDelete));
      
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setDeletingPostId(null);
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  const cancelDeletePost = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-red-600">{error}</div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      <Header
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        showInbox={showInbox}
        setShowInbox={setShowInbox}
        setShowProfileMenu={setShowProfileMenu}
        notifications={notifications}
        messages={messages}
        handleLogout={handleLogout}
      />

      <MobileMenu showMobileMenu={showMobileMenu} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Profile Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <ProfileHeader
              profileData={profileData}
              isEditing={isEditing}
              saveStatus={saveStatus}
              saveError={saveError}
              profilePicture={profileData.profilePicture}
              fileInputRef={fileInputRef}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleCancel={handleCancel}
              handleProfilePictureClick={handleProfilePictureClick}
              handleProfilePictureChange={handleProfilePictureChange}
            />

            <UserStats 
              userStats={userStats}
              onFollowersClick={handleShowFollowers}
              onFollowingClick={handleShowFollowing}
            />

            {viewMode === 'info' ? (
              <>
                <ProfileInformation
                  profileData={profileData}
                  isEditing={isEditing}
                  handleInputChange={handleInputChange}
                />

                <RecentPosts 
                  recentPosts={userPosts} 
                  postsLoading={postsLoading}
                  onDeletePost={handleDeletePostClick}
                  deletingPostId={deletingPostId}
                />
              </>
            ) : viewMode === 'saved' ? (
              <PostsView
                posts={savedPosts}
                loading={postsViewLoading}
                viewType="saved"
                onDeletePost={handleDeletePostClick}
                deletingPostId={deletingPostId}
              />
            ) : (
              <PostsView
                posts={likedPosts}
                loading={postsViewLoading}
                viewType="liked"
                onDeletePost={handleDeletePostClick}
                deletingPostId={deletingPostId}
              />
            )}
          </div>

          <Sidebar 
            onViewSavedPosts={handleViewSavedPosts}
            onViewLikedPosts={handleViewLikedPosts}
            onBackToProfile={handleBackToProfile}
            viewMode={viewMode}
          />
        </div>
      </div>

      <FollowersModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        userId={userId}
        type={followModalType}
        onUpdate={handleFollowModalUpdate}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        message="Are you sure you want to delete this post? This action cannot be undone."
        onConfirm={confirmDeletePost}
        onCancel={cancelDeletePost}
      />
    </div>
  );
};

export default ProfilePage;
