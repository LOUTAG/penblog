const mongoose = require("mongoose");
const Users = require("../models/Users");
const Posts = require("../models/Posts");
const expressAsyncHandler = require("express-async-handler");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../config/token");
const { validateMongodbId } = require("../utils/validateMongodbId");
const sgMail = require("@sendgrid/mail");
const keys = require("../config/keys");
const crypto = require("crypto");
const { cloudinaryUploadImg, cloudinaryDeleteImg } = require("../utils/cloudinary");
const fs = require("fs");

//sendgrid configuration
sgMail.setApiKey(keys.sendgridApiKey);

exports.register = expressAsyncHandler(async (req, res) => {
  //1- Get inputs value
  const { firstName, lastName, email, password } = req?.body;
  if (!firstName || !lastName || !email || !password)
    throw new Error("Some fields are empty");

  //2- Check email format
  const emailRegex = /^[a-z0-9.-]+@+[a-z-]+[.]+[a-z]{2,6}$/;
  if (!emailRegex.test(email)) throw new Error("Email address not valid");

  //3- Check password format
  const passwordRegex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-+=.<>_~]).{8,32}$/;
  if (!passwordRegex.test(password)) throw new Error("Password not valid");

  //4- Check if user already exists
  const userExists = await Users.findOne({ email: req?.body?.email });
  if (userExists) throw new Error("Email address already registered");
  try {
    const user = new Users({
      _id: new mongoose.Types.ObjectId(),
      firstName,
      lastName,
      email,
      password,
    });
    await user.save();
    res.json("Your account has been successfully created");
  } catch (error) {
    res.status(400).json(error);
  }
});

exports.login = expressAsyncHandler(async (req, res) => {
  //1- Get inputs value
  const { email, password } = req?.body;
  if (!email || !password) throw new Error("Some fields are empty");

  //2- check if user exists
  const user = await Users.findOne({ email: email });
  if (!user) throw new Error(`${req.body.email} doesn\'t exist`);
  //Check if password match
  if (!(await user.isPasswordMatched(req.body.password)))
    throw new Error("password incorrect");
  res.json({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePhoto: user.profilePhoto,
    profilePhotoId: user.profilePhotoId,
    isAdmin: user.isAdmin,
    accessToken: generateAccessToken(user._id),
    refreshToken: generateRefreshToken(user._id),
    createdAt: user.createdAt,
    isAccountVerified: user.isAccountVerified,
  });
});

exports.fetchAll = expressAsyncHandler(async (req, res) => {
  try {
    const users = await Users.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    res.json(error);
  }
});

exports.searchUser = expressAsyncHandler(async (req, res) => {
  const term = req?.body?.term;
  if (!term) throw new Error("term is missing");
  try {
    const response = await Users.find(
      {
        $or: [
          { firstName: { $regex: term, $options: "i" } },
          { lastName: { $regex: term, $options: "i" } },
        ],
      },
      { id: 1, firstName: 1, lastName: 1, profilePhoto: 1 }
    ).sort({ firstName: 1 });
    console.log(response);
    res.json(response);
  } catch (error) {
    res.status(400).json(error);
  }
});

exports.deleteUser = expressAsyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongodbId(id);
  try {
    const deleteUser = await Users.deleteOne({ _id: id });
    res.json("User has been removed");
  } catch (error) {
    res.json(error);
  }
});

exports.fetchOne = expressAsyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongodbId(id);
  try {
    const user = await Users.findById(id, { password: 0 });
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

//USER PROFILE

exports.userProfile = expressAsyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongodbId(id);
  try {
    const myProfile = await Users.findOne(
      { _id: id },
      { password: 0, token: 0 }
    );
    res.json(myProfile);
  } catch (error) {
    res.json(error);
  }
});

exports.updateUserProfile = expressAsyncHandler(async (req, res) => {
  const id = req.user.id;
  try {
    const user = await Users.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          bio: req.body.bio,
        },
      },
      {
        fields: { password: 0 },
        new: true,
      }
    ); //it enable to get the updated document
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

