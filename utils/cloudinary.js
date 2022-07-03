const cloudinary = require("cloudinary");
const keys = require("../config/keys");
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: keys.CLOUDINARY_NAME,
  api_key: keys.CLOUDINARY_API_KEY,
  api_secret: keys.CLOUDINARY_API_SECRET_KEY,
  secure: true,
});

exports.cloudinaryUploadImg = async (fileToUpload, imageName) => {
  try {
    return new Promise((resolve, reject) => {
      const cloudinaryUpload_stream = cloudinary.v2.uploader.upload_stream(
        {
          ressource_type: "raw",
          public_id: imageName,
        },
        function (error, result) {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
      streamifier.createReadStream(fileToUpload).pipe(cloudinaryUpload_stream);
    });
  } catch (error) {
    return error;
  }
};
exports.cloudinaryDeleteImg = async (fileToDelete) => {
  try {
    cloudinary.uploader.destroy(fileToDelete, function (result) {
      console.log(result);
    });
  } catch (error) {
    return error;
  }
};
