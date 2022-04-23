const productModel = require("../Models/productModel")
const validator = require("../validator/validation")
const aws = require("../aws")



const isValid = function (value) {
    if (typeof (value) == "undefined" || typeof (value) == "null") { return false }
    if (typeof (value) == "string" && value.trim().length == 0) { return false }
    if (typeof (value) == "string" && value.trim().length > 1) { return true }
    return true
}

const createproduct = async function (req, res) {
    try {
        let files = req.files
        const data = req.body
        if (Object.keys(data) == 0) { return res.status(400).send('data  is missing') }

        let { title, description, price, currencyId, currencyFormat, productImage ,availableSizes} = data



        const req0 = isValid(title)
        if (!req0) {
            return res.status(400).send("title is required")

        }

        const titleIsAlreadyUsed = await productModel.findOne({ title: title })
        if (titleIsAlreadyUsed) {
            return res.status(400).send("title already exist")
        }

        const req1 = isValid(description)
        if (!req1) {
            return res.status(400).send("description is required")
        }



        const req2 = isValid(price)
        if (!req2) {
            return res.status(400).send("price is required")
        }


        const req3 = isValid(currencyId)
        if (!req3) {
            return res.status(400).send("currencyId is required")
        }

        const req4 = isValid(currencyFormat)
        if (!req4) {
            return res.status(400).send("currencyFormat is required")
        }
       
        const req5 = isValid(availableSizes)
        if (!req5) {
            return res.status(400).send("availablesizes is required")

        }





        productImage = await aws.uploadFile(files[0])



        const udatedBody = { title, description, price, currencyId, currencyFormat, productImage, availableSizes}
        let user = await productModel.create(udatedBody)
        res.status(201).send({ status: true, message: 'User created successfully', data: user })


    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }

}


const getproducts = async function (req, res) {
    try {
        

        const requestQuery = req.query

        const { size, name, priceGreaterThan, priceLessThan, priceSort } = requestQuery

        const finalFilter = [{isDeleted:false}]

        if (validator.isValid(name)) {
            finalFilter.push({ title: { $regex: name, $options: 'i' } })
        }
        if (validator.isValid(size)) {
            if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size))) {
                return res.status(400).send({ status: false, message: "please enter valid size  " })
            }
            finalFilter.push({ availableSizes: size })
        }

        if (validator.isValidNumber(priceGreaterThan)) {

            finalFilter.push({ price: { $gt: priceGreaterThan } })
        }
        if (validator.isValidNumber(priceLessThan)) {

            finalFilter.push({ price: { $lt: priceLessThan } })
        }


        // if there is a price to sort 
        if (validator.isValidNumber(priceSort)) {

            if (priceSort != 1 && priceSort != -1) {
                return res.status(400).send({ status: false, message: "pricesort must to 1 or -1" })
            }
            const fillteredProductsWithPriceSort = await productModel.find({ $and: finalFilter }).sort({ price: priceSort })

            if (Array.isArray(fillteredProductsWithPriceSort) && fillteredProductsWithPriceSort.length == 0) {
                return res.status(404).send({ status: false, message: "data not found" })
            }

            return res.status(200).send({ status: true, message: "products with sorted price", data: fillteredProductsWithPriceSort })
        }

        //   
        const fillteredProducts = await productModel.find({ $and: finalFilter })

        if (Array.isArray(fillteredProducts) && fillteredProducts.length === 0) {
            return res.status(404).send({ status: false, message: "data not found" })
        }

        return res.status(200).send({ status: true, message: "products without sorted price", data: fillteredProducts })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}
    


