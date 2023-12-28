const express = require("express");
const userRoute = express();

const bodyParser = require("body-parser");
const session= require("express-session");
const path = require("path");
const multer = require("multer");
const cookieParser = require('cookie-parser');


//controller
const userController = require("../controllers/userController");

//middleware
const auth= require("../middlewares/auth");

//set session
userRoute.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
}));
userRoute.use(bodyParser.urlencoded({ extended: false }));
userRoute.use(bodyParser.json());
userRoute.use(express.static(path.join(__dirname, '../public')));
userRoute.use(cookieParser())

userRoute.set('view engine', 'ejs');
userRoute.set('views', './views');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images'))
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + '-' + file.originalname
        cb(null, fileName)
    },
});

const upload = multer({ storage });

userRoute.get("/register",auth.isLogout, userController.registerLoad);

userRoute.post("/register", upload.single("image"), userController.register);

userRoute.get("/", auth.isLogout, userController.loginLoad);

userRoute.post("/", userController.login);

userRoute.get("/dashboard", auth.isLogin, userController.loadDashboard);
userRoute.get("/logout", userController.logout);
userRoute.post("/save-chat", userController.saveChat);
userRoute.post("/delete-chat", userController.deleteChat);
userRoute.post("/edit-chat", userController.updateChat);

userRoute.get("*", (req, res) => {
    res.status(404).send("404");
});


module.exports = userRoute;