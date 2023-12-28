const isLogin = async (req, res,next) => {
    try {
        if (req.session.user) { }
        else {
            res.status(200).redirect("/");
        }
        next();
    } catch (error) {
        console.error(error);
    }
}
const isLogout = async (req, res, next) => {
    try {
        if (req.session.user) {
            res.status(200).redirect("/dashboard");
         }
        next();
    } catch (error) {
        console.error(error);
    }
}
module.exports = {
    isLogout,
    isLogin,
}