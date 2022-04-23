const express=require('express');
const router=express.Router();

const userController=require('../Controllers/userController')
const productController=require('../Controllers/productController')
const cartController = require("../Controllers/cartController")
const orderController = require("../Controllers/orderController")

const middleware =require("../middleware/auth")






router.post('/register',userController.createuser);
router.post('/products',productController.createproduct);
router.post("/users/:userId/cart",middleware.userAuth,cartController.createCart)
router.post("/users/:userId/orders",middleware.userAuth,orderController.createOrder)
router.post('/login',userController.loginuser )



router.put("/user/:userId/profile",middleware.userAuth,userController.updateuser)
router.put("/products/:productId",productController.updateproduct)
router.put("/users/:userId/cart",middleware.userAuth,cartController.updateCart)
router.put("/users/:userId/orders",middleware.userAuth,orderController.updateOrder)


router.get('/user/:userId/profile',middleware.userAuth,userController.userDetails )
router.get("/products",productController.getproducts)
router.get("/products/:productId",productController.getproductdetails)
router.get("/users/:userId/cart",middleware.userAuth,cartController.getCartDetails)


router.delete("/products/:productId",productController.deleteproduct)
router.delete("/users/:userId/cart",middleware.userAuth,cartController.deleteCart)







module.exports=router;