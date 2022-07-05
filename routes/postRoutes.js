const postController = require('../controllers/postController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { pictureUpload, postPictureResize } = require('../middlewares/pictureUploadMiddleware');

module.exports=(app)=>{
    app.post('/api/posts/create', authMiddleware, pictureUpload.single("image"),  postPictureResize, postController.createPost);
    app.post('/api/posts/cat', postController.postsByCat);
    app.post('/api/posts', postController.allPosts);
    app.get('/api/posts/user/:id', postController.postsByUser);
    app.get('/api/posts/:id', postController.postsById);
    app.put('/api/posts/:id', authMiddleware, pictureUpload.single("image"), postPictureResize, postController.updatePost);
    app.delete('/api/posts/:id', authMiddleware, postController.deletePost);
    app.put('/api/posts/like/:id', authMiddleware, postController.likePost);
    app.put('/api/posts/dislike/:id', authMiddleware, postController.dislikePost);
}