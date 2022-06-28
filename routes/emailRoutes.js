const emailController = require('../controllers/emailController');
const {authMiddleware} = require('../middlewares/authMiddleware');

module.exports = (app)=>{
    app.post('/api/emails/send', authMiddleware, emailController.sendEmail);
};