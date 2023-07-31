 import Course from "../model/course.model.js";
 import AppError from "../utils/error.util.js";
 import cloudinary from 'cloudinary';
 import fs from 'fs/promises';

 const getAllCourse = async(req, res, next)=>{

    try {
        const courses = await Course.find({}).select('-lectures');

    res.status(200).json({
        success:true,
        message:'All course',
        courses,
    });
    } catch (e) {
        return next(
            new AppError(e.message,500)
        )
    };
  
};

const getLecturesByCourseId = async(req, res, next)=>{

     try {
        
        const {id} = req.params;
        const course = await Course.findById(id);
        if(!course){
            return next(
                new AppError('can not find course id',400)
            )
        }
        res.status(200).json({
            success:true,
            message:'Course lectures fetched sucessfully',
            lectures: course.lectures
        });

     } catch (e) {
        return next(
            new AppError(e.message,500)
        )
     }
};

const createCourse= async(req, res, next)=>{
 
    const {tittle, description, category, createdBy}= req.body;

    if(!tittle || !description || !category || !createdBy){
        return next(new AppError('All fields are mandotary', 400)
        )
    }

    const course = await Course.create({
        tittle,
        description,
        category,
        createdBy,
        thumbnail:{
            public_id:'Dummy', 
            secure_url:'Dummy'
        },
        
    });

    if(!course){
        return next(new AppError('Course could not created, please try again', 500)
        )
    }
  if(req.file){
    try {
        
        const result = await cloudinary.v2.uploader.upload(req.file.path,{
            folder:'lms'
         });
    
        if(result){
          course.thumbnail.public_id= result.public_id;
          course.thumbnail.secure_url= result.secure_url;
         }
    
          fs.rm(`uploads/${req.filename}`);

    } catch (e) {
        return next(new AppError(e.message, 500)
        )
    }
}

await course.save();

res.status(200).json({
    success:true,
    message:'Course created successfully',
    course,
});
}

const updateCourse = async(req, res, next)=>{
try {
    
const { id }  =req.params;
const course = await Course.findByIdAndUpdate(
    id,{
$set: req.body
    },
    {
       runValidators:true
    }
);

if(!course){
    return next(new AppError('Course with given id does not exist', 500)
    )   
}
res.status(200).json({
    success:true,
    message:'Course update successfully'
})
} catch (e) {
    return next(new AppError(e.message, 500)
    )   
}
}


const removeCourse = async( req, res, next)=>{
try {
    
    const { id }= req.params;
    const course = await Course.findById(id);
    if(!course){
        return next(new AppError('Course with given id does not exist', 500)
        )   
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({
        success:true,
        message:'Course deleted  successfully'
    })

} catch (e) {
    return next(new AppError(e.message, 500)
    )   
    
}

}


const addLectureToCourseById  = async(req, res, next)=>{

     try {
        const {tittle, description} = req.body;
     const{ id } = req.params;
     if(!tittle || !description){
        return next(new AppError('All fields are mandotary', 400)
        )
    }

     const course = await Course.findById(id);

     if(!course){
        return next(new AppError('Course with given id does not exist', 500)
    ) 
     }

     const lectureData = {
        tittle,
        description,
        lecture:{}
     }

     if(req.file){
        try {
        
            const result = await cloudinary.v2.uploader.upload(req.file.path,{
                folder:'lms'
             });
        
            if(result){
              lectureData.lecture.public_id= result.public_id;
             lectureData.lecture.secure_url= result.secure_url;
             }
        
              fs.rm(`uploads/${req.filename}`);
    
        } catch (e) {
            return next(new AppError(e.message, 500)
            )
        }
     }
 course.lectures.push(lectureData);
 course.numberOfLectures = course.lectures.length;
 await course.save();

 res.status(200).json({
    success:true,
    message:'Lecture added successfully to the course',
    course,
 })
     } catch (e) {
        return next(new AppError(e.message, 500)
    )   
     }
}

export{
    getAllCourse,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById
}