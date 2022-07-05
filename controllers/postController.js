const mongoose = require("mongoose");
const Posts = require("../models/Posts");
const Users = require("../models/Users");
const Comments = require("../models/Comments");
const Categories = require("../models/Categories");
const { validateMongodbId } = require("../utils/validateMongodbId");
const expressAsyncHandler = require("express-async-handler");
const Filter = require("bad-words");
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");

exports.createPost = expressAsyncHandler(async (req, res) => {
  //1- Check the fields
  let { title, description, category } = req?.body;
  if (!title || !description || !category)
    throw new Error("Some fields are empty");

  //2- Check the user
  const userId = req.user._id;
  if (req.user.isBlocked) throw new Error("Your account is blocked");

  //3- clean bad-words
  const filter = new Filter();
  title = filter.clean(title);
  description = filter.clean(description);

  //check if category is correct
  const checkCategoryId = await Categories.exists({ _id: category });
  if (!checkCategoryId) throw new Error("Category doesn't exist");

  //1- create the post
  const post = new Posts({
    _id: new mongoose.Types.ObjectId(),
    title,
    category,
    description,
    author: userId,
  });

  //2- upload picture if exist
  if (req.file) {
    //*** 1- file data ***
    const buffer = req.file.buffer;
    const imageName = req.file.filename.split(".")[0];

    //*** 2- upload to cloudinary ***
    const imgUploaded = await cloudinaryUploadImg(buffer, imageName);

    // *** 3- Update the post ***
    post.image = imgUploaded.secure_url;
    post.imageId = imgUploaded.public_id;
  }
  //3- Save the post in bdd
  try {
    await post.save();
    await Users.findOneAndUpdate({ _id: userId }, { $inc: { postCount: 1 } });
    res.json("new post has been created");
  } catch (error) {
    res.json(error);
  }
  // }
});
exports.allPosts = expressAsyncHandler(async (req, res) => {
  const { offset, limit, time } = req?.body;
  if (offset === undefined || limit === undefined || time === undefined)
    throw new Error("Invalid URL");

  try {
    const posts = await Posts.find({createdAt: {$lt: time}})
      .populate("author", {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        profilePhoto: 1,
      })
      .populate("likes", { _id: 1, firstName: 1, lastName: 1 })
      .populate("dislikes", { _id: 1, firstName: 1, lastName: 1 })
      .populate("category", { title: 1 })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    res.json(posts);
  } catch (error) {
    res.json(error);
  }
});
exports.postsByCat = expressAsyncHandler(async (req, res) => {
  const {id, offset, limit, time } = req?.body;
  if(!id || offset===undefined || !limit || !time) throw new Error("Invalid URL");
  validateMongodbId(id);
  try {
    const response = await Posts.find({ category: id, createdAt: {$lt : time}})
      .populate("author", {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        profilePhoto: 1,
      })
      .populate("likes", { _id: 1, firstName: 1, lastName: 1 })
      .populate("dislikes", { _id: 1, firstName: 1, lastName: 1 })
      .populate("category", { title: 1 })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    res.json(response);
  } catch (error) {
    res.json(error);
  }
});
exports.postsByUser = expressAsyncHandler(async (req, res) => {
  const id = req?.params?.id;
  if (!id) throw new Error("Invalid url");
  validateMongodbId(id);
  try {
    const posts = await Posts.find({ author: id })
      .populate("author", {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        profilePhoto: 1,
      })
      .populate("likes", { _id: 1, firstName: 1, lastName: 1 })
      .populate("dislikes", { _id: 1, firstName: 1, lastName: 1 })
      .populate("category", { title: 1 });
    res.json(posts);
  } catch (error) {
    res.json(error);
  }
});

exports.postsById = expressAsyncHandler(async (req, res) => {
  const id = req?.params?.id;
  if (!id) throw new error("Id undefined");
  validateMongodbId(id);
  try {
    const post = await Posts.findOneAndUpdate(
      { _id: id },
      { $inc: { numberOfViews: 1 } },
      { new: true }
    )
      .populate("author", { _id: 1, firstName: 1, lastName: 1, email: 1 })
      .populate("category", { title: 1 });
    res.json(post);
  } catch (error) {
    res.json(error);
  }
});

