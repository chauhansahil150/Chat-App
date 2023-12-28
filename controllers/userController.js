const User = require("../models/user");
const Chat = require("../models/chat");
const bcrypt = require("bcrypt");

const registerLoad =async (req, res) => {
    try {
        res.render('register');
    } catch (error) {
        console.log(error.message);
    }
}
const register = async (req, res)=>{
    try {
        const user = await User.findOne({ email: req.body.email });
        if(user){
            return res.render("register", {
                message: "User already exists",
            });
        }
        const hashPassword = await bcrypt.hash(req.body.password, 10);
        await User.create({
            name: req.body.name,
            email: req.body.email,
            image:"images/"+ req.file.filename,
            password: hashPassword,
        });
        res.render("register", {
            message: "Registered Successfully"
        });
    } catch (error) {
        console.log(error.message);
    }
}
const loginLoad = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.log(error.message);
    }
};
const login = async (req, res) => {
    try {
        const email = req.body.email;;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                req.session.user = userData;
                res.cookie("user", JSON.stringify(userData));
                res.status(200).redirect("/dashboard");
            } else {
                res.render("login", {
                    message: "Incorrect  password",
                })
            }

        } else {
            res.render("login", {
                message: "Incorrect username or password",
            })
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
const logout = async (req, res) => {
    req.session.destroy();
    res.clearCookie("user");
    res.status(200).redirect("/");
}
const loadDashboard = async (req, res) => {
    try {
        const users = await User.find({ _id: { $nin: [req.session.user?._id] } });
        res.render("dashboard", {
            user: req.session.user,
            users: users,
        });
    } catch (error) {
        console.log(error.message);
    }

};
const saveChat = async (req, res) => {
    try {
        const chat = new Chat({
            message: req.body.message,
            sender_id: req.body.sender_id,
            receiver_id: req.body.receiver_id,
        })
        const newChat=await chat.save();
        res.status(200).send({
            success: true,
            msg: "chat saved",
            data:newChat

        });
    } catch (error) {
        res.status(400).send({
            success: false,
            msg: error.message
        });
    }
}
const deleteChat = async (req, res) => { 
    try {
        const chat = await Chat.findByIdAndDelete({_id:req.body._id});
        res.status(200).send({
            success: true,
            msg: "chat deleted",
            data:chat

        });
    } catch (error) {
        res.status(400).send({
            success: false,
            msg: error.message
        });
    }

}
const updateChat = async (req, res) => {
        try {
            const chat = await Chat.findByIdAndUpdate({ _id: req.body._id }, {
                $set: {
                     message: req.body.message 
                }
            });
            res.status(200).send({
                success: true,
                msg: "chat deleted",
                data: chat

            });
        } catch (error) {
            res.status(400).send({
                success: false,
                msg: error.message
            });
        }

    }

   

module.exports = {
    registerLoad,
    register,
    loginLoad,
    login,
    logout,
    loadDashboard,
    saveChat,
    deleteChat,
    updateChat
}