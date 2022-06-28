const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Users = require("../models/Users");
const keys = require("../config/keys");

exports.authMiddleware = expressAsyncHandler(async (req, res, next) => {
  const authHeader = req?.headers?.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  //split divides a string into arrays by defining the pattern. Here it's space.
  if (token) {
    try {
      const decoded = jwt.verify(token, keys.ACCESS_TOKEN);
      //what is decoded ? The id ! decoded.id

      //check if user still exist
      const isUserExists = await Users.exists({ _id: decoded.id });
      if (!isUserExists) {
        let e = new Error("Invalid user");
        e.name = "InvalidUser";
        throw e;
      }

      const user = await Users.findOne({ _id: decoded.id }, { password: 0 });

      //now we have attach the user to the request object
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json(error);
    }
  } else {
    throw new Error("Undefined token");
  }
});