exports.updateUserPassword = expressAsyncHandler(async (req, res) => {
  const id = req.user.id;
  const password = req.body.password;
  validateMongodbId(id); //check if the user exist

  try {
    const user = await Users.findById(id);
    if (password) {
      user.password = password;
      const updatedUser = await user.save();
      let userNoPassword = updatedUser.toObject();
      delete userNoPassword.password;
      res.json(userNoPassword);
    } else {
      throw new Error("new password missing");
    }
  } catch (error) {
    res.json(error);
  }
});
//followingUser
exports.fetchAllFollowings = expressAsyncHandler(async (req, res) => {
  const loginUserId = req.user.id;
  try {
    const followings = await Users.findOne(
      { _id: loginUserId },
      { following: 1 }
    ).populate({
      path: "following",
      select: "_id firstName lastName profilePhoto",
      options: { sort: { firstName: 1 } },
    });
    res.json(followings);
  } catch (error) {
    res.json(error);
  }
});

exports.followUser = expressAsyncHandler(async (req, res) => {
  const loginUserId = req.user.id;
  const followUserId = req.body?.id;

  //check if these id exist
  validateMongodbId(loginUserId);
  validateMongodbId(followUserId);
  //avoid a user to follow itself
  if (loginUserId === followUserId)
    throw new Error("You cannot follow yourself");

  try {
    //1. Find the user you want to follow and update its followers
    const userFollowed = await Users.findOne({ _id: followUserId });
    if (userFollowed.followers.includes(loginUserId))
      throw `You are already following ${userFollowed.firstName} ${userFollowed.lastName}`;
    //if not includes we push into followers array, then save
    userFollowed.followers.push(loginUserId);
    await userFollowed.save();

    //prepare the response to the front
    const response = await Users.findOne(
      { _id: followUserId },
      { followers: 1 }
    ).populate({
      path: "followers",
      select: "_id firstName lastName profilePhoto",
      options: { sort: { firstName: 1 } },
    });

    //2. Update the login user following field
    const loginUser = await Users.findOne(
      { _id: loginUserId },
      { following: 1 }
    );
    if (loginUser.following.includes(followUserId))
      throw `You are already following ${userFollowed.firstName} ${userFollowed.lastName}`;
    //if not includes we push into following array, then save
    loginUser.following.push(followUserId);
    await loginUser.save();
    //3. send the response
    res.json(response);
  } catch (error) {
    res.json(error);
  }
});

exports.unfollowUser = expressAsyncHandler(async (req, res) => {
  const loginUserId = req.user.id;
  const unfollowUserId = req.body?.id;
  validateMongodbId(loginUserId);
  validateMongodbId(unfollowUserId);
  try {
    //1. Find the unfollow user to remove the login user from followers
    const unfollowUser = await Users.findOne({ _id: unfollowUserId });
    unfollowUser.followers = unfollowUser.followers.filter(
      (item) => item.toString() !== loginUserId && item
    );
    await unfollowUser.save();

    //2. Find the login user to remove the user that it follows
    const loginUser = await Users.findOne({ _id: loginUserId });
    loginUser.following = loginUser.following.filter(
      (item) => item.toString() !== unfollowUserId && item
    );
    await loginUser.save();

    res.json("successful unfollowed");
  } catch (error) {
    res.json(error);
  }
});

