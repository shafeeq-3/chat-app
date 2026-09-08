import React from 'react';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Edit, Trash2, Flag, Send
} from 'lucide-react';
import CommentItem from './CommentItem';

const PostCard = ({
  post,
  showComments,
  setShowComments,
  showPostMenu,
  setShowPostMenu,
  handleLike,
  handleSave,
  handleShare,
  handleEditPost,
  handleDeletePost,
  comments,
  commentText,
  setCommentText,
  handleAddComment,
  handleLikeComment,
  handleLikeReply,
  handleToggleReplies,
  handleAddReply,
  replyTo,
  setReplyTo,
  replyTexts,
  setReplyTexts,
  currentUserId,
  isFollowing,
  handleFollowToggle
}) => {
  return (
    <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/50 overflow-hidden">
      {/* Post Header */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
              {post.profilePicture ? (
                <img 
                  src={post.profilePicture} 
                  alt={post.author} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span>{post.avatar}</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{post.author}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{post.time}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!post.isOwnPost && currentUserId && (
              <button
                onClick={() => handleFollowToggle(post.authorId)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-sky-500 text-white hover:bg-sky-600'}`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)}
                className="p-2 hover:bg-white/30 rounded-lg transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
              {showPostMenu === post.id && (
                <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg rounded-lg shadow-xl border border-white/50 z-10">
                  {post.isOwnPost ? (
                    <>
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
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100/50 text-gray-700 transition-colors flex items-center space-x-2">
                        <Flag className="w-4 h-4" />
                        <span>Report</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <p className="text-gray-700 text-sm sm:text-base">{post.content}</p>
        {post.image && (
          <div className="mt-4 rounded-xl overflow-hidden">
            {post.imageUrl ? (
              <img 
                src={post.imageUrl} 
                alt="Post content" 
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 sm:h-64" />
            )}
          </div>
        )}
      </div>

      {/* Post Actions */}
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
            {(comments[post.id] || post.commentsList || []).map(comment => (
              <CommentItem
                key={(comment.id || comment._id) + (comment.id && comment.id.startsWith('fb_') ? '_fallback' : '')}
                comment={comment}
                postId={post.id}
                handleLikeComment={handleLikeComment}
                handleToggleReplies={handleToggleReplies}
                handleAddReply={handleAddReply}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                replyTexts={replyTexts}
                setReplyTexts={setReplyTexts}
                isReply={false}
                handleLikeReply={handleLikeReply}
                rootCommentId={comment.id}
              />
            ))}
          </div>

          {/* Add Comment Input - hide when replying */}
          {!replyTo && (
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
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
