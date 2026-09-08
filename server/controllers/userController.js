const userService = require('../services/userService');

const userController = {
    async getUser(req, res, next) {
        try {
            const user = await userService.getUser(req.user._id);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    },
    async updateUser(req, res, next) {
        try {
            const profilePictureFile = req.file || null;
            const updatedUser = await userService.updateUser(req.user._id, req.body, profilePictureFile);
            res.status(200).json({message:"User updated successfully",updatedUser});
        } catch (error) {
            next(error);
        }
    },
    async getUserById(req, res, next) {
        try {
            const user = await userService.getUserById(req.params.id);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    },
    async toggleFollow(req, res, next) {
        try {
            const followerId = req.user._id;
            const followedId = req.params.id;
            const { message } = await userService.toggleFollow(followerId, followedId);
            res.status(200).json({ message });
        } catch (error) {
            next(error);
        }
    },
    async getSuggestedUsers(req, res, next) {
        try {
            const currentUserId = req.user._id;
            const limit = parseInt(req.query.limit) || 5;
            const users = await userService.getSuggestedUsers(currentUserId, limit);
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    },
    async getFollowers(req, res, next) {
        try {
            const userId = req.params.id;
            const followers = await userService.getFollowers(userId);
            res.status(200).json(followers);
        } catch (error) {
            next(error);
        }
    },
    async getFollowing(req, res, next) {
        try {
            const userId = req.params.id;
            const following = await userService.getFollowing(userId);
            res.status(200).json(following);
        } catch (error) {
            next(error);
        }
    },
    async removeFollower(req, res, next) {
        try {
            const userId = req.user._id;
            const followerId = req.params.id;
            const { message } = await userService.removeFollower(userId, followerId);
            res.status(200).json({ message });
        } catch (error) {
            next(error);
        }
    },
    async searchUsers(req, res, next) {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({ message: 'Search query is required' });
            }
            const users = await userService.searchUsers(query);
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = userController;