exports.blockUser = expressAsyncHandler(async (req, res) => {
  if (!req.user.isAdmin) throw new Error("Action denied");
  const userBlockedId = req.body?.id;
  validateMongodbId(userBlockedId);

  try {
    const userBlock = await Users.findOneAndUpdate(
      { _id: userBlockedId },
      { $set: { isBlocked: true } },
      { new: true }
    );
    res.json(`${userBlock.firstName} ${userBlock.lastName} has been blocked`);
  } catch (error) {
    res.json(error);
  }
});
exports.unblockUser = expressAsyncHandler(async (req, res) => {
  if (!req.user.isAdmin) throw new Error("Action denied");
  const userUnblockedId = req.body?.id;
  validateMongodbId(userUnblockedId);

  try {
    const userUnblocked = await Users.findOneAndUpdate(
      { _id: userUnblockedId },
      { $set: { isBlocked: false } },
      { new: true }
    );
    console.log(userUnblocked);
    res.json(
      `${userUnblocked.firstName} ${userUnblocked.lastName} has been unblocked`
    );
  } catch (error) {
    res.json(error);
  }
});
//Account Verification - Send email
exports.generateVerificationToken = expressAsyncHandler(async (req, res) => {
  if (req.user.isAccountVerified)
    throw new Error(`${req.user.email} is already verified`);
  try {
    const user = await Users.findOne({ _id: req.user.id });
    //create token then save it
    const token = await user.CreateVerifyAccountToken();
    await user.save();

    const msg = {
      to: user.email,
      from: "tagliasco.lou@orange.fr",
      subject: "Please confirm your account",
      html: `<div class="content">
                <table style="width:100%; border-spacing:0;border-collapse: separate;">
                    <tbody>
                        <tr>
                            <td style="font-size:16px; vertical-align: top;">
                                <h2 style="font-size:24px; font-weight:bold; margin-bottom:30px;">Let's verify your email to confirm your penBlog account</h2>
                                <p style="margin-bottom: 30px;">
                                    <a style="color: #294661; font-weight:300;" href="http://localhost:5000/api/users/verify-email-token/${token}" target="_blank">${user.email}</a>
                                </p>
                                <p style="margin-bottom: 30px;">Your link is active for 10 minutes. After that, you will need to resend the verification email.</p>
                            </td>
                        </tr>
                        <tr>
                        <td style="font-size:16px; vertical-align: top; text-align:center;">
                                <a style="color: #fff; background-color: #294661; font-weight:300; cursor: pointer; padding: 12px 45px;" href="http://localhost:5000/api/users/verify-account/${token}" target="_blank">Verify</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>`,
    };
    await sgMail.send(msg);
    res.json("Email sent");
  } catch (error) {
    res.json(error);
  }
});
exports.verifyAccount = expressAsyncHandler(async (req, res) => {
  const token = req?.params?.token;
  //1- I Hash the token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  try {
    //2- Find the user using this token
    const user = await Users.findOne({ accountVerificationToken: hashedToken });

    //3- Check if token isn't expired
    //to compare two date we have to convert it in mms by using date.getTime();
    if (Date.now() > user.accountVerificationTokenExpires.getTime())
      throw "Token expired";

    //4- Verify account
    user.isAccountVerified = true;
    user.accountVerificationToken = undefined;
    user.accountVerificationTokenExpires = undefined;
    await user.save();
    res.json("account verified");
  } catch (error) {
    res.json(error);
  }
});

//Generate forget password token
exports.forgetPasswordToken = expressAsyncHandler(async (req, res) => {
  const email = req?.body?.email;
  if (!email) throw new Error("email adress missing");

  //1- Find user by email
  const user = await Users.findOne({ email: email }, { password: 0 });
  if (!user) throw new Error("User not found");

  try {
    const resetToken = await user.createPasswordResetToken();
    await user.save();
    const msg = {
      to: user.email,
      from: "tagliasco.lou@orange.fr",
      subject: "Reset your password",
      html: `<div class="content">
                <table style="width:100%; border-spacing:0;border-collapse: separate;">
                    <tbody>
                        <tr>
                            <td style="font-size:16px; vertical-align: top;">
                                <h2 style="font-size:24px; font-weight:bold; margin-bottom:30px;">Let's reset your penBlog account password</h2>
                                <p style="margin-bottom: 30px;">
                                    <a style="color: #294661; font-weight:300;" href="http://localhost:5000/api/users/reset-password/${resetToken}" target="_blank">${user.email}</a>
                                </p>
                                <p style="margin-bottom: 30px;">Your link is active for 10 minutes. After that, you will need to resend the reset password email.</p>
                            </td>
                        </tr>
                        <tr>
                        <td style="font-size:16px; vertical-align: top; text-align:center;">
                                <a style="color: #fff; background-color: #294661; font-weight:300; cursor: pointer; padding: 12px 45px;" href="http://localhost:5000/api/users/reset-password/${resetToken}" target="_blank">Reset</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>`,
    };
    await sgMail.send(msg);
    res.json(`Reset password email sent to ${user.email}`);
  } catch (error) {
    res.json(error);
  }
});

