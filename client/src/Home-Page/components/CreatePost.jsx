import React, { useState } from 'react';
import { Camera, Smile, ImageIcon, MapPin, X } from 'lucide-react';

const CreatePost = ({
  user,
  showExpandedCreate,
  setShowExpandedCreate,
  newPost,
  setNewPost,
  handleCreatePost,
  isPosting
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handlePost = () => {
    // pass the actual File object to the parent so it can build FormData and call API
    handleCreatePost(selectedImage);
    // Clear image after posting
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCancel = () => {
    setShowExpandedCreate(false);
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="bg-white/30 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white/50">
      {showExpandedCreate ? (
        <div>
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
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
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 p-3 bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300/50 resize-none h-32 text-sm sm:text-base"
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-4 relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-64 object-cover rounded-lg border-2 border-gray-200/50"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-600/80 text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-gray-600 hover:text-sky-600 transition-colors cursor-pointer">
                <Camera className="w-5 h-5" />
                <span className="text-sm">Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-sky-600 transition-colors">
                <Smile className="w-5 h-5" />
                <span className="text-sm">Feeling</span>
              </button>
            </div>
            <div>
              <button 
                onClick={handleCancel} 
                className="mr-2 px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={handlePost} 
                className={`px-4 py-2 bg-sky-500/80 text-white rounded-lg transition-colors ${isPosting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-600/80'}`}
                disabled={isPosting}
              >
                {isPosting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
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
            <button 
              onClick={() => setShowExpandedCreate(true)} 
              className="flex-1 px-3 sm:px-4 py-2 bg-white/50 rounded-full text-gray-500 text-left hover:bg-white/70 transition-colors text-sm sm:text-base"
            >
              What's on your mind?
            </button>
          </div>
          <div className="flex items-center justify-around mt-4 pt-4 border-t border-gray-200/30">
            <label className="flex items-center space-x-2 text-gray-600 hover:text-sky-600 transition-colors cursor-pointer">
              <Camera className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleImageSelect(e);
                  setShowExpandedCreate(true);
                }}
                className="hidden"
              />
            </label>
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
  );
};

export default CreatePost;
