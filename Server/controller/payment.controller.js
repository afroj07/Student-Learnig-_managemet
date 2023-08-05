import User from "../model/user.model.js";
import AppError from "../utils/error.util.js";
import crypto from 'crypto'
import Payment from "../model/payment.model.js";
import razorpay from "razorpay";
export const getRazorpayApiKey =async(req, res,next)=>{
    try {
        res.status(200).json({
            success:true,
            message:'Razarpay API Key',
            key:process.env.RAZORPAY_KEY_ID
        });
        
    } catch (e) {
        return next(new AppError(e.message,500))
    }

}

export const buySubscription =async(req, res,next)=>{
try {
    const {id}=req.user;
const user = await User.findById(id);
if(!user){
    return next(
        new AppError('Unauthoruzed, please login',500)
    )
}
if(user.role=='ADMIN'){
    return next(
        new AppError('Admin cannot purchase a subscription', 400)
    )
}
  
const subscription = await razorpay.subacriptions.create({
    plain_id: process.env.RAZORPAY_PLAIN_ID,
    customer_notify:1
});
user.subscription.id = subscription.id;
user.subscription.status=subscription.status;

await user.save();

res.status(200).json({
   success:true,
   message:'Subscription Successfully',
   subscription_id: subscription.id

})
} catch (e) {
    return next(new AppError(e.message, 500))
}

}

export const verifySubscription =async(req, res,next)=>{
const{id} =req.user;
const{razorpay_payment_id, razorpay_signature, razorpay_subscription_id}= req.body;

 const user = await User.findById(id);

if(!user){
    return next(
        new AppError('Unauthoruzed, please login',500)
    )
}
const subscriptionId = user.subscription.id;

try {
    
    const generatedSignature = crypto  
       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_payment_id} | ${subscriptionId}`)
        .digest('hex');

        if(generatedSignature !== razorpay_signature){
            return next(
                AppError('Payment not verified, please try again', 500)
            )
        }
        await Payment.create({
            razorpay_payment_id, 
            razorpay_signature, 
            razorpay_subscription_id
        });
         
        user.subscription.status='active';
        await user.save();

        res.status(200).json({
            success:true,
            message:'payment verified successfully'
        });

} catch (e) {
    return next(new AppError(e.message, 500))
}

    }   

export const cancelSubscription =async(req, res,next)=>{
try{
      const {id} = req.user;

    const user = await User.findById(id);

    if(!user){
        return next(
            new AppError('Unauthoruzed, please login',500)
        )
    }
    if(user.role=='ADMIN'){
        return next(
            new AppError('Admin cannot purchase a subscription', 400)
        )
    }
    const subacriptionId = user.subscription.id;

    const subscription = await razorpay.subacriptions.cancel(
        subacriptionId
    )
user.subscription.status=subscription.status;

await user.save();

}   
catch(e){
    return next(new AppError(e.message , 500))
}
}
export const allPayments =async(req, res,next)=>{

   try {
    const {count} = req.query;

    const  subscriptions = await razorpay.subscriptions.all({
        count: count || 10,
    });
   res.status(200).json({
     success:true,
     message:'All payments',
     subscriptions
   })
   } catch (e) {
    
    return next(new AppError(e.message),500);
   }
    
};