import React from 'react';
import { Heart, MessageCircle, Share2, Trash2, Bookmark } from 'lucide-react';

const PostsView = ({ posts, loading, viewType, onDeletePost, deletingPostId }) => {
  const getTitle = () => {
    if (viewType === 'saved') return 'Saved Posts';
    if (viewType === 'liked') return 'Liked Posts';
    return 'Your Posts';
  };

  if (loading) {
    return (
      <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white/50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{getTitle()}</h3>
        <div className="text-center text-gray-600 py-8">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white/50">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {getTitle()} ({posts.length})
      </h3>
      {posts.length === 0 ? (
        <div className="text-center text-gray-600 py-8">
          {viewType === 'saved' && 'No saved posts yet. Save posts to see them here!'}
          {viewType === 'liked' && 'No liked posts yet. Like posts to see them here!'}
          {!viewType && 'No posts yet. Create your first post!'}
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {posts.map(post => (
            <div key={post.id} className="p-4 bg-white/30 rounded-lg border border-white/30 hover:bg-white/40 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                      {post.profilePicture ? (
                        <img 
                          src={post.profilePicture} 
                          alt={post.author} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{post.avatar || post.author?.[0]?.toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{post.author}</p>
                      <p className="text-xs text-gray-600">{post.time}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{post.content}</p>
                </div>
                {post.isOwnPost && onDeletePost && (
                  <button
                    onClick={() => onDeletePost(post.id)}
                    disabled={deletingPostId === post.id}
                    className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {post.image && post.imageUrl && (
                <div className="mt-3 mb-3 rounded-lg overflow-hidden">
                  <img 
                    src={post.imageUrl} 
                    alt="Post content" 
                    className="w-full h-auto object-cover max-h-64"
                  />
                </div>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-600 pt-2 border-t border-gray-200/30">
                <div className="flex items-center space-x-1">
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{post.likes || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Share2 className="w-4 h-4" />
                  <span>{post.shares || 0}</span>
                </div>
                {post.isSaved && (
                  <div className="flex items-center space-x-1 ml-auto">
                    <Bookmark className="w-4 h-4 fill-sky-500 text-sky-500" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsView;
