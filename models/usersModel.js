const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    refreshToken: {
        type: String,
        default: null
    },
    aiDailyCount: { 
        type: Number, 
        default: 0 
    },
    aiDailyDate: { type: Date }
}, { timestamps: true });
module.exports = mongoose.model('users', userSchema);