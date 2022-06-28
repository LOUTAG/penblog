const cloudinary = require('cloudinary');
const keys = require('../config/keys');

cloudinary.config({
    cloud_name: keys.CLOUDINARY_NAME,
    api_key: keys.CLOUDINARY_API_KEY,
    api_secret: keys.CLOUDINARY_API_SECRET_KEY,
    secure:true
});

exports.cloudinaryUploadImg = async(fileToUpload, imageName)=>{
    try{
        const data = await cloudinary.uploader.upload(fileToUpload, {
            ressource_type: 'image',
            public_id: imageName
        });
        return {
            url: data?.secure_url,
            publicId: data.public_id
        };
    }catch(error){
        return error;
    }
}
exports.cloudinaryDeleteImg = async(fileToDelete)=>{
    try{
        cloudinary.uploader.destroy(fileToDelete, function(result){
            console.log(result);
        });
    }catch(error){
        return error;
    }
}