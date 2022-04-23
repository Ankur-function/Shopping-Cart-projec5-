const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({

    fname:{
        type: String,
        required: true,
        trim: true
    },
    lname:{
        type: String,
        required: true,
        
    },
    
    email:{
        type: String,
        required: true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        unique:true,
        trim: true
    },
    profileImage:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true,
        unique: true,
        match:[/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/],
    },
    password:{
        type: String,
        required: true,
        trim:true,
        minLen :8, 
        maxLen: 15
    },
    address:{
        shipping:{
            street:{
                type: String,
                required: true
            },
            city:{
                type: String,
                required: true
            },
            pincode:{
                type: Number,
                required: true
            }
        },

        billing:{
            street:{
                type: String,
                required: true
            },
            city:{
                type: String,
                required: true
            },
            pincode2:{
                type: Number,
                required: true
            },
        } 
    }   
        
    },{timestamps:true})

    module.exports=mongoose.model("user",userSchema)






