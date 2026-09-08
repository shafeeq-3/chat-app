const mongoose = require('mongoose');
const { postSchema } = require('../models/postsModel');
const { userSchema } = require('../models/userModel');
const { uploadImage } = require('../utils/imageUpload');
const { ApiError } = require('../middlewares/ApiError');
const { createNotification } = require('./notificationService');

const createPost = async (user, body, imageFile = null) => {
    try {
        if (!body.content && !imageFile) {
            throw new ApiError(400, 'Post must have content or an image');
        }

        let imageUrl = '';
        if (imageFile) {
            try {
                imageUrl = await uploadImage(imageFile.buffer, 'posts');
            } catch (err) {
                throw new ApiError(400, 'Failed to upload image');
            }
        }

        const authorName = user.username || user.name || 'Unknown';

        const newPost = await postSchema.create({
            author: authorName,
            authorId: user._id,
            avatar: user.profilePicture || '',
            content: body.content || '',
            image: !!imageUrl,
            imageUrl: imageUrl
        });

        // update user's posts count and optionally recent list
        try {
            await userSchema.findByIdAndUpdate(user._id, {
                $inc: { posts: 1 },
                $push: { recentPosts: { $each: [newPost._id], $slice: -10 } }
            }, { new: true });
        } catch (e) {
            // not critical if user update fails; continue
            console.warn('Failed to update user post counters', e);
        }

        return newPost.toClient ? await newPost.toClient(user._id) : newPost;
    } catch (error) {
        throw error;
    }
}

const getAllPosts = async (user) => {
    try {
        const posts = await postSchema.find().sort({ createdAt: -1 }).limit(100);
        const clientPosts = [];
        for (const p of posts) {
            clientPosts.push(p.toClient ? await p.toClient(user._id) : p);
        }
        return clientPosts;
    } catch (error) {
        throw error;
    }
}

const toggleLike = async (user, postId) => {
    try {
        const post = await postSchema.findById(postId);
        if (!post) throw new ApiError(404, 'Post not found');
        const uid = user._id;
        const liked = post.likedBy.some(id => id.toString() === uid.toString());
        if (liked) {
            post.likedBy = post.likedBy.filter(id => id.toString() !== uid.toString());
            post.likes = Math.max(0, post.likes - 1);
        } else {
            post.likedBy.push(uid);
            post.likes = (post.likes || 0) + 1;
            
            // Create notification for post author
            try {
                await createNotification(
                    post.authorId,
                    uid,
                    'like',
                    'liked your post',
                    postId
                );
            } catch (err) {
                console.error('Failed to create notification:', err);
            }
        }
        await post.save();
        return post.toClient ? await post.toClient(user._id) : post;
    } catch (error) {
        throw error;
    }
}

const toggleSave = async (user, postId) => {
    try {
        const post = await postSchema.findById(postId);
        if (!post) throw new ApiError(404, 'Post not found');
        const uid = user._id;
        const saved = post.savedBy.some(id => id.toString() === uid.toString());
        if (saved) {
            post.savedBy = post.savedBy.filter(id => id.toString() !== uid.toString());
        } else {
            post.savedBy.push(uid);
        }
        await post.save();
        return post.toClient ? await post.toClient(user._id) : post;
    } catch (error) {
        throw error;
    }
}

const addComment = async (user, postId, content) => {
    try {
        const post = await postSchema.findById(postId);
        if (!post) throw new ApiError(404, 'Post not found');
        const comment = {
            author: user.username || user.name || 'Unknown',
            authorId: user._id,
            profilePicture: user.profilePicture || '',
            content,
            time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric' }),
            likes: 0,
            likedBy: []
        };
        post.commentsList.push(comment);
        await post.save();
        
        // Create notification for post author
        try {
            await createNotification(
                post.authorId,
                user._id,
                'comment',
                'commented on your post',
                postId
            );
        } catch (err) {
            console.error('Failed to create notification:', err);
        }
        
        return post.toClient ? await post.toClient(user._id) : post;
    } catch (error) {
        throw error;
    }
}

