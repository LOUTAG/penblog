const mongoose= require('mongoose');
const Posts = require('../models/Posts');
const Users = require('../models/Users');
const Comments = require('../models/Comments');
const Categories = require('../models/Categories');
const { validateMongodbId } = require("../utils/validateMongodbId");
const expressAsyncHandler = require("express-async-handler");
const Filter = require('bad-words');
const { cloudinaryUploadImg, cloudinaryDeleteImg } = require("../utils/cloudinary");
const fs = require('fs');


exports.createPost = expressAsyncHandler(async(req, res)=>{
    //1- Check the fields
    const {title, description, category}=req?.body;
    if(!title || !description || !category) throw new Error('Some fields are empty');

    //2- Check the user
    const userId= req.user._id;
    if(req.user.isBlocked) throw new Error('Your account is blocked');

    //3- Chekc if bad-words
    const filter = new Filter();
    const newBadWords = ['fait chier', 'putain', 'enculer', 'con', 'connard', 'connasse', 'salaud', 'salope', 'ta gueule'];
    filter.addWords(...newBadWords);
    const isProfaneTitle = filter.clean(title);
    const isProfaneDescription = filter.clean(description);
    //Bad word return true

    // if(isProfaneTitle || isProfaneDescription){
    //     try{
    //         //block account
    //         await Users.findOneAndUpdate({_id: userId}, {$set: {isBlocked: true}});
    //     }catch(error){
    //         res.json(error);
    //     }
    //     throw new Error('Creating failed because it contains profane words');
    // }else{
        const checkCategoryId = await Categories.exists({_id: category});
        if(!checkCategoryId) throw new Error("Category doesn't exist");

        //1- create the post
        const post = new Posts({
            _id: new mongoose.Types.ObjectId(),
            title,
            category,
            description,
            author: userId,
        });

        //2- upload picture if exist
        if(req.file){
            const pathname = `public/images/posts/${req.file.filename}`;
            const imageName = req.file.filename.split('.')[0];
            const imageUploaded = await cloudinaryUploadImg(pathname, imageName);
            post.image= imageUploaded.url;
            post.imageId= imageUploaded.publicId;
            console.log(imageUploaded);
            
            //2* - delete the picture from local
            fs.unlink(pathname, (err)=>{
                if(err) throw err;
                console.log(`picture from ${pathname} has been deleted`);
            })
        }
        //3- Save the post in bdd
        try{
           await post.save();
           await Users.findOneAndUpdate({_id: userId}, {$inc: {postCount: 1}});
           res.json('new post has been created');
        }catch(error){
            res.json(error);
        }
    // }
});
exports.allPosts=expressAsyncHandler(async(req, res)=>{
    try{
        const posts = await Posts.find().populate('author', {_id: 1, firstName: 1, lastName:1, email: 1, profilePhoto:1}).populate('likes', {_id:1, firstName:1, lastName:1}).populate('dislikes', {_id:1, firstName:1, lastName:1}).populate('category', {title: 1}).sort({createdAt: -1});
        res.json(posts);
    }catch(error){
        res.json(error);
    }
  });
exports.postsByCat=expressAsyncHandler(async(req, res)=>{
    const id = req?.params?.id;
    if(!id) throw new Error('Invalid URL');
    validateMongodbId(id);
    try{
        const response = await Posts.find({category: id}).populate('author', {_id: 1, firstName: 1, lastName:1, email: 1, profilePhoto:1}).populate('likes', {_id:1, firstName:1, lastName:1}).populate('dislikes', {_id:1, firstName:1, lastName:1}).populate('category', {title: 1}).sort({createdAt: -1});
        res.json(response);
    }catch(error){
        res.json(error);
    }
});
exports.postsByUser=expressAsyncHandler(async(req, res)=>{
    const id = req?.params?.id;
    if(!id) throw new Error('Invalid url');
    validateMongodbId(id);
    try{
        const posts = await Posts.find({author: id}).populate('author',{_id: 1, firstName: 1, lastName:1, email: 1, profilePhoto:1}).populate('likes', {_id:1, firstName:1, lastName:1}).populate('dislikes', {_id:1, firstName:1, lastName:1}).populate('category', {title: 1});
        res.json(posts);
    }catch(error){
        res.json(error);
    }
});

