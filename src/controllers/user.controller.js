import { User } from '../models/user.model.js'
import { APIerror } from '../utils/APIerror.js'
import { APIresponse } from '../utils/APIresponse.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {uploadOnCloudinary} from '../utils/Cloudinary.js'
const registerUser =   asyncHandler( async (req,res)=>{
    
    const {username,password,email,fullname} = req.body
    if( [username,password,email,fullname].some((field)=> field?.trim() === "") ){
        throw new APIerror(400,'All fields are required')
    }

    const userExists = await User.findOne({
        $or: [{ username },{ email }]
    })
    if( userExists ){
        throw new APIerror(400,'User with email or username already exists')
    }

    
       const avatarpath = req.files?.avatar[0]?.path
       if(!avatarpath){
           throw new APIerror(400,'Image path not found')
       }  
       
       let coverImage
       if( Array.isArray(req.files.coverImage) ) {
           coverImage = req.files.coverImage[0].path
           if(!coverImage){
               throw new APIerror(400,'Image path not found')
            }  
        }
    const avatarresponse = await uploadOnCloudinary(avatarpath)
    const coverImageresponse = await uploadOnCloudinary(coverImage)

    const user = await User.create({
        fullName:fullname,
        avatar: avatarresponse.url || "",
        coverImage: coverImageresponse?.url || "" ,
        email,
        password,
        username:username
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new APIerror(500,"Something went writeing while creating the user")
    }

    return res.status(201).json(
        new APIresponse(200,createdUser,'User Created Successfully')
    )

})

const loginUser = asyncHandler(async (req,res)=>{
    // get username and password from the frontend
    // check if they are correct
    // generate refresh and access token
    const {email,username,password} = req.body
    if(!email && !username){
        throw new APIerror(400,"username or email is required")
    }

    const user = await User.findOne({
        $or: [{email},{username}]
    })

    if (!user) {
        throw new APIerror(400,`The user ${username||email} not found`)
    }
    
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordvalid) {
        throw new APIerror(401,`The password was incorrect`)
    }

    

} )
export {registerUser,loginUser}