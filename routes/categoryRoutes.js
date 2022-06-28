const categoryController = require('../controllers/categoryController');
const {authMiddleware} = require('../middlewares/authMiddleware');
module.exports=(app)=>{
    app.post('/api/categories/create', authMiddleware, categoryController.createCategory);
    app.get('/api/categories/all', categoryController.fetchAllCategories);
    app.get('/api/categories/:id', categoryController.fetchOneCategory);
    app.put('/api/categories/update', authMiddleware, categoryController.updateCategory);
    app.delete('/api/categories/delete/:id', authMiddleware, categoryController.deleteCategory);
};