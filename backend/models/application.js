const mongoose = require('mongoose');
const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'login',
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Interview', 'Offered', 'Rejected'],
        default: 'Applied'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});
const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;