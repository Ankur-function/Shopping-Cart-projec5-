const mongoose = require("mongoose")
const productSchema = new mongoose.Schema({

        title: {
            type:String,
            required: true, 
            unique: true,
            trim: true
        },
        description: {
            type:String,
            required:true,
            trim: true
        },
        price: {
            type:Number,
            required: true,
            trim: true
            // valid number/decimal
        },
        currencyId: {
            type: String,
            required: true,
            trim: true
            },
        currencyFormat: {
            type:String,
            required: true,
            trim: true
            // Rupee symbol
        },
        isFreeShipping: {
            type:Boolean,
             default: false,
             trim: true
            },
        productImage: {
            type: String,
            required: true,
            trim: true
        },  // s3 link
        style: {
            type: String,
            trim: true
        },
        availableSizes: {
            type: [String],
        enum : ["S", "XS","M","X", "L","XXL", "XL"],
        trim: true
    },
        installments: {
            type:Number,
            trim: true
        },
        deletedAt: {
            type:Date,
            trim: true
        }, 
        isDeleted: {
            type:Boolean,
             default: false,
             trim: true
            },
        
    
        },{timestamps:true})

        module.exports=mongoose.model("product",productSchema)
    
