const { userSchema } = require('../models/userModel');
const { ApiError } = require('../middlewares/ApiError');
const { uploadImage, deleteImage } = require('../utils/imageUpload');
const { createNotification } = require('./notificationService');

const getUser = async (userId) => {
    try {
        const user = await userSchema.findById(userId).select('-password');
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        // Filter out any empty strings from followers and following arrays
        user.followers = user.followers.filter(id => id !== '');
        user.following = user.following.filter(id => id !== '');
        return user;
    } catch (error) {
        throw error;
    }
};

const getUserById = async (userId) => {
    try {
        const user = await userSchema.findById(userId).select('-password');
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        // Filter out any empty strings from followers and following arrays
        user.followers = user.followers.filter(id => id !== '');
        user.following = user.following.filter(id => id !== '');
        return user;
    } catch (error) {
        throw error;
    }
};

const updateUser = async (userId, body, profilePictureFile = null) => {
    try {
        // Validate username if it's being updated
        if (body.username) {
            // Username format validation: 3-20 characters, letters/numbers/underscores only
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            if (!usernameRegex.test(body.username)) {
                throw new ApiError(400, 'Username is invalid. Must be 3-20 characters long and contain only letters, numbers, and underscores.');
            }

            // Check if username already exists (excluding current user)
            const existingUser = await userSchema.findOne({ 
                username: body.username, 
                _id: { $ne: userId } 
            });
            if (existingUser) {
                throw new ApiError(409, 'This username already exists');
            }
        }

        // Get current user to check for existing profile picture
        const currentUser = await userSchema.findById(userId);
        if (!currentUser) {
            throw new ApiError(404, 'User not found');
        }

        // Remove followers and following from body to prevent corruption
        const { followers, following, ...updateData } = body;

        // Handle profile picture upload
        if (profilePictureFile) {
            try {
                // Delete old profile picture if it exists
                if (currentUser.profilePicture) {
                    await deleteImage(currentUser.profilePicture);
                }
                
                // Upload new profile picture
                const imageUrl = await uploadImage(profilePictureFile.buffer);
                updateData.profilePicture = imageUrl;
            } catch (uploadError) {
                console.error('Error uploading image:', uploadError);
                throw new ApiError(400, 'Failed to upload profile picture');
            }
        }

        const user = await userSchema.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
        
        // Filter out any empty strings from followers and following arrays
        user.followers = user.followers.filter(id => id !== '');
        user.following = user.following.filter(id => id !== '');
        
        return user;
    } catch (error) {
        throw error;
    }
};

const toggleFollow = async (followerId, followedId) => {
    try {
        if (followerId.toString() === followedId.toString()) {
            throw new ApiError(400, 'You cannot follow yourself.');
        }

        const follower = await userSchema.findById(followerId);
        const followed = await userSchema.findById(followedId);

        if (!follower || !followed) {
            throw new ApiError(404, 'User not found.');
        }

        const isFollowing = follower.following.includes(followedId);

        if (isFollowing) {
            // Unfollow
            follower.following = follower.following.filter(id => id.toString() !== followedId.toString());
            followed.followers = followed.followers.filter(id => id.toString() !== followerId.toString());
            await follower.save();
            await followed.save();
            return { message: 'User unfollowed successfully.' };
        } else {
            // Follow
            follower.following.push(followedId);
            followed.followers.push(followerId);
            await follower.save();
            await followed.save();
            
            // Create notification for followed user
            try {
                await createNotification(
                    followedId,
                    followerId,
                    'follow',
                    'started following you',
                    null
                );
            } catch (err) {
                console.error('Failed to create notification:', err);
            }
            
            return { message: 'User followed successfully.' };
        }
    } catch (error) {
        throw error;
    }
};

const getSuggestedUsers = async (currentUserId, limit = 5) => {
    try {
        const currentUser = await userSchema.findById(currentUserId);
        if (!currentUser) {
            throw new ApiError(404, 'User not found');
        }

        // Get users that the current user is not following and exclude self
        const suggestedUsers = await userSchema.find({
            _id: { 
                $ne: currentUserId,
                $nin: currentUser.following 
            }
        })
        .select('_id name username profilePicture')
        .limit(limit);

        return suggestedUsers;
    } catch (error) {
        throw error;
    }
};

const getFollowers = async (userId) => {
    try {
        const user = await userSchema.findById(userId).populate('followers', '_id name username profilePicture');
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Manually fetch follower details if populate doesn't work
        const followerIds = user.followers.filter(id => id !== '');
        const followers = await userSchema.find({ _id: { $in: followerIds } })
            .select('_id name username profilePicture');

        return followers;
    } catch (error) {
        throw error;
    }
};

const getFollowing = async (userId) => {
    try {
        const user = await userSchema.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Manually fetch following details
        const followingIds = user.following.filter(id => id !== '');
        const following = await userSchema.find({ _id: { $in: followingIds } })
            .select('_id name username profilePicture');

        return following;
    } catch (error) {
        throw error;
    }
};

const removeFollower = async (userId, followerId) => {
    try {
        const user = await userSchema.findById(userId);
        const follower = await userSchema.findById(followerId);

        if (!user || !follower) {
            throw new ApiError(404, 'User not found');
        }

        // Remove follower from user's followers list
        user.followers = user.followers.filter(id => id.toString() !== followerId.toString());
        
        // Remove user from follower's following list
        follower.following = follower.following.filter(id => id.toString() !== userId.toString());

        await user.save();
        await follower.save();

        return { message: 'Follower removed successfully' };
    } catch (error) {
        throw error;
    }
};

const searchUsers = async (query) => {
    try {
        const searchRegex = new RegExp(query, 'i');
        const users = await userSchema.find({
            $or: [
                { name: searchRegex },
                { username: searchRegex }
            ]
        })
        .select('_id name username profilePicture bio')
        .limit(20);

        return users;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getUser,
    getUserById,
    updateUser,
    toggleFollow,
    getSuggestedUsers,
    getFollowers,
    getFollowing,
    removeFollower,
    searchUsers
};
