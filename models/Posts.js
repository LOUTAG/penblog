const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema(
    {
        _id: Schema.Types.ObjectId,
        title: {
            type: String,
            required: [true, 'title is required'],
            trim: true
        },
        category:{
            type: Schema.Types.ObjectId,
            ref: "categories",
            required: [true, 'Post category is required']
        },
        numberOfViews:{
            type: Number,
            default: 0
        },
        likes:{
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'users'
                }
            ]
        },
        dislikes:{
            type:[
                {
                    type: Schema.Types.ObjectId,
                    ref: 'users'
                }
            ]
        },
        author: {
            type: Schema.Types.ObjectId,
            ref:'users',
            required: [true, "Please Author is required"]
        },
        description: {
            type: String,
            required: [true, 'Post description is required'],
            maxLength: 280
        },
        image:{
            type: String,
        },
        imageId:{
            type: String,
            default: null
        }
    },
    {
        toJson:{
            virtuals: true
        },
        toObject: {
            virtuals: true
        },
        timestamps: true
    }
)
module.exports = mongoose.model("posts", postSchema);