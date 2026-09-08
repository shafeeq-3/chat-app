import React from 'react';
import { ThumbsUp, Reply, ChevronUp, ChevronDown } from 'lucide-react';

const CommentItem = ({
  comment,
  postId,
  handleLikeComment,
  handleToggleReplies,
  handleAddReply,
  handleLikeReply,
  replyTo,
  setReplyTo,
  replyTexts,
  setReplyTexts,
  isReply = false,
  rootCommentId
}) => {
  const actualRootCommentId = isReply ? rootCommentId : comment.id;

  return (
    <React.Fragment>
      <div className="space-y-2">
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold overflow-hidden">
            {comment.profilePicture ? (
              <img
                src={comment.profilePicture}
                alt={comment.author}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>{comment.author.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1">
            <div className="bg-white/50 rounded-lg p-3">
              <p className="font-semibold text-sm text-gray-800">
                {comment.replyingTo ? `${comment.author} → ${comment.replyingTo}` : comment.author}
              </p>
              <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
            </div>

            <div className="flex items-center space-x-4 mt-2 px-1">
              <button
                onClick={() => {
                  if (isReply) {
                    handleLikeReply(postId, comment.id);
                  } else {
                    handleLikeComment(postId, comment.id);
                  }
                }}
                className={`flex items-center space-x-1 text-xs transition-colors ${comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
              >
                <ThumbsUp className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                <span>{comment.likes || 0}</span>
              </button>
              <button
                onClick={() => {
                  setReplyTo({
                    parentId: comment.id,
                    rootCommentId: actualRootCommentId,
                    isReplyToReply: isReply,
                    replyingTo: comment.author
                  });
                }}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-sky-600 transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
              <span className="text-xs text-gray-400">{comment.time}</span>
            </div>

            {/* Reply Input */}
            {replyTo?.parentId === comment.id && (
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="text"
                  value={replyTexts[comment.id] || ''}
                  onChange={(e) =>
                    setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))
                  }
                  placeholder={`Reply to ${comment.author}...`}
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

      {/* Replies Section - only for top-level comments */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <>
          {/* Show/Hide Replies Button */}
          <div className="mt-2 ml-8">
            <button
              onClick={() => handleToggleReplies(postId, comment.id)}
              className="text-xs text-sky-600 hover:text-sky-700 flex items-center"
            >
              {comment.showReplies ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" /> Hide replies
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" /> Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </>
              )}
            </button>
          </div>

          {/* Replies List */}
          {comment.showReplies && (
            <div className="mt-2 ml-8 space-y-2">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  handleLikeComment={handleLikeComment}
                  handleToggleReplies={handleToggleReplies}
                  handleAddReply={handleAddReply}
                  handleLikeReply={handleLikeReply}
                  replyTo={replyTo}
                  setReplyTo={setReplyTo}
                  replyTexts={replyTexts}
                  setReplyTexts={setReplyTexts}
                  isReply={true}
                  rootCommentId={comment.id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default CommentItem;