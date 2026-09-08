import React from 'react';
import {
  Camera, Save, MapPin, Calendar, Edit3, Check, X, AlertCircle
} from 'lucide-react';

const ProfileHeader = ({
  profileData,
  isEditing,
  saveStatus,
  saveError,
  profilePicture,
  fileInputRef,
  handleEdit,
  handleSave,
  handleCancel,
  handleProfilePictureClick,
  handleProfilePictureChange
}) => {
  return (
    <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white/50">
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{(profileData.name || ' ').split(' ').map(n => n.charAt(0)).slice(0,2).join('')}</span>
            )}
          </div>
          {isEditing && (
            <button
              onClick={handleProfilePictureClick}
              className="absolute bottom-0 right-0 p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfilePictureChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {profileData.name}
          </h2>
          <p className="text-gray-600 mt-1">@{profileData.username}</p>
          <p className="text-gray-700 mt-2 text-sm sm:text-base">{profileData.bio}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{profileData.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {profileData.joinDate}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-sky-500/80 hover:bg-sky-600/80 text-white rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500/80 hover:bg-green-600/80 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {saveStatus === 'saving' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500/80 hover:bg-gray-600/80 text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {saveStatus === 'saved' && (
        <div className="mt-4 p-3 bg-green-100/50 border border-green-200/50 rounded-lg flex items-center space-x-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700">Profile updated successfully!</span>
        </div>
      )}
      {saveError && (
        <div className="mt-4 p-3 bg-red-100/50 border border-red-200/50 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{saveError}</span>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
