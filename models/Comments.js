const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
    {
        _id: Schema.Types.ObjectId,
        post:{
            type: Schema.Types.ObjectId,
            ref:"posts",
            required: [true, "Post is required"]
        },
        user:{
            type: Schema.Types.ObjectId,
            ref:"users",
            required: [true, "user is required"]
        },
        content:{
            type: String,
            required: [true, "Content is required"]
        }
    },
    {timestamps: true}
);
module.exports = mongoose.model('comments', commentSchema);