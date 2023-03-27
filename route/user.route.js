const express = require('express');
const userrouter = express.Router();
const {UserModel} = require('../model/user.model');
const bcrypt= require("bcrypt")
const jwt= require("jsonwebtoken")
const {Blacklist}= require("../model/blacklist");
const { client } = require('../redis');

require("dotenv").config()
userrouter.get("/",async(req,res)=>{
    const data=await UserModel.find()
    res.send(data)
})

userrouter.post("/register",(req,res)=>{
    const {name,email,pass}= req.body
    try{
        bcrypt.hash(pass, 8, async(err,hash)=>{
            if(err){
                res.send({"msg":"Something went wrong","error":err.message})
            }else{
                let user= new UserModel({name,email,pass:hash})
                await user.save()
                res.send({"msg":"New user has been register"})
            }
        })
    }catch(err){
        res.send({"msg":"Something went wrong","error":err.message})
    }
})

userrouter.post("/login",async(req,res)=>{
    const {email,pass}= req.body
    try{
        const user= await UserModel.find({email})
        if(!user){
            res.send("Please register first")
        }
        const hash_pass= user[0]?.pass;
        if(user.length>0){
            bcrypt.compare(pass,hash_pass,(err,result)=>{
                if(result){
                    // normal token............
                    let token= jwt.sign({userID:user[0]._id}, process.env.token,{expiresIn:"1h"});


                    // refresh token.......................
                    const reftoken = jwt.sign({userID:user[0]._id },process.env.refresh_token,{expiresIn:'7d'})
                    res.cookie("token",token)
                    res.cookie("reftoken",reftoken)

                    res.send({"msg":"Logged in","token":token,"reftoken":reftoken})
                }
            })
        }else{
            res.send("wrong pass")
        }
    }catch(err){
        res.send({"msg":"Something went wrong","error":err.message})
    }
})


userrouter.get('/logout', async (req, res) => {
    try {
      // Add token to blacklist collection
      const token = req.cookies.token
  
      client.set(token,"token",{
        EX:100
      })
      const blacklistedToken = new Blacklist({ token });
      await blacklistedToken.save();
  
      res.status(200).send('Logged out successfully');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  
// refresh toke.............

userrouter.get('/refresh-token', (req, res) => {
   
    const refreshToken = req.cookies.reftoken;

    if(!refreshToken) return res.send({msg:"Please login"});
    try{
        jwt.verify(refreshToken, "REFRESH_SECRET",(err,decode)=>{
            
            if(err){
                return res.send({"err":"Please login again","error":err.message})
            }else{
                const token = jwt.sign({ userID: decode.userID}, "SECRET", { expiresIn: '1h' });
                // res.cookie(req.cookies.token)
                // console.log(token);
                res.send({msg:"Login sess",token})
            }
        })
    }catch(err){
        res.status(401).send('Unauthorized');
    }
        
    
})  



  

module.exports = {
    userrouter
}