import React from 'react';
import { Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';

const RecentPosts = ({ recentPosts, postsLoading, onDeletePost, deletingPostId }) => {

  if (postsLoading) {
    return (
      <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white/50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Posts</h3>
        <div className="text-center text-gray-600 py-8">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white/50">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Your Posts ({recentPosts.length})
      </h3>
      <div className="space-y-4">
        {recentPosts.length === 0 ? (
          <div className="text-center text-gray-600 py-8">
            No posts yet. Create your first post!
          </div>
        ) : (
          recentPosts.map(post => (
            <div key={post.id} className="p-4 bg-white/30 rounded-lg border border-white/30">
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-700 flex-1">{post.content}</p>
                <button
                  onClick={() => onDeletePost(post.id)}
                  disabled={deletingPostId === post.id}
                  className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
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
                <span className="ml-auto text-xs">{post.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentPosts;
