const jwt = require('jsonwebtoken');
const keys = require('./keys');

exports.generateAccessToken = (id)=>{
    return jwt.sign({id}, keys.ACCESS_TOKEN, {expiresIn: keys.ACCESS_TOKEN_EXP});
    //sign mean that we are going to generate a token based on it id
};

exports.generateRefreshToken=(id)=>{
    return jwt.sign({id}, keys.REFRESH_TOKEN, {expiresIn: keys.REFRESH_TOKEN_EXP});
}