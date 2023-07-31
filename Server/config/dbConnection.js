import mongoose from 'mongoose';

mongoose.set('strictQuery',false);

const MONGODB_URL= process.env.MONGODB_URL||'mongodb://127.0.0.1:27017/LMS';
const connectionToDB= async(req, res)=>{
    try {
    const connection =      
   await mongoose.connect(MONGODB_URL);
    console.log("Connected to the database")
    } catch (e) {
        console.log(e);
       process.exit(1);
    }
}
export default connectionToDB;