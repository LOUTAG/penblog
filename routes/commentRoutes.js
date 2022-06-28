const {authMiddleware} = require('../middlewares/authMiddleware');
const commentController = require('../controllers/commentController');
module.exports = (app)=>{
    app.post('/api/comment', authMiddleware, commentController.createComment);
    app.get('/api/comments/:id', commentController.fetchAllComments);
    app.get('/api/comments/count/:id', commentController.countComments);
    app.get('/api/comment/:id', commentController.fetchOneComment);
    app.put('/api/comment/update/:id', authMiddleware, commentController.updateComment);
    app.delete('/api/comment/:id', authMiddleware, commentController.deleteComment);
};