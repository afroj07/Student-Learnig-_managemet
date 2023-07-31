import { model , Schema } from "mongoose";

const courseSchema = new Schema({
    tittle:{
        type:String,
        required:[true, "Tittle is required"],
        minLength:[8, 'Tittle must me atleast 8 chracter'],
        maxLength:[59, 'Tittle should be less than 60 character'],
        trim: true,
    },
    description:{
        type:String,
        required:[true, "Description is required"],
        minLength:[20, "Description must me atleast 20 chracter"],
        maxLength:[200, "Description should be less than 200 character"],
    },
    category:{
        type: String,
        required:[true, "Category is required"],
    },
    thumbnail:{
public_id:{
    type:String,
    required:true,
},
secure_url:{
    type:String,
    required:true,
}
    },
    lectures:[{
        tittle:String,
        description:String,
        lecture:{
            public_id:{
                type:String,
                required:true,
            },
            secure_url:{
                type:String,
                required:true,
            }
        }
    }
],

numberOfLectures:{
    type: Number,
    default:0,
},
createdBy:{
    type:String,
    reqyuired:true,
  }
},
{
timestamps:true
}

);

const Course = model('Course',courseSchema);

export default Course;