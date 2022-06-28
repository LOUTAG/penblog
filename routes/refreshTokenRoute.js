const refreshTokenController = require('../controllers/refreshTokenController');
module.exports=(app)=>{
    app.get('/api/refresh-token', refreshTokenController.refreshToken);
}