const expressAsyncHandler = require('express-async-handler');
const mongoose= require('mongoose');
const Users = require('../models/Users');
const Categories = require('../models/Categories');

exports.createCategory=expressAsyncHandler(async(req, res)=>{
    const userId = req.user.id;
    const title= req.body?.title.toLowerCase();
    if(!title) throw new Error('Title is missing');

    const user = await Users.findOne({_id: userId, isAdmin: true});
    if(!user) throw new Error('unauthorized user');

    //check if category already exists
    const isCategoryExists = await Categories.exists({title: title});
    if(isCategoryExists) throw new Error(`${title} category already exists`);

    try{
        const category = new Categories({
            _id: new mongoose.Types.ObjectId,
            title: title
        });
        await category.save();
        res.json(`${title} category has been created`);
    }catch(error){
        res.json(error);
    }
});

exports.fetchAllCategories= expressAsyncHandler(async(req, res)=>{
    try{
        const categories = await Categories.find().sort({title:1});
        res.json(categories);
    }catch(error){
        res.json(error);
    }
});
exports.fetchOneCategory=expressAsyncHandler(async(req, res)=>{
    const categoryId = req?.params?.id;
    try{
        const category = await Categories.findOne({_id: categoryId});
        res.json(category);
    }catch(error){
        res.json(error);
    }
});
exports.updateCategory= expressAsyncHandler(async(req, res)=>{
    const categoryId= req?.body?.id;
    const title= req?.body?.title;
    //check if user is admin
    const userId = req.user.id;
    const user = await Users.findOne({_id: userId, isAdmin: true});
    if(!user) throw new Error('unauthorized user')

    if(!categoryId || !title) throw new Error('Some fields are missing');
    try{
        const category = await Categories.findOneAndUpdate({_id: categoryId}, {$set:{title: title }}, {new: true});
        res.json('Category has been updated');
    }catch(error){
        res.json(error);
    }
});
exports.deleteCategory= expressAsyncHandler(async (req, res)=>{
    const categoryId = req.params?.id;
    const userId = req.user.id;
    if(!categoryId) throw new Error('Category id missing');

    //check if user isAdmin
    const user = await Users.findOne({_id: userId, isAdmin: true});
    if(!user) throw new Error('unauthorized user');
    try{
        const category = await Categories.findOneAndRemove({_id: categoryId});
        res.json(`${category.title} has been deleted`);
    }catch(error){
        res.json(error);
    }
});