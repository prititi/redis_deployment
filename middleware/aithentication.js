const jwt = require("jsonwebtoken")
const { Blacklist } = require("../model/blacklist")
const { client } = require("../redis")
require("dotenv").config()

const authentication = async (req, res, next) => {
    // const token= req.headers.authorization?.split(" ")[1];
    const token = req.cookies.token
    const refreshToken= req.cookies.reftoken
    const isBlacklisted = await client.get(`${token}`)
    if (isBlacklisted) {
        return res.status(401).send('Token is blacklisted');
    }
    if (token) {
        jwt.verify(token, "SECRET", async (err, decode) => {
            if (decode) {
                req.body.userID = decode.userID;
                next()
             }
             
            else {
                const fetchdata = await fetch(`http://localhost:${process.env.port}/user/refresh-token`, {
                    headers: {
                        Authorization:`Bearer ${refreshToken}`,
                        cookie:`reftoken=${refreshToken}`
                    }
                }).then((res) => res.json())
                // console.log(fetchdata.token)
                if(fetchdata.err){
                    return res.send("login first")
                }
                jwt.verify(fetchdata.token, "SECRET", async (err, decode) => {
                    if (decode) {
                        res.cookie("token",fetchdata.token)
                        req.body.userID = decode.userID;
                        next()
                    }
               })
               
            }
        })
    } else {
       return res.send({ "msg": "Please login"})
    }
}

module.exports = {
    authentication
}