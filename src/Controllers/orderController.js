const orderModel = require('../Models/orderModel')
const productModel = require('../Models/productModel')
const userModel = require('../Models/userModel')
const validator = require('../validator/validation')


const createOrder = async function (req, res) {
     try {
        const userId = req.params.userId
        const requestBody = req.body

        const { items } = requestBody


        
        if (req.body.userId != userId) {
            return res.status(403).send({ status: false, message: "body userid and params user id not match" })
        }

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid format userId" })
        }

        const UserExists = await userModel.findById(userId)
        if (!UserExists) {
            return res.status(404).send({ status: false, message: "user data not found" })
        }

        if (!Array.isArray(items) || items.length == 0) {
            return res.status(400).send({ status: false, message: "items should present and it should be in array  ,not a empty array" })
        }

        let totalQuantity = 0
        let totalPrice = 0
        let totalItems=0

        for (i = 0; i < items.length; i++) {
            if (!validator.isValidObjectId(items[i].productId)) {
                return res.status(400).send({ status: false, message: `productId at  index ${i} is not valid objectId ` })
            }
            if (!validator.isValidNumber(items[i].quantity)) {
                return res.status(400).send({ status: false, message: `quantity at index ${i} is not a valid number` })
            }
            let findProduct = await productModel.findById(items[i].productId)
            totalQuantity = totalQuantity + items[i].quantity
            totalItems = totalItems + items[i].quantity
            totalPrice = totalPrice + findProduct.price*items[i].quantity

        }
        requestBody['totalQuantity'] = totalQuantity
        requestBody['totalItems'] = totalItems
        requestBody['totalPrice'] = totalPrice

        const ordercreation = await orderModel.create(requestBody)
        return res.status(201).send({ status: true, message: "successfully order created", data: ordercreation })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}




const updateOrder = async function (req, res) {
    try {

        const userId = req.params.userId
        const requestBody = req.body

        const { orderId,status } = requestBody

        if (!validator.isValid(status)) {
            return res.status(400).send({ status: false, message: "status is required for updation" })
        }
        
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is in valid" })
        }
        if (!validator.isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: "orderId is in valid" })
        }

        const UserExists = await userModel.findById(userId)
        if (!UserExists) {
            return res.status(404).send({ status: false, message: "userData not found" })
        }

        const OrderExists = await orderModel.findById(orderId)
        if (!OrderExists) {
            return res.status(404).send({ status: false, message: "orderData not found" })
        }

        if (OrderExists.userId != userId) {
            console.log(isOrderExists.userId !== userId)
            return res.status(400).send({ status: false, message: "order user id and params user id not match" })
        }

        const updatedData = await orderModel.findOneAndUpdate({ _id: orderId, cancellable: true }, { status: req.body.status }, { new: true })

        if (!updatedData) {
            return res.status(404).send({ status: false, message: "data not found for update" })
        }

        return res.status(200).send({ status: true, message: `order ${req.body.status} successfully`, data: updatedData })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}






module.exports = { createOrder, updateOrder }