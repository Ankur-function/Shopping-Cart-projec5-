const userModel = require("../Models/userModel")
const validator = require("../validator/validation")
 const jwt = require("jsonwebtoken") 
const aws = require("../aws")
const bcrypt = require("bcrypt")
const saltRounds = 10;


const isValid = function (value) {
    if (typeof (value) == "undefined" || typeof (value) == "null") { return false }
    if (typeof (value) == "string" && value.trim().length == 0) { return false }
    if (typeof (value) == "string" && value.trim().length > 1) { return true }
    return true
}

const createuser = async function(req,res){
    try{
        let files = req.files
        const data = req.body
        if(Object.keys(data)==0){return res.status(400).send('data  is missing')}

        let{ fname,lname,email,profileImage,phone,password,address} = data

         // name is requires

         const req0 = isValid(fname)
         if (!req0) {
             return res.status(400).send("firstname is required")
         }
         const req1 = isValid(lname)
         if (!req1) {
             return res.status(400).send("lastname is required")
         }
         
       // phone is required
          
         const req2 = isValid(phone)
         if (!req2) {
             return res.status(400).send("phone is required")
         }
        
        
         //phone is already used
         const phoneIsAlreadyUsed = await userModel.findOne({ phone: phone })
         if (phoneIsAlreadyUsed) {
             return res.status(400).send("phone already exist")
         }
       //  phone must be valid
         if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone))) {
             return res.status(400).send("phone is invalid")
         }
 
       // email is required
         const req3 = isValid(email)
         if (!req3) {
             return res.status(400).send("email is required")
         }
        
 
         //email is valid
         const emailIsAlreadyUsed = await userModel.findOne({ email: email })
         if (emailIsAlreadyUsed) {
             return res.status(400).send("email is already exist")
         }
 
         //email is invalid
         if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
             return res.status(400).send("email is invalid")

         }

         profileImage = await aws.uploadFile(files[0])
 
       //hashing the password by using bcrypt
       const salt = bcrypt.genSaltSync(saltRounds);
       let hashpassword= await bcrypt.hash(password, salt);
 
 
       // password is required
         const req4 = isValid(password)
         if (!req4) {
             return res.status(400).send("password is required")
         }
 
     //password should be between 8 to 15
         if (password.trim().length < 8 || password.trim().length > 15) {
             return res.status(400).send("password should be between 8 to 15")
         }
 
 
         const req5 = isValid(address)
           if (!req5) {
               return res.status(400).send({ status: false, message: "User address is required" })
         }

         if(!isValid(address.shipping.street))
        return res.status(400).send({ status : false, msg : "street is required" })
 
        
        if(!isValid(address.shipping.city))
        return res.status(400).send({ status : false, msg : "city is required" })

        
        if(!isValid(address.shipping.pincode))
        return res.status(400).send({ status : false, msg : "pincode is required" })
        

       // if(!(/^[1-9][0-9]{5}$/.test(pincode)))
       // { return  res.status(400).send("pincode is invalid")}

        if(!isValid(address.billing.street))
        return res.status(400).send({ status : false, msg : "street is required" })
 
        
        if(!isValid(address.billing.city))
        return res.status(400).send({ status : false, msg : "city is required" })

        
        if(!isValid(address.billing.pincode2))
        return res.status(400).send({ status : false, msg : "pincode2 is required" })
        

      //  if(!(/^[1-9][0-9]{5}$/.test(pincode2)))
      //  { return  res.status(400).send("pincode is invalid")}

      


       const udatedBody = { fname, lname, email, phone, password:hashpassword, address, profileImage }
        let user = await userModel.create(udatedBody)
        res.status(201).send({ status: true, message: 'User created successfully', data: user })

        }
        catch (err) {
            res.status(500).send({ error: err.message })
        }

}

