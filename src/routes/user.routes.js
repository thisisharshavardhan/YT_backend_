import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAvatar, updateUserDetails } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

userRouter.route("/login").post(loginUser);

// Secured Routes
userRouter.route("/logout").post(verifyjwt,logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/change-password").post(verifyjwt,changeCurrentPassword)
userRouter.route("/get-user-data").get(verifyjwt,getCurrentUser)
userRouter.route("/update-account-details").post(verifyjwt,updateUserDetails)
userRouter.route("/update-avatar").post(verifyjwt,upload.fields([
  {
    name: "avatar",
    maxCount:1
  }
]),updateAvatar)
export default userRouter;
