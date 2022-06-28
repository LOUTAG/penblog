const mongoose = require('mongoose');
//we are going to check if the user id is a valid id

exports.validateMongodbId = (id)=>{
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid) throw new Error('Invalid User');
}