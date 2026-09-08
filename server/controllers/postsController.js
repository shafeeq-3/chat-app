const postsService = require('../services/postsService');

const postsController = {
    async createPost(req, res, next) {
        try {
            const imageFile = req.file || null;
            const post = await postsService.createPost(req.user, req.body, imageFile);
            res.status(201).json({ message: 'Post created', post });
        } catch (error) {
            next(error);
        }
    },
    async getAllPosts(req, res, next) {
        try {
            const posts = await postsService.getAllPosts(req.user);
            res.status(200).json(posts);
        } catch (error) {
            next(error);
        }
    }
    ,
    async toggleLike(req, res, next) {
        try {
            const post = await postsService.toggleLike(req.user, req.params.id);
            res.status(200).json({ message: 'Toggled like', post });
        } catch (error) {
            next(error);
        }
    },
    async toggleSave(req, res, next) {
        try {
            const post = await postsService.toggleSave(req.user, req.params.id);
            res.status(200).json({ message: 'Toggled save', post });
        } catch (error) {
            next(error);
        }
    },
    async addComment(req, res, next) {
        try {
            const { content } = req.body;
            if (!content || !content.trim()) {
                return res.status(400).json({ message: 'Comment cannot be empty' });
            }
            const post = await postsService.addComment(req.user, req.params.id, content.trim());
            res.status(201).json({ message: 'Comment added', post });
        } catch (error) {
            next(error);
        }
    }
    ,
    async toggleCommentLike(req, res, next) {
        try {
            const post = await postsService.toggleCommentLike(req.user, req.params.id, req.params.commentId);
            res.status(200).json({ message: 'Toggled comment like', post });
        } catch (error) {
            next(error);
        }
    },
    async addReply(req, res, next) {
        try {
            const { content } = req.body;
            if (!content || !content.trim()) {
                return res.status(400).json({ message: 'Reply cannot be empty' });
            }
            const post = await postsService.addReply(req.user, req.params.id, req.params.commentId, content.trim());
            res.status(201).json({ message: 'Reply added', post });
        } catch (error) {
            next(error);
        }
    }
    ,
    async addReplyToReply(req, res, next) {
        try {
            const { content } = req.body;
            if (!content || !content.trim()) {
                return res.status(400).json({ message: 'Reply cannot be empty' });
            }
            const post = await postsService.addReplyToReply(req.user, req.params.id, req.params.commentId, req.params.replyId, content.trim());
            res.status(201).json({ message: 'Reply added', post });
        } catch (error) {
            next(error);
        }
    },
    async toggleReplyLike(req, res, next) {
        try {
            const post = await postsService.toggleReplyLike(req.user, req.params.id, req.params.replyId);
            res.status(200).json({ message: 'Toggled reply like', post });
        } catch (error) {
            next(error);
        }
    },
    async deletePost(req, res, next) {
        try {
            const result = await postsService.deletePost(req.user, req.params.id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },
    async getUserPosts(req, res, next) {
        try {
            const posts = await postsService.getUserPosts(req.params.userId, req.user._id);
            res.status(200).json(posts);
        } catch (error) {
            next(error);
        }
    },
    async getTrendingTopics(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const topics = await postsService.getTrendingTopics(limit);
            res.status(200).json(topics);
        } catch (error) {
            next(error);
        }
    },
    async searchPosts(req, res, next) {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({ message: 'Search query is required' });
            }
            const posts = await postsService.searchPosts(req.user, query);
            res.status(200).json(posts);
        } catch (error) {
            next(error);
        }
    },
    async getFollowingPosts(req, res, next) {
        try {
            const posts = await postsService.getFollowingPosts(req.user);
            res.status(200).json(posts);
        } catch (error) {
            next(error);
        }
    },
    async getSavedPosts(req, res, next) {
        try {
            const posts = await postsService.getSavedPosts(req.user);
            res.status(200).json(posts);
        } catch (error) {
            next(error);
        }
    },
    async getLikedPosts(req, res, next) {
        try {
            const posts = await postsService.getLikedPosts(req.user);
            res.status(200).json(posts);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = postsController;
