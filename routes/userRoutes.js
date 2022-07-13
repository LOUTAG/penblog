const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware')
const {pictureUpload, profilePictureResize} = require('../middlewares/pictureUploadMiddleware');

module.exports=(app)=>{
    //register
    app.post('/api/users/register', userController.register);

    //login
    app.post('/api/users/login', userController.login);

    //fetch all users
    app.get('/api/users', authMiddleware, userController.fetchAll);

    //delete user by id
    app.delete('/api/users/:id', userController.deleteUser);

    //fetch one user
    app.get('/api/users/user/:id', userController.fetchOne);

    //fetch user by firstname & lastname
    app.post('/api/users/search', userController.searchUser);

    //user profile
    app.get('/api/users/profile/:id', authMiddleware, userController.userProfile);

    //update user profile
    app.put('/api/users/profile', authMiddleware, userController.updateUserProfile);

    //update user password
    app.put('/api/users/password', authMiddleware, userController.updateUserPassword);

    //fetch all followings
    app.get('/api/users/followings', authMiddleware, userController.fetchAllFollowings);

    //following
    app.put('/api/users/follow', authMiddleware, userController.followUser);

    //unfollow
    app.put('/api/users/unfollow', authMiddleware, userController.unfollowUser);

    app.get('/api/users/more-data/:id', userController.moreUserData);

    app.get('/api/users/:id', userController.fetchUserData);

    //block
    app.put('/api/users/block', authMiddleware, userController.blockUser);

    //unblock
    app.put('/api/users/unblock', authMiddleware, userController.unblockUser);

    //generate email Token
    app.post('/api/users/generate-email-token', authMiddleware, userController.generateVerificationToken);

    //verify account
    app.get('/api/users/verify-account/:token', userController.verifyAccount);

    //generate password Token
    app.post('/api/users/forget-password-token', userController.forgetPasswordToken);

    //verify password token to access to the form
    app.get('/api/users/verify-password-token/:token', userController.verifyTokenPassword)

    //reset password
    app.post('/api/users/reset-password', userController.resetPassword);

    //upload picture profile
    app.put('/api/users/profile-picture-upload', authMiddleware, pictureUpload.single("image"), profilePictureResize, userController.uploadProfilePicture);
}