const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const expressAsyncHandler = require('express-async-handler');

//We have to configure : file destination, file type and file size

//1- File destination (storage)
const multerStorage = multer.memoryStorage();
//we don't want to save images on our server but on Cloudinary.
//So we have to store it temporarily in the memory of our server with memoryStorage().


//2- file type checking
const multerFilter= (req, file, cb)=>{
    //check file type
    if(file.mimetype.startsWith("image")){
        cb(null, true); //null = no error & true = success
    }else{
        cb(new Error('File not accepted'), false);
    }
}
//mimetype return "image/jpeg", "image/png", "image/gif"...

//3- configure multer and add file size
exports.pictureUpload = multer({
    storage: multerStorage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: multerFilter
});
//1MB = 1 000 000 bytes

//4- Profile image resizing
exports.profilePictureResize = expressAsyncHandler(async(req, res, next)=>{
    //1- check if there is no file
    if(!req.file) throw new Error('please add a picture to upload');


    //2- Give unique name : we don't want to upload the same image, it can cause conflicts !
    req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

    //3- resize image and save it inside public folder created at the root
    //we have to reaffect value of req.file.buffer to the one resized
    req.file.buffer = await sharp(req.file.buffer)
        .resize(80, 80, {
            fit: 'cover',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toFormat("jpeg")
        .jpeg({quality: 100})
        .toBuffer();
    next();
});

//4- Posts image resizing
exports.postPictureResize = async(req, res, next)=>{
    //1- check if there is no file
    if(!req.file) return next();

    //2- Give unique name : we don't want to upload the same image, it can cause conflicts !
    req.file.filename = `post-${Date.now()}-${req.file.originalname}`;
    //3- resize image and save it inside public folder created at the root
    req.file.buffer = await sharp(req.file.buffer)
        .resize(680, 650, {
            fit: 'inside',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .toFormat("jpeg")
        .jpeg({quality: 100})
        .toBuffer();
    next();
}