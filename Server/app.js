import { config } from 'dotenv';
import  cookieParser from 'cookie-parser';
 import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import  userRoutes from './router/user.routes.js';
import courseRoutes from './router/course.route.js'
import connectionToDB from './config/dbConnection.js';
import errorMiddleware from './middleware/error.middleware.js';
connectionToDB();
const app= express();
config();

app.use(express.json());
app.use(express.urlencoded({ extended:true}));
app.use(morgan('dev'));
app.use(cors({
    origin:[process.env.FRONTED_URL],
    Credential:true
}))
app.use(cookieParser());
app.use('/ping',(req, res)=>{
    res.send('I am listen server')
})
// routes 3 define
app.use('/api/v1/user',userRoutes);
app.use('/api/v1/course',courseRoutes);



app.all('*',(req,res)=>{
    res.status(400).send('OOPS! 404 page not found')
})
app.use(errorMiddleware);
export default app;