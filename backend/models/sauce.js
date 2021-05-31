const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    userId: String,
    name: {type: String, require: true, unique: true},
    manufacturer: {type: String, require: true},
    description: {type: String, require: true},
    mainPepper: {type: String, require: true},
    imageUrl: {type: String, require: true},
    heat: {type: Number, require: true},
    likes: {type: Number, default:0},
    dislikes: {type: Number, default:0},
    usersLiked: {type: [String]},
    usersDisliked: {type: [String]},
})

module.exports = mongoose.model('Sauce', sauceSchema);