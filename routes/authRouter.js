const express=require("express");
const authRouter=express.Router();


const authController=require("../controllers/authController");

authRouter.get("/login", authController.getLogin);
authRouter.post("/login", authController.postLogin);
authRouter.get("/signup", authController.getSignup);
authRouter.post("/signup", authController.postSignup);
authRouter.post("/logout", authController.postLogout);

//reset
authRouter.get("/forgot-password", authController.getForgotPassword);
authRouter.post("/forgot-password", authController.postForgotPassword);

authRouter.get("/reset/:token", authController.getResetPassword);
authRouter.post("/reset-password", authController.postResetPassword);
module.exports = authRouter;