exports.postsById =expressAsyncHandler(async(req, res)=>{
    const id = req?.params?.id;
    if(!id) throw new error('Id undefined');
    validateMongodbId(id);
    try{
        const post = await Posts.findOneAndUpdate({_id: id}, {$inc : {numberOfViews: 1}}, {new: true}).populate('author', {_id: 1, firstName:1, lastName:1, email:1}).populate('category', {title: 1});
        res.json(post);
    }catch(error){
        res.json(error);
    };
});

exports.updatePost=expressAsyncHandler(async(req, res)=>{
    const postId = req?.params?.id;
    const userId = req?.user?.id;
    validateMongodbId(postId);
    validateMongodbId(userId);
    const {title, description} = req.body;
    if(!title || !description) throw new Error('Some fields are empty');

    try{
        const post = await Posts.findOne({_id: postId, author: userId}).populate('author', {_id:1, firstName:1, lastName:1, profilePhoto:1});;
        if(!post) throw ('no post found');
        post.title= title;
        post.description= description;

        //2- upload picture if exist
        if(req.file){
            //url
            const pathname = `public/images/posts/${req.file.filename}`;
            //publicId for cloudinary (use to delete if future upload)
            const imageName = req.file.filename.split('.')[0];
            //upload
            const imageUploaded = await cloudinaryUploadImg(pathname, imageName);

            //delete the old picture if it's not the default one
            if(post.imageId){
                const publicId = post.imageId;
                await cloudinaryDeleteImg(publicId);
            }

            //update the db with the new one
            post.image= imageUploaded.url;
            post.imageId= imageUploaded.publicId;
            
            // //2* - delete the new picture from our server
            fs.unlink(pathname, (err)=>{
                if(err) throw err;
                console.log(`picture from ${pathname} has been deleted`);
            });
        }
        const postUpdated = await post.save();
        res.json(postUpdated);
    }catch(error){
        res.json(error);
    }
});
exports.deletePost=expressAsyncHandler(async(req, res)=>{
    const userId = req?.user?.id;
    const postId = req?.params?.id;
    validateMongodbId(userId);
    validateMongodbId(postId);
    try{
        const post = await Posts.findOneAndRemove({_id: postId, author: userId}, {imageId:1});
        if (!post) throw 'Post not found';
        //we have to delete the image if exist
        if(post.imageId) await cloudinaryDeleteImg(post.imageId);

        //we have to delete all the comment of this post
        const comments = await Comments.deleteMany({post: postId});
        console.log(comments.deletedCount+' comments have been deleted');

        await Users.findOneAndUpdate({_id: userId}, {$inc: {postCount: -1}})
        res.json("post has been removed");
    }catch(error){
        res.json(error);
    }
});
exports.likePost = expressAsyncHandler(async(req, res)=>{
    const postId = req.params?.id;
    const userId = req.user.id;
    console.log(userId);
    try{
        const post = await Posts.findOne({_id: postId});

        //1- Condition if already like
        const isLiked = post.likes.includes(userId);
        if(isLiked){
            post.likes = post.likes.filter(item=>item.toString()!==userId && item);
            const postSaved = await post.save();
            return res.json(postSaved);
        }
        //2- Condition is not already like
        //check if userId is in dislikes array, and don't return it;
        post.dislikes = post.dislikes.filter(item=>item.toString()!==userId && item);
        
        //check if userId is in likes array, if not push it
        if(!isLiked) post.likes.push(userId);

        const postSaved = await post.save();
        res.json(postSaved);

    }catch(error){
        res.json(error);
    }
});
exports.dislikePost= expressAsyncHandler(async(req, res)=>{
    const postId = req.params?.id;
    validateMongodbId(postId);
    const userId = req.user.id;

    try{
        const post = await Posts.findOne({_id: postId});
        
        //1- Check if already disliked
        const isDisliked = post.dislikes.includes(userId);
        if(isDisliked){
            post.dislikes = post.dislikes.filter(item=>item.toString()!==userId && item);
            const postSaved = await post.save();
            return res.json(postSaved);
        };

        //2- remove from the likes array if exist
        post.likes = post.likes.filter(item=>item.toString()!==userId && item);

        //3- add into dislikes array if not already disliked
        if(!isDisliked) post.dislikes.push(userId);

        //4- saved
        const postSaved = await post.save();
        res.json(postSaved);
        
    }catch(error){
        res.json(error);
    }
});
