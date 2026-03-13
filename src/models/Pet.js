const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    species: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
    },
    mood: {
        type: String,
        default: 'Happy',
    },
    lastInteraction: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Pet', petSchema);
