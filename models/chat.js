const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    message: {
        type: String,
        required: true
    },

},
    {
        timestamps: true
    });
const Chat = mongoose.model('chat', chatSchema);

module.exports = Chat;