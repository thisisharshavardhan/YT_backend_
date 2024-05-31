import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});

const uploadOnCloudinary = async(filepath)=>{
    try {
        if(!filepath) return null
        const responce = await cloudinary.uploader.upload(filepath,
        { resource_type:'auto' });
        fs.unlinkSync(filepath)
        return responce
    } catch (error) {
        console.log('Error OCCURed In the CLOUDINARY UPLOAD FILE',error)
        fs.unlink(filepath)
        return null
    }
}

export {uploadOnCloudinary}