const toggleCommentLike = async (user, postId, commentId) => {
    try {
        const post = await postSchema.findById(postId);
        if (!post) throw new ApiError(404, 'Post not found');

        const comment = post.commentsList.id(commentId);
        if (!comment) throw new ApiError(404, 'Comment not found');

        const uid = user._id;
        const liked = (comment.likedBy || []).some(id => id.toString() === uid.toString());
        if (liked) {
            comment.likedBy = (comment.likedBy || []).filter(id => id.toString() !== uid.toString());
            comment.likes = Math.max(0, (comment.likes || 0) - 1);
        } else {
            comment.likedBy = comment.likedBy || [];
            comment.likedBy.push(uid);
            comment.likes = (comment.likes || 0) + 1;
        }

        await post.save();
        return post.toClient ? await post.toClient(user._id) : post;
    } catch (error) {
        throw error;
    }
}

const addReply = async (user, postId, commentId, content) => {
    try {
        const post = await postSchema.findById(postId);
        if (!post) throw new ApiError(404, 'Post not found');

        const comment = post.commentsList.id(commentId);
        if (!comment) throw new ApiError(404, 'Comment not found');

        const reply = {
            author: user.username || user.name || 'Unknown',
            authorId: user._id,
            profilePicture: user.profilePicture || '',
            content,
            time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric' }),
            replyingTo: comment.author,
            replyingToId: comment._id
        };
        comment.replies.push(reply);
        await post.save();
        
        // Create notification for comment author
        try {
            await createNotification(
                comment.authorId,
                user._id,
                'reply',
                'replied to your comment',
                postId
            );
        } catch (err) {
            console.error('Failed to create notification:', err);
        }
        
        return post.toClient ? await post.toClient(user._id) : post;
    } catch (error) {
        throw error;
    }
}

const addReplyToReply = async (user, postId, commentId, replyId, content) => {
    try {
        const post = await postSchema.findById(postId);
        if (!post) throw new ApiError(404, 'Post not found');
        
        const comment = post.commentsList.id(commentId);
        if (!comment) throw new ApiError(404, 'Comment not found');

        const parentReply = comment.replies.id(replyId);
        if (!parentReply) throw new ApiError(404, 'Parent reply not found');

        const reply = {
            author: user.username || user.name || 'Unknown',
            authorId: user._id,
            profilePicture: user.profilePicture || '',
            content,
            time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric' }),
            replyingTo: parentReply.author,
            replyingToId: parentReply._id
        };
        comment.replies.push(reply);
        await post.save();
        return post.toClient ? await post.toClient(user._id) : post;
    } catch (error) {
        throw error;
    }
}

const toggleReplyLike = async (user, postId, replyId) => {
    try {
        const post = await postSchema.findById(postId);
        if (!post) throw new ApiError(404, 'Post not found');

        let reply = null;
        for (const comment of post.commentsList) {
            reply = comment.replies.id(replyId);
            if (reply) break;
        }
        
        if (!reply) throw new ApiError(404, 'Reply not found');

        const uid = user._id;
        reply.likedBy = reply.likedBy || [];
        const liked = (reply.likedBy || []).some(id => id.toString() === uid.toString());
        if (liked) {
            reply.likedBy = reply.likedBy.filter(id => id.toString() !== uid.toString());
            reply.likes = Math.max(0, (reply.likes || 0) - 1);
        } else {
            reply.likedBy.push(uid);
            reply.likes = (reply.likes || 0) + 1;
        }

        await post.save();
        return post.toClient ? await post.toClient(user._id) : post;
    } catch (error) {
        throw error;
    }
}

const deletePost = async (user, postId) => {
    try {
        const post = await postSchema.findById(postId);
        if (!post) throw new ApiError(404, 'Post not found');
        
        // Check if user is the author
        if (post.authorId.toString() !== user._id.toString()) {
            throw new ApiError(403, 'You can only delete your own posts');
        }

        await postSchema.findByIdAndDelete(postId);
        
        // Update user's posts count
        try {
            await userSchema.findByIdAndUpdate(user._id, {
                $inc: { posts: -1 }
            });
        } catch (e) {
            console.warn('Failed to update user post count:', e);
        }

        return { message: 'Post deleted successfully' };
    } catch (error) {
        throw error;
    }
}

