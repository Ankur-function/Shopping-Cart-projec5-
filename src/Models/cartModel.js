const mongoose = require("mongoose")
const objectId = mongoose.Schema.Types.ObjectId
const cartSchema = new mongoose.Schema({

    "userId": {
        type: objectId, ref: "user", trim: true
    },

    items: [{
        productId: {
         type: objectId, ref: "product", required:true 
        },
        quantity: {
        type:Number, required:true,min:1}
      }],

      totalPrice: {type:Number, required:true},

      totalItems: {type:Number, required:true}
      
    }, { timestamps: true })

    module.exports = mongoose.model("cart", cartSchema)
