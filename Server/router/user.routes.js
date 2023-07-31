import { Router } from "express";
import { changedPassword, forgotPassword, getProfile, login, logout, register, resetPassword, updateUser } from "../controller/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
const router = Router();
 router.post('/register', upload.single("avatar"),register);
 router.post('/login',login);
 router.get('/logout',logout);
 router.get('/me',isLoggedIn, getProfile);
 router.post('/reset',forgotPassword);
 router.post('/reset/:resetToken', resetPassword);
 router.post('/changed-password', isLoggedIn, changedPassword)
 router.put('/update', isLoggedIn, upload.single("avatar"), updateUser)
 export default router;
