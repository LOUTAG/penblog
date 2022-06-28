const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    firstName: {
      type: String,
      required: [true, "Firstname is required"],
    },
    lastName: {
      type: String,
      required: [true, "Lastname is required"],
    },
    profilePhoto: {
      type: String,
      default: "/images/avatar.webp",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    bio: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    postCount: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Guest", "Blogger"],
    },
    isFollowing: {
      type: Boolean,
      default: false,
    },
    isUnFollowing: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    accountVerificationToken: {
      type: String,
    },
    accountVerificationTokenExpires: {
      type: Date,
    },
    //Il s'agit d'un tableau qui va ajouter les utilisateurs par leur ID depuis cette même collection users
    viewedBy: {
      type: [
        {
          type: Schema.Types.ObjectId, //on stock sous forme d'un id
          ref: "users", //on identifie la collection concernée
        },
      ],
    },
    followers: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "users",
        },
      ],
    },
    following: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "users",
        },
      ],
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
    //mongoose timestamps option manage automaticcaly 'createAt' and 'UpdatedAt' properties on the document
  }
);
//Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  console.log("hash working");
  //hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
  //enteredPassword is the one written by the user
  //this.password is the one hashed and save in our db
};

userSchema.methods.CreateVerifyAccountToken = async function () {
  //1. create a raw token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  //randomBytes() parameter is the size of the generate random data;
  //toString("hex") convert to hexadecimal system :
  //numbers from 0 to 9,
  //Letters from A to F
  //We are doing this because the result of crypto is binary value, harder to store compare to hex value.

  //2. create an hash token
  this.accountVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  //create a hash object using sha255 algorithm
  //then update the hash content with the data
  //at last digest give the encoding system

  //3. setup the token's lifespan
  this.accountVerificationTokenExpires = Date.now() + 1000 * 60 * 10; //expires in 10 minutes

  //4. return the raw token
  return verificationToken;
};

//password reset/forget
userSchema.methods.createPasswordResetToken = async function(){
  //1- Create raw token
  const forgetPasswordToken = crypto.randomBytes(32).toString("hex");

  //2- Create an hash toke,
  const forgetPasswordTokenHashed = crypto
    .createHash("sha256")
    .update(forgetPasswordToken)
    .digest("hex");
  
  this.passwordResetToken = forgetPasswordTokenHashed;

  //3. setup the token's lifespan = 10 minutes
  this.passwordResetExpires = Date.now()+1000*600*10;

  return forgetPasswordToken;
};

module.exports = mongoose.model("users", userSchema);
