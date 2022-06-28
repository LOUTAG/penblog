const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const emailSchema = new Schema(
    {
        _id: Schema.Types.ObjectId,
        fromEmail: {
            type: String,
            required: true
        },
        toEmail: {
            type: String,
            required: true
        },
        subject:{
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        sentBy: {
            type: mongoose.Types.ObjectId,
            ref: 'users',
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports= mongoose.model('emails', emailSchema);