exports.updatePost = expressAsyncHandler(async (req, res) => {
  const postId = req?.params?.id;
  const userId = req?.user?.id;
  validateMongodbId(postId);
  validateMongodbId(userId);
  let { title, description } = req.body;
  if (!title || !description) throw new Error("Some fields are empty");

  //clean bad-words
  const filter = new Filter();
  title = filter.clean(title);
  description = filter.clean(description);

  try {
    const post = await Posts.findOne({ _id: postId, author: userId }).populate(
      "author",
      { _id: 1, firstName: 1, lastName: 1, profilePhoto: 1 }
    );
    if (!post) throw "no post found";
    post.title = title;
    post.description = description;

    //2- upload picture if exist
    if (req.file) {
      //*** 1- data ***
      //Buffer, because file isn't saved on server
      const buffer = req.file.buffer;

      //public_id (use later to delete old picture)
      const imageName = req.file.filename.split(".")[0];

      //*** 2- upload to cloudinary ***
      const imgUploaded = await cloudinaryUploadImg(buffer, imageName);

      // *** 3- delete the old picture if it's not the default one ***
      if (post.imageId) {
        const publicId = post.imageId;
        await cloudinaryDeleteImg(publicId);
      }

      // *** 4- Update the post ***
      post.image = imgUploaded.secure_url;
      post.imageId = imgUploaded.public_id;
    }
    const postUpdated = await post.save();
    res.json(postUpdated);
  } catch (error) {
    res.json(error);
  }
});
exports.deletePost = expressAsyncHandler(async (req, res) => {
  const userId = req?.user?.id;
  const postId = req?.params?.id;
  validateMongodbId(userId);
  validateMongodbId(postId);
  try {
    const post = await Posts.findOneAndRemove(
      { _id: postId, author: userId },
      { imageId: 1 }
    );
    if (!post) throw "Post not found";
    //we have to delete the image if exist
    if (post.imageId) await cloudinaryDeleteImg(post.imageId);

    //we have to delete all the comment of this post
    const comments = await Comments.deleteMany({ post: postId });
    console.log(comments.deletedCount + " comments have been deleted");

    await Users.findOneAndUpdate({ _id: userId }, { $inc: { postCount: -1 } });
    res.json("post has been removed");
  } catch (error) {
    res.json(error);
  }
});
exports.likePost = expressAsyncHandler(async (req, res) => {
  const postId = req.params?.id;
  const userId = req.user.id;
  console.log(userId);
  try {
    const post = await Posts.findOne({ _id: postId });

    //1- Condition if already like
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes = post.likes.filter(
        (item) => item.toString() !== userId && item
      );
      const postSaved = await post.save();
      return res.json(postSaved);
    }
    //2- Condition is not already like
    //check if userId is in dislikes array, and don't return it;
    post.dislikes = post.dislikes.filter(
      (item) => item.toString() !== userId && item
    );

    //check if userId is in likes array, if not push it
    if (!isLiked) post.likes.push(userId);

    const postSaved = await post.save();
    res.json(postSaved);
  } catch (error) {
    res.json(error);
  }
});
exports.dislikePost = expressAsyncHandler(async (req, res) => {
  const postId = req.params?.id;
  validateMongodbId(postId);
  const userId = req.user.id;

  try {
    const post = await Posts.findOne({ _id: postId });

    //1- Check if already disliked
    const isDisliked = post.dislikes.includes(userId);
    if (isDisliked) {
      post.dislikes = post.dislikes.filter(
        (item) => item.toString() !== userId && item
      );
      const postSaved = await post.save();
      return res.json(postSaved);
    }

    //2- remove from the likes array if exist
    post.likes = post.likes.filter(
      (item) => item.toString() !== userId && item
    );

    //3- add into dislikes array if not already disliked
    if (!isDisliked) post.dislikes.push(userId);

    //4- saved
    const postSaved = await post.save();
    res.json(postSaved);
  } catch (error) {
    res.json(error);
  }
});
