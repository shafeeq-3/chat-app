const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const { auth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.route('/')
    .get(auth, postsController.getAllPosts)

router.route('/create')
    .post(auth, upload.single('image'), postsController.createPost)

router.route('/:id/like')
    .post(auth, postsController.toggleLike)

router.route('/:id/save')
    .post(auth, postsController.toggleSave)

router.route('/:id/comment')
    .post(auth, postsController.addComment)

router.route('/:id/comment/:commentId/like')
    .post(auth, postsController.toggleCommentLike)

router.route('/:id/comment/:commentId/reply')
    .post(auth, postsController.addReply)

router.route('/:id/comment/:commentId/reply/:replyId')
    .post(auth, postsController.addReplyToReply)

router.route('/:id/reply/:replyId/like')
    .post(auth, postsController.toggleReplyLike)

router.route('/:id')
    .delete(auth, postsController.deletePost)

router.route('/user/:userId')
    .get(auth, postsController.getUserPosts)

router.route('/trending/topics')
    .get(auth, postsController.getTrendingTopics)

router.route('/search')
    .get(auth, postsController.searchPosts)

router.route('/following')
    .get(auth, postsController.getFollowingPosts)

router.route('/saved')
    .get(auth, postsController.getSavedPosts)

router.route('/liked')
    .get(auth, postsController.getLikedPosts)

module.exports = router;
