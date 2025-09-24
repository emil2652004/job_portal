const mongoose = require('mongoose');
const tokenSchema = new mongoose.Schema({
    loginid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'login',
    },
    token:{
        type: String,
    },

})

const token = mongoose.model('token', tokenSchema);
module.exports = {token}