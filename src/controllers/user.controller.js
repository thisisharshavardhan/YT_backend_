import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new APIerror(
      400,
      "Something went Wrong while generting refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {

  const { username, password, email, fullname } = req.body;
  if (
    [username, password, email, fullname].some((field) => field?.trim() === "")
  ) {
    throw new APIerror(400, "All fields are required");
  }

  const userExists = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (userExists) {
    throw new APIerror(400, "User with email or username already exists");
  }

  const avatarpath = req.files?.avatar[0]?.path;
  if (!avatarpath) {
    throw new APIerror(400, "Image path not found");
  }

  let coverImage;
  if (Array.isArray(req.files.coverImage)) {
    coverImage = req.files.coverImage[0].path;
    if (!coverImage) {
      throw new APIerror(400, "Image path not found");
    }
  }
  const avatarresponse = await uploadOnCloudinary(avatarpath);
  const coverImageresponse = await uploadOnCloudinary(coverImage);

  const user = await User.create({
    fullName: fullname,
    avatar: avatarresponse.url || "",
    coverImage: coverImageresponse?.url || "",
    email,
    password,
    username: username,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new APIerror(500, "Something went writeing while creating the user");
  }

  return res
    .status(201)
    .json(new APIresponse(200, createdUser, "User Created Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get username and password from the frontend
  // check if they are correct
  // generate refresh and access token
  const { email, username, password } =await req.body;
  if (!(email || username)) {
    throw new APIerror(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new APIerror(400, `The user ${username || email} not found`);
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new APIerror(401, `The password was incorrect`);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const logedInUser = await User
    .findById(user._id)
    .select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new APIresponse(
        200,
        {
          user: logedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id,{
    $set:{
      refreshToken: undefined
    }
  },{
    new: true
  })
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
    new APIresponse(200,"","User logged Out")
  )
});

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken = req.cokkies?.refreshToken || req.body?.refreshToken
  if(!incomingRefreshToken){
    throw new APIerror(400,"Unauthorised Request")
  }
  
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id)
    if(!user){
      throw new APIerror(400,"Invalid refresh token")
    }
    if(incomingRefreshToken !== user?.refreshToken){
      throw new APIerror(400,"Refresh token invalid")
    }
    const options = {
      httpOnly:true,
      secure:true
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
  
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
      new APIresponse(200,"Access token generated using refresh token","Access token generated using refresh token")
    )
 
   
});
export { registerUser, loginUser, logoutUser,refreshAccessToken };