const getproductdetails = async function (req, res) {
    try {
        let data = req.params.productId;

        const productData = await productModel.findById(data);
        if (!productData) {
            return res.status(404).send({ status: false, msg: `product is not present in DB!` })
        }

        res.status(200).send({ status: true, msg: `product details`, data: productData })
   
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}



const updateproduct = async function (req, res) {
    try {

        const requestBody = req.body
        
        const productId = req.params.productId
        

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = requestBody

       const finalFilter = { }


        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "At least one input is required to update" })
        }

        if (!validator.isValidObjectId(productId)) {
            console.log(validator.isValidObjectId(productId))
            return res.status(400).send({ status: false, message: "please provide valid productId" })
        }
       
        if (title) {
            if (!validator.isValid(title)) {
                return res.status(400).send({ status: false, message: "please enter title" })
            }
            const isTitleAlreadyExists = await productModel.findOne({ title: title })

            if (isTitleAlreadyExists) {
                return res.status(400).send({ status: false, message: "title already used" })
            }
            finalFilter["title"] = title
        }

        if (description) {
            if (!validator.isValid(description)) {
                return res.status(400).send({ status: false, message: "please enter description" })
            }
            finalFilter["description"] = description
        }

        if (price) {
            if (!validator.isValidNumber(price)) {
                return res.status(400).send({ status: false, message: "please enter price and it must be number" })
            }
            finalFilter["price"] = price
        }

        if (installments) {
            
            if (!validator.isValidNumber(installments)) {
                return res.status(400).send({ status: false, message: " installment   must be number" })
            }
            finalFilter["installments"] = installments
        }
        if (isFreeShipping) {
            if (isFreeShipping !== 'true' && isFreeShipping != 'false') {
                return res.status(400).send({ status: false, message: "isFreeShipping  must be in boolean to update " })
            }
            finalFilter["isFreeShipping"] = isFreeShipping
        }
        if (currencyFormat) {
            if (currencyFormat != "₹") {
                return res.status(400).send({ status: false, message: "please provide valid  currencyFormat i.e ₹ " })
            }
            finalFilter["currencyFormat"] = currencyFormat
        }

        if (currencyId) {
            if (currencyId != "INR") {
                return res.status(400).send({ status: false, message: "please provide valid currencyId i.e INR " })
            }
            finalFilter["currencyId"] = currencyId
        }
        if (style) {
            if (typeof style !== 'string') {
                return res.status(400).send({ status: false, message: "style must be in string" })
            }
            finalFilter["style"] = style
        }
        if (availableSizes) {
            if (!validator.isValid(availableSizes)) {
                return res.status(400).send({ status: false, message: "please enter availableSizes " })
            }
            let availableSizesInArray = availableSizes.map(x => x.trim())
            for (let i = 0; i < availableSizesInArray.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizesInArray[i]))) {
                    return res.status(400).send({ status: false, message: "AvailableSizes contains ['S','XS','M','X','L','XXL','XL'] only" })
                } else {
                    finalFilter["availableSizes"] = availableSizesInArray
                }
            }
        }
        
        let files = req.files
        if (files && files.length > 0) {
            finalFilter["productImage"] = await aws.uploadFile(files[0])
        }
      
    const updatedProductDetails = await productModel.findOneAndUpdate({_id: productId },{$set:finalFilter},{new:true})
     if(!updatedProductDetails){return res.status(404).send({status:false,message:"data not found"})}

     return res.status(200).send({status:false,message:"product updated successfully ",data:updatedProductDetails})

    } catch (err) {
        return res.status(500).send({ status: false, message:err.message})
    }

}

const deleteproduct = async function (req, res) {
    const data = req.params.productId

    let findproduct = await productModel.findById(data)
    if (!findproduct) return res.status(404).send({ status: false, msg: "product does not exist" })

    if (findproduct.isDeleted == false) {

        let findupdate = await productModel.findOneAndUpdate({ _id: data }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        if (!findupdate) return res.status(404).send({ status: false, msg: "product not find" })
        res.status(200).send({ status: true, message: "success", data: findupdate })

    } else {
        return res.status(404).send({ status: false, msg: "product is already deleted" })
    }

}








module.exports.createproduct = createproduct
module.exports.getproducts = getproducts
module.exports.getproductdetails = getproductdetails
module.exports.updateproduct = updateproduct
module.exports.deleteproduct = deleteproduct