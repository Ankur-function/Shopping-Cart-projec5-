const jwt = require('jsonwebtoken')

const userAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization', 'Bearer Token')
        if (!token) {
          return res.status(403).send({ status: false, message: ` token request missing here` })
        }
        let splitToken = token.split(' ')

        const decodedtoken = jwt.decode(splitToken[1], 'Products-Management')

        if (!decodedtoken) {
           return res.status(403).send({ status: false, message: `invalid authenticated token in request body` })
          
        }
        if (Date.now()>(decodedtoken.exp)*1000) {

            return res.status(404).send({ status: false, message: `please login again because session is expired` })

        }

        req.userId = decodedtoken.userId;

        next()
    } catch (err) {
        console.error(`error ${err.message}`)
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports ={ userAuth}