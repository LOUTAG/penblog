const mongoose = require('mongoose');
const expressAsyncHandler = require('express-async-handler');
const Comments = require('../models/Comments');
const {validateMongodbId} = require('../utils/validateMongodbId');

exports.createComment=expressAsyncHandler(async(req, res )=>{
    const userId = req.user.id;
    const postId = req.body?.postId;
    const content = req.body?.content;
    if(!content) throw new Error('Content is missing');

    validateMongodbId(postId);
    const comment = new Comments({
        _id: new mongoose.Types.ObjectId(),
        post: postId,
        user: userId,
        content: content
    });
    await comment.save();
    await comment.populate('user')
    res.json(comment);
});

exports.fetchAllComments= expressAsyncHandler(async(req, res)=>{
    const postId = req.params?.id;
    validateMongodbId(postId);
    try{
        const comments = await Comments.find({post: postId}).populate('user', {_id:1 ,firstName: 1, lastName:1, profilePhoto:1}).sort({createdAt: -1});
        //sort(-) means decreased and sort(+) means increased 
        res.json(comments);
    }catch(error){
        res.json(error);
    }
});
exports.countComments= expressAsyncHandler(async(req, res)=>{
    const postId= req.params?.id;
    if(!postId) throw new Error("Post doesn't exist");
    try{
        const count = await Comments.count({post: postId});
        res.json(count);
    }catch(error){
        res.json(error);
    }
})

exports.fetchOneComment=expressAsyncHandler(async(req, res)=>{
    const commentId = req?.params?.id;
    validateMongodbId(commentId);
    try{
        const comment = await Comments.findOne({_id: commentId}).populate("user", {_id:1 ,firstName: 1, lastName:1});
        res.json(comment);
    }catch(error){
        res.json(error);
    }
});

exports.updateComment=expressAsyncHandler(async(req, res)=>{
    const userId = req.user.id;
    const commentId = req.params?.id;
    validateMongodbId(commentId);

    const content = req.body?.content;
    if(!content) throw new Error('Content field is missing');
    try{
        const comment = await Comments.findOneAndUpdate({_id: commentId, user: userId}, {$set: {content: content}}, {new: true});
        res.json('Comment has been edited');
    }catch{
        res.json(error);
    }
});
exports.deleteComment= expressAsyncHandler(async(req, res)=>{
    const userId = req.user.id;
    const commentId= req.params?.id;
    validateMongodbId(commentId);

    try{
        const comment = await Comments.deleteOne({_id: commentId, user: userId});
        res.json(comment);
    }catch(error){
        res.json(error);
    }
});