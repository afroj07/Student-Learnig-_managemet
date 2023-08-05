import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
const userSchema= new Schema({
   fullName:{
    type:'String',
    required:[true, ' Name is required'],
    minLength:[5, 'Name must be at least 5 character'],
    MaxLength:[50, 'Name should br less than 50 charater'],
    lowercase:true,
    trim:true,

   },
   email:{
    type:'String',
    required:[true, ' email is required'],
    lowercase:true,
    trim:true,
    unique:true,
    match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill in a valid email address']

   },
   password:{
    type:'String',
    required:[true, 'Password is required'],
    minLength:[8,'Password must be at least 8 character'],
    select:false
   },
   avatar:{
    public_id:{
        type:String
    },
    secure_url:{
        type:'String'
    }
   },
   role:{
    type:"String",
    enum:['USER','ADMIN'],
    default:'USER'


   },
   resetPasswordToken:String,
   forgetPasswordExpiry:Date,
   subscription:{
    id:String,
    status:String,
   }
},  
{
    timestamps:true

});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password= await bcrypt.hash(this.password, 10);
})
userSchema.methods={
       async generateJWTToken(){
          return  await jwt.sign({
            id: this._id, 
             email:this.email,
             subacription:this.subacription,
             role:this.role,
            },
             process.env.JWT_SECRET,
             {
               expiresIN:'24h'
              }       
        )
    },
    comparePassword: async function(plainTextPassword){
         return await bcrypt.compare(plainTextPassword, this.password);
    },

    async generatePasswordResetToken (){
        const resetToken = crypto.randomBytes(20).toString('hex');
        this.forgetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
        this.forgetPasswordExpiry = Date.now() +15*60*1000;
        return resetToken;
    }
}
const User = model('User', userSchema);

export default User;