const loginuser=async function(req,res){
    const data=req.body
    if(Object.keys(data)==0){return res.status(400).send('data  is missing')}
   
    const {email, password } = data


//email is required
    const req3 = isValid(email)
    if (!req3) {
        return res.status(400).send("email is required")
    }

    //password is required
    const req4 = isValid(password)
    if (!req4) {
        return res.status(400).send("password is required")
    }
    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
        return res.status(400).send("email is invalid")
    }

    // email is not registered
      const findEmail= await userModel.findOne({email:email})
      if(!findEmail){ return res.status(400).send("email is not registered")}

     // password is invalid
      const findPassword= await userModel.findOne({password:password})
      if(!findPassword){ return res.status(400).send("Password is invalid")}


if(findEmail && findPassword)
{
    // creating token
    const  token =  jwt.sign({
        userId:findEmail._id,
        iat:Math.floor(Date.now() /1000),
        exp:Math.floor(Date.now() /1000)+ 10*60*60
     },'shopping-cart')
     res.setHeader ("Bearer-token",token)
     return res.status(200).send({ status: true, message: 'User login successfully', data: {userId:findEmail._id,token:token} })
}
}


const userDetails = async function (req, res) {
    try {
        let data = req.params.userId;

        const userData = await userModel.findById(data);
        if (!userData) {
            return res.status(404).send({ status: false, msg: `userid is not present in DB!` })
        }

       // let userId=req.params._id

        const newData = await userModel.findById( data );
        res.status(200).send({ status: true, msg: `User Profile details`, data: newData })
   

    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}

const updateuser = async function (req, res) {
    try {

        const requestBody = req.body

        const userId = req.params.userId

        const { fname, lname, email, phone, password, address } = requestBody

        let finalFilter = {}

        if (validator.isValid(fname)) {
            finalFilter["fname"] = fname
        }
        if (validator.isValid(lname)) {
            finalFilter["lname"] = lname
        }

        if (validator.isValid(email)) {
            if (!/^([a-z0-9\.-]+)@([a-z0-9-]+).([a-z]+)$/.test(email.trim())) {
                return res.status(400).send({ status: false, message: "EMAIL is not valid" })
            }
            const isEmailAlreadyUsed = await userModel.findOne({ email })
            if (isEmailAlreadyUsed) {
                return res.status(400).send({ status: false, message: "email already used " })
            }
            finalFilter["email"] = email

        }

        if (validator.isValid(phone)) {
            if (!(!isNaN(phone)) && /^(?:(?:\+|0{0,2})91(\s*[\ -]\s*)?|[0]?)?[789]\d{9}|(\d[ -]?){10}\d$/.test(phone.trim())) {
                return res.status(400).send({ status: false, message: " PHONE NUMBER is not a valid mobile number" });
            }
            const isphoneNumberAlreadyUsed = await userModel.findOne({ phone })
            if (isphoneNumberAlreadyUsed) {
                return res.status(400).send({ status: false, message: "phone Number already used " })
            }
            finalFilter["phone"] = phone
        }
        if (validator.isValid(password)) {
            finalFilter["password"] = password
        }
        if (validator.isValid(address)) {
            if (address.shipping.pincode) {
                if (typeof address.shipping.pincode !== 'number') {
                    return res.status(400).send({ status: false, mesaage: "shipping pincode must be number" })
                }
            }
            if (address.billing.pincode) {
                if (typeof address.billing.pincode !== 'number') {
                    return res.status(400).send({ status: false, mesaage: "billing pincode must be number" })
                }
            }
            finalFilter["address"] = address
        }

        let files = req.files
        if (files) {
            if (files && files.length > 0) {

                const profileImage = await aws.uploadFile(files[0])

                if (profileImage) {
                    finalFilter["profileImage"] = profileImage
                }
            }
        }

                
            
        
        const postData = await userModel.findOneAndUpdate({ _id: userId }, { $set: finalFilter }, { new: true })

        return res.status(200).send({ status: true, message: "User profile updated", data: postData })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}








module.exports.loginuser = loginuser
module.exports.createuser = createuser
module.exports.userDetails = userDetails
module.exports.updateuser = updateuser