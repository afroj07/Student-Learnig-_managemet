
import app from './app.js';
import cloudinary from 'cloudinary';

const PORT = process.env.PORT||5004;

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

app.listen(PORT, ()=>{
    console.log(`app is running at http://loclahost:${PORT}`);
})