const getUserPosts = async (userId, currentUserId) => {
    try {
        const posts = await postSchema.find({ authorId: userId }).sort({ createdAt: -1 });
        const clientPosts = [];
        for (const p of posts) {
            clientPosts.push(p.toClient ? await p.toClient(currentUserId) : p);
        }
        return clientPosts;
    } catch (error) {
        throw error;
    }
}

const getTrendingTopics = async (limit = 10) => {
    try {
        // Get all posts and extract hashtags and keywords
        const posts = await postSchema.find().select('content').limit(500);
        
        const wordCount = {};
        const hashtagRegex = /#(\w+)/g;
        const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'from', 'this', 'that', 'it', 'be', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can']);
        
        posts.forEach(post => {
            const content = post.content.toLowerCase();
            
            // Extract hashtags
            let match;
            while ((match = hashtagRegex.exec(content)) !== null) {
                const hashtag = '#' + match[1];
                wordCount[hashtag] = (wordCount[hashtag] || 0) + 1;
            }
            
            // Extract common words (3+ characters, not stop words)
            const words = content.replace(/#\w+/g, '').split(/\s+/);
            words.forEach(word => {
                const cleaned = word.replace(/[^\w]/g, '');
                if (cleaned.length >= 3 && !stopWords.has(cleaned)) {
                    const key = '#' + cleaned;
                    wordCount[key] = (wordCount[key] || 0) + 1;
                }
            });
        });
        
        // Sort by frequency and get top topics
        const sortedTopics = Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([topic, count]) => ({ topic, count }));
        
        return sortedTopics;
    } catch (error) {
        throw error;
    }
};

const searchPosts = async (user, query) => {
    try {
        const searchRegex = new RegExp(query, 'i');
        const posts = await postSchema.find({
            content: searchRegex
        }).sort({ createdAt: -1 }).limit(100);
        
        const clientPosts = [];
        for (const p of posts) {
            clientPosts.push(p.toClient ? await p.toClient(user._id) : p);
        }
        return clientPosts;
    } catch (error) {
        throw error;
    }
};

const getFollowingPosts = async (user) => {
    try {
        const currentUser = await userSchema.findById(user._id);
        if (!currentUser) {
            throw new ApiError(404, 'User not found');
        }

        const followingIds = currentUser.following || [];
        const posts = await postSchema.find({
            authorId: { $in: followingIds }
        }).sort({ createdAt: -1 }).limit(100);
        
        const clientPosts = [];
        for (const p of posts) {
            clientPosts.push(p.toClient ? await p.toClient(user._id) : p);
        }
        return clientPosts;
    } catch (error) {
        throw error;
    }
};

const getSavedPosts = async (user) => {
    try {
        const posts = await postSchema.find({
            savedBy: user._id
        }).sort({ createdAt: -1 });
        
        const clientPosts = [];
        for (const p of posts) {
            clientPosts.push(p.toClient ? await p.toClient(user._id) : p);
        }
        return clientPosts;
    } catch (error) {
        throw error;
    }
};

const getLikedPosts = async (user) => {
    try {
        const posts = await postSchema.find({
            likedBy: user._id
        }).sort({ createdAt: -1 });
        
        const clientPosts = [];
        for (const p of posts) {
            clientPosts.push(p.toClient ? await p.toClient(user._id) : p);
        }
        return clientPosts;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createPost,
    getAllPosts,
    toggleLike,
    toggleSave,
    addComment,
    toggleCommentLike,
    addReply,
    addReplyToReply,
    toggleReplyLike,
    deletePost,
    getUserPosts,
    getTrendingTopics,
    searchPosts,
    getFollowingPosts,
    getSavedPosts,
    getLikedPosts
}
