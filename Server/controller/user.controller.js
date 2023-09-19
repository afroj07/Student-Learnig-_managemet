import AppError from "../utils/error.util.js";
import User  from "../model/user.model.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import sendEmail from "../utils/sendEmail.js";


const cookieoption={
  maxAge:7*24*60*60*1000, //7days
  httpOnly:true,
  secure:true
}
const register =async(req, res, next)=>{

     const {fullName, email, password, avatar}=req.body;
     if(!fullName || !email ||!password){
      return next (new AppError("All field are required", 400));
     }
     const userExist = await User.findOne({email});
     if(userExist){

     return next (new AppError("Email already exist", 400));
    }
 
    const user = await User.create({
      fullName,
      email,
      password,
      avatar:{
        public_id:email,
        secure_url:"https://sialifehospital.com/wp-content/uploads/2021/04/testimonial-1.png",
      }
    });
    if(!user){
      return next(new AppError('User registration failed, please try again',400));

    }

    // File upload
    console.log('File detaile',JSON.stringify(req.file));
    if(req.file){
      
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path,{
             folder:'lms',
             width:250,
             hight:250,
             gravity:'faces',
             crop:'fill'
        })

        if(result){
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url= result.secure_url;

          // remove file from server
          fs.rm(`uploads/${req.file.filename}`)
        }
      } catch (e) {
        return next(new AppError(error || 'File not uploaded, please try again', 500));
      }
    }

    await user.save();

    user.password=undefined;

const token = await user.generateJWTToken();

res.cookie('token', token, cookieoption);

    res.status(201).json({
      success:true,
      message:"user registered successfully",
      user,
    })
  };
 const login = async(req, res, next)=>{

  try {
    const {email, password}= req.body;
if(!email || !password){
  return next(new AppError('All fields are required', 400));
}
const user = await User.findOne({
  email

}).select('+password');

if(!user || !user.comparePassword(password)){
  return next(new AppError('Email or password doesnot match',400));
}

const token = await user.generateJWTToken();

user.password=undefined;
res.cookie('token', token, cookieoption);

res.status(200).json({
  success:true,
  message:'User loggedin Successfully',
  user,
 });
  } catch (e) {
     return next(new AppError(e.message, 500));
   
     }
}


  const logout = (req, res, next)=>{
     res.cookie('token',null,{
success:true,
message:'User logged out successfully '
     })
  };
  const getProfile = async(req, res)=>{
    try {
      const userId =req.user.id;
      const user = await User.findById(userId);
      res.status(200).json({
        success:true,
        message:"User details",
      })
    } catch (e) {
       return next(new AppError('Failed to fetch profile details',500))
    }
   
  };

  const forgotPassword =async(req, res, next)=>{
    const{email} = req.body;
    if(!email){
      return next(new AppError('Failed to fetch profile details',500))
    }
      const user = await User.findOne({email});
      if(!user){
        return next(new AppError('Email is not register',400))
      }word

      const resetToken = await user.generatePassResetToken();
  await user.save();
  const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
 const subject='Reset Password'
  const message= ` you can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\n If the above link does not work for some reson the copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`
  try{
    await sendEmail(email, subject, message);
      res.status(200).json({
        success:true,
        message:`Reset password token has been sent to ${email} successfully`
      })
    } 
  
   catch(e){

    user.forgetPasswordExpiryy=undefined;
    user.forgetPasswordToken= undefined;
    await user.save();
      return next(new AppError(e.message, 500));
    }
}
  const resetPassword = async(req, res)=>{
const {resetToken} = req.params;
const{ password} =req.body;
const forgetPasswordToken = crypto
.create('sha256')
.update(resetToken)
.digest('hex');

const user  = await User.findOne({
  forgetPasswordToken,
  forgetPasswordExpiry:{$gt: Date.now()}
});
if(!user){
  return next(new AppError('Token is invalid or expired, please try again', 400)
  )
}
user.password = password;
user.forgetPasswordToken=undefined;
user.forgetPasswordExpiry=undefined;

user.save();

res.status(200).json({
  success:true,
 message:'password changed successfully'
})

  }

  const changedPassword = async(req, res, next)=>{
     const {oldPassword, newPassword}= req.body;
     const {id} = req.user;
     if(!oldPassword || !newPassword){
      return next(
        new AppError('All fields are mandatry', 400)
      )
     }
     const user = await User.findById(id).select(+password);
     if(!user){
      return next(new AppError('User does not exist', 400))
     }

     const isPasswordValid = await user.comparePassword(oldPassword);
     if(!isPasswordValid){
      return next( new AppError('Invalid old password',400))
     }
   
     user.password = newPassword;

     await user.save();
     user.password = undefined;

     res.status(200).json({
      success:true,
      message:'Password chamged successfully'
     });


    }
    

     const updateUser =async(req, res, next)=>{
         const {fullName} = req.body;
         const {id} = req.user.id;

         const user = await User.findById(id);
          
         if(!user){
          return next( new AppError('User does not exist',400))
         }

         if(req.fullName){
          user.fullName= fullName;
         }

         if(req.file){
          await cloudinary.v2.uploader.destroy(user.avatar.public_id);
          try {
            const result = await cloudinary.v2.uploader.upload(req.file.path,{
                 folder:'lms',
                 width:250,
                 hight:250,
                 gravity:'faces',
                 crop:'fill'
            });
    
            if(result){
              user.avatar.public_id = result.public_id;
              user.avatar.secure_url= result.secure_url;
    
              // remove file from server
              fs.rm(`uploads/${req.file.filename}`)
            }
          } catch (e) {
            return next(new AppError(error || 'File not uploaded, please try again', 500)
           );
        }
   }
      
   await user.save();
   res.status(200).json({
    success:true,
    message:'User details id updated successfully'
   });
      
}
     
  export{
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changedPassword,
    updateUser
   }