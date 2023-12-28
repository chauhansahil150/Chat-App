require('dotenv').config();
const mongoose = require('mongoose');
const app = require('express')();
const User = require('./models/user');
const Chat = require('./models/chat');

const http = require('http').Server(app);
const io = require('socket.io')(http);


//routes
const userRoute= require('./routes/userRoute');


mongoose.connect('mongodb://127.0.0.1:27017/dynamic-chat-app')
    .then(() => console.log("mongodb connected"));

// app.use((req, res, next) => {
//     const timeoutDuration = 5000;

//     const timeout = setTimeout(() => {
//         clearTimeout(timeout);
//         const error = new Error("Request timeout");
//         // console.log(typeof(error))
//         error.status = 408;
//         next(error);
//     }, timeoutDuration);
//     next();
// });

app.use('/',  userRoute);
// app.use((err, req, res, next) => {
//     if (err.status == 408) {
//         res.status(408).send("time is out");
//     } else {
//         res.status(500).send("server error");

//     }
// });
const unsp = io.of('/user-namespace');
unsp.on('connection', async function (socket) {
    console.log('user connected');

    /* The line `const userId = socket.handshake.auth.userId;` is retrieving the `userId` from the
    `handshake` object of the socket. */
    const userId = socket.handshake.auth.userId;
    console.log(userId);
    //update the status
    await User.findOneAndUpdate({ _id: userId }, { isOnline: true });
    

    /* The line `socket.broadcast.emit('getOnlineStatus', userId);` is emitting an event called
    'getOnlineStatus' to all connected clients except the current socket. This means that all other
    clients will receive this event and can perform any necessary actions based on the event. The event
    is being emitted with the userId as the data payload, so clients can use this information to update
    the status of the user with the given userId to online. */
    socket.broadcast.emit('getOnlineStatus', { userId });



    socket.on('disconnect', async function () {
        console.log('user disconnected');
        //get userId
        /* The line `const userId = socket.handshake.auth.userId;` is retrieving the `userId` from the
        `handshake` object of the socket. */
        const userId = socket.handshake.auth.userId;
        //update the status
        await User.findByIdAndUpdate({ _id: userId }, { isOnline: false });

        /* `socket.broadcast.emit('getOfflineStatus', userId);` is emitting an event called 'getOfflineStatus'
        to all connected clients except the current socket. This means that all other clients will receive
        this event and can perform any necessary actions based on the event. The event is being emitted with
        the userId as the data payload, so clients can use this information to update the status of the user
        with the given userId to offline. */
        socket.broadcast.emit('getOfflineStatus', { userId });
    
    });
    // chatting implementation
    socket.on('newChat', async function (data) {
        socket.broadcast.emit('loadNewChat', data);
    })

//load old chats
    socket.on('exitsChat', async function (data) {
        const chats = await Chat.find({
            $or: [
                { sender_id: data.sender_id, receiver_id: data.receiver_id },
                { sender_id: data.receiver_id, receiver_id: data.sender_id },
            ]
        })
        socket.emit("loadChats", { chats: chats });
    });

    //delete chat
    socket.on("chatDeleted", async function (id) {
        socket.broadcast.emit("chatMessageDeleted", id);
    });

    //update chat
    socket.on("chatUpdated", async function (data) {
        socket.broadcast.emit("chatMessageUpdated", data);
    });
    
});

http.listen(3000, function () {
    console.log('listening on port 8000');
})
// http.listen(process.env.PORT, function () {
//     console.log('listening on port 8000');
// })

