const mongoose = require('mongoose');

const Post = mongoose.Schema({
	author: {
		type: String,
		required: true,
		trim: true
	},
	authorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'GenzUser',
		required: false
	},
	avatar: String,
	time: {
		type: String,
		default: () => {
			const d = new Date();
			try {
				return d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
			} catch (e) {
				return d.toISOString();
			}
		}
	},
	content: {
		type: String,
		trim: true,
		required: true
	},
	image: {
		type: mongoose.Schema.Types.Mixed,
		default: false
	},
	imageUrl: {
		type: String,
		default: ''
	},
	likes: {
		type: Number,
		default: 0
	},
	comments: {
		type: Number,
		default: 0
	},
	shares: {
		type: Number,
		default: 0
	},
	likedBy: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'GenzUser',
		default: []
	},
	savedBy: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'GenzUser',
		default: []
	}
	,
	commentsList: [
		{
			_id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
			author: String,
			authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'GenzUser' },
			profilePicture: String,
			content: String,
			time: String,
			likes: { type: Number, default: 0 },
			likedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'GenzUser', default: [] },
			replies: [{
				_id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
				author: String,
				authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'GenzUser' },
				profilePicture: String,
				content: String,
				time: String,
				likes: { type: Number, default: 0 },
				likedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'GenzUser', default: [] },
				replyingTo: { type: String, default: null },
				replyingToId: { type: mongoose.Schema.Types.ObjectId, default: null }
			}]
		}
	] 

}, { timestamps: true });

Post.methods.toClient = async function(userId) {
	const isLiked = userId ? this.likedBy.some(id => id.toString() === userId.toString()) : false;
	const isSaved = userId ? this.savedBy.some(id => id.toString() === userId.toString()) : false;
	
	// Get current username and profile picture from user
	let currentUsername = this.author;
	let currentProfilePicture = this.avatar || '';
	if (this.authorId) {
		try {
			const User = mongoose.model('GenzUser');
			const author = await User.findById(this.authorId).select('username name profilePicture');
			if (author) {
				currentUsername = author.username || author.name || this.author;
				if (author.profilePicture) {
					currentProfilePicture = author.profilePicture;
				}
			}
		} catch (err) {
			console.warn('Failed to fetch author data:', err);
		}
	}

	return {
		id: this._id,
		author: currentUsername,
		authorId: this.authorId,
		profilePicture: currentProfilePicture,
		avatar: currentProfilePicture,
		time: this.time,
		content: this.content,
		image: !!this.image,
		imageUrl: this.imageUrl || '',
		likes: this.likes,
		comments: this.commentsList ? this.commentsList.length : 0,
		shares: this.shares,
		isLiked,
		isSaved,
		commentsList: await mapComments(this.commentsList || [], userId)
	};
}

async function mapComments(comments, userId) {
	const User = mongoose.model('GenzUser');
	const mappedComments = [];

	for (const c of comments) {
		// Get current username and profile picture for comment author
		let commentUsername = c.author;
		let commentProfilePicture = c.profilePicture || '';
		if (c.authorId) {
			try {
				const author = await User.findById(c.authorId).select('username name profilePicture');
				if (author) {
					commentUsername = author.username || author.name || c.author;
					if (author.profilePicture) {
						commentProfilePicture = author.profilePicture;
					}
				}
			} catch (err) {
				console.warn('Failed to fetch comment author data:', err);
			}
		}

		const mappedReplies = [];
		for (const r of (c.replies || [])) {
			// Get current username and profile picture for reply author
			let replyUsername = r.author;
			let replyProfilePicture = r.profilePicture || '';
			let replyingToUsername = r.replyingTo;
			
			if (r.authorId) {
				try {
					const author = await User.findById(r.authorId).select('username name profilePicture');
					if (author) {
						replyUsername = author.username || author.name || r.author;
						if (author.profilePicture) {
							replyProfilePicture = author.profilePicture;
						}
					}
				} catch (err) {
					console.warn('Failed to fetch reply author data:', err);
				}
			}

			// Get current username for the person being replied to
			if (r.replyingTo) {
				// Find the original comment or reply to get their current username
				const findUserByOldName = async (oldName) => {
					// First check if it's the main comment author
					if (c.author === oldName && c.authorId) {
						try {
							const author = await User.findById(c.authorId).select('username name');
							if (author) return author.username || author.name || oldName;
						} catch (err) {
							console.warn('Failed to fetch replyingTo user data:', err);
						}
					}
					// Check other replies
					for (const otherReply of c.replies || []) {
						if (otherReply.author === oldName && otherReply.authorId) {
							try {
								const author = await User.findById(otherReply.authorId).select('username name');
								if (author) return author.username || author.name || oldName;
							} catch (err) {
								console.warn('Failed to fetch replyingTo user data:', err);
							}
						}
					}
					return oldName;
				};
				replyingToUsername = await findUserByOldName(r.replyingTo);
			}

			mappedReplies.push({
				id: r._id ? r._id.toString() : null,
				author: replyUsername,
				authorId: r.authorId,
				profilePicture: replyProfilePicture,
				content: r.content,
				time: r.time,
				likes: r.likes || 0,
				isLiked: userId ? ((r.likedBy || []).some(id => id.toString() === userId.toString())) : false,
				likedBy: r.likedBy || [],
				replyingTo: replyingToUsername
			});
		}

		mappedComments.push({
			id: c._id ? c._id.toString() : null,
			author: commentUsername,
			authorId: c.authorId,
			profilePicture: commentProfilePicture,
			content: c.content,
			time: c.time,
			likes: c.likes || 0,
			isLiked: userId ? ((c.likedBy || []).some(id => id.toString() === userId.toString())) : false,
			likedBy: c.likedBy || [],
			replyingTo: c.replyingTo || null,
			replies: mappedReplies
		});
	}

	return mappedComments;
}

const postSchema = mongoose.model('GenzPost', Post, 'genzposts');
module.exports = { postSchema };
