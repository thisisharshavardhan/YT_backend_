import { User } from "../models/user.model.js";
import { APIerror } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyjwt = asyncHandler(async (req, res, next) => {
  // try {
    const Token =  req.cookies?.accessToken ||
       req.header("Authorization")?.replace("Bearer ", "");

    if (!Token) {
      throw new APIerror(401, "Unauthurised request");
    }

    const decodedToken =  jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new APIerror(400, "Invalid Access Token");
    }
    req.user = user;
    next();
  // } catch (error) {
  //   throw new APIerror(401,  "Invalid access token");
  // }
});
