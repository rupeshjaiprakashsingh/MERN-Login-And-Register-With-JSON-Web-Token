const mongoose = require('mongoose');

const CheckInSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    checkInLocation: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    currentAddress: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('CheckIn', CheckInSchema);