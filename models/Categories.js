const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const categorySchema = new Schema(
    {
        _id: Schema.Types.ObjectId,
        title: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('categories', categorySchema);