exports.resetPassword = expressAsyncHandler(async (req, res) => {
  //1- catch the token & password
  const token = req?.body?.token;
  if (!token) throw new Error("Invalid Token");

  const password = req?.body?.password;
  if (!token) throw new Error("incorrect password field");

  //2- Hash the token
  const tokenHashed = crypto.createHash("sha256").update(token).digest("hex");

  //3- Find user with hashed token
  try {
    const user = await Users.findOne(
      { passwordResetToken: tokenHashed },
      { password: 0 }
    );
    if (!user) throw "Invalid token";
    if (Date.now() > user.passwordResetExpires.getTime())
      throw "Password reset token is expired";

    //4- reset and save the password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

//upload profile photo
exports.uploadProfilePicture = expressAsyncHandler(async (req, res) => {
  //*** 1- data ***
  //Buffer, because file isn't saved on server
  const buffer = req.file.buffer;
  //public_id
  const imageName = req.file.filename.split('.')[0];

  //*** 2- upload to cloudinary ***
  const imgUploaded = await cloudinaryUploadImg(buffer, imageName);
  
  const profilePhoto = imgUploaded.secure_url;
  const profilePhotoId = imgUploaded.public_id;

  //*** 3- Find the user ***
  const id = req.user.id;
  try {
    const user = await Users.findOneAndUpdate(
      { _id: id },
      { $set: { profilePhoto: profilePhoto, profilePhotoId: profilePhotoId }},
      { new: true, fields: { profilePhoto: 1,  profilePhotoId:1} }
    );
    // *** 4- delete the old picture if it's not the default one ***
    const oldProfilePicture = req.user.profilePhotoId;
    if (oldProfilePicture) {
      await cloudinaryDeleteImg(oldProfilePicture);
    }
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});
exports.moreUserData = expressAsyncHandler(async (req, res) => {
  const id = req?.params?.id;
  if (!id) throw new Error("Invalid url");
  validateMongodbId(id);
  try {
    const response = await Users.findOne(
      { _id: id },
      { followers: 1, following: 1, postCount: 1 }
    )
      .populate({
        path: "following",
        select: "_id firstName lastName profilePhoto",
        options: { sort: { firstName: 1 } },
      })
      .populate({
        path: "followers",
        select: "_id firstName lastName profilePhoto",
        options: { sort: { firstName: 1 } },
      });
    res.json(response);
  } catch (error) {
    res.json(error);
  }
});
exports.fetchUserData = expressAsyncHandler(async (req, res) => {
  const id = req?.params?.id;
  if (!id) throw new Error("Invalid url");
  validateMongodbId(id);
  try {
    const response = await Users.findOne(
      { _id: id },
      {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        createdAt: 1,
        profilePhoto: 1,
        followers: 1,
        following: 1,
        postCount: 1,
        isAccountVerified: 1,
      }
    )
      .populate({
        path: "following",
        select: "_id firstName lastName profilePhoto",
        options: { sort: { firstName: 1 } },
      })
      .populate({
        path: "followers",
        select: "_id firstName lastName profilePhoto",
        options: { sort: { firstName: 1 } },
      });
    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});
