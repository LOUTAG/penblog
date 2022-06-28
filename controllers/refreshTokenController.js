const expressAsyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { generateAccessToken } = require('../config/token');
const keys = require('../config/keys');
const Users= require('../models/Users');
exports.refreshToken= expressAsyncHandler(async(req, res)=>{
    const authHeader = req?.headers?.authorization;
    const refreshToken = authHeader && authHeader.split(" ")[1];
    if(refreshToken){
        try{
            //Is refreshToken valid ?
            const decoded= jwt.verify(refreshToken, keys.REFRESH_TOKEN);

            //check if user still exists
            const isUserExists = await Users.exists({_id: decoded.id});
            if(!isUserExists) {
                let e = new Error('Invalid user');
                e.name= "InvalidUser";
                throw e;
            };

            //refresh accessToken
            const refreshAccessToken = generateAccessToken(decoded.id);

            res.json({refreshAccessToken});
        }catch(error){
            res.status(401).json(error);
        }
    }else{
        throw new Error("Undefined refresh token");
    }
});