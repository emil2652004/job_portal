const mongoose = require('mongoose');
const loginSchema = new mongoose.Schema({
    email: {
        type: String
    },
    password: {
        type: String
    },
    name: {
        type: String
    },
    phone: {
        type: Number
    },
    role: {
        type: String,
        enum: ['admin', 'employer','user']
    },
    status: {
        type: Boolean,
        default: true
    },
}); 
const login = mongoose.model('login', loginSchema);
module.exports = {login};