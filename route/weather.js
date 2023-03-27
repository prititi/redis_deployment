const express= require("express")
const {clientredis}= require("../redis")
// const {UserModel}= require("../model/user.model")
const {authentication}= require("../middleware/aithentication")
const {Blacklist}= require("../model/blacklist")
const { WeatherModel } = require("../model/weather")
const {client}=require("../redis")

const weatherRouter= express.Router()
weatherRouter.get("/:id",async(req,res)=>{
    const id= req.params.id;
    try{
        let resdisdata= await client.get(`${id}`)
        resdisdata= JSON.parse(resdisdata)
        console.log(resdisdata);
        if(resdisdata){
            res.status(200).json({"msg":"successfully done", data: resdisdata})
            return;
        }
        let data= await WeatherModel.find({_id:id})
        client.set(`${id}`,JSON.stringify(data))
        res.status(200).json({"msg":"successfully done", data: data,mongo:"mongoDB"})
    }catch(err){
        res.status(501).json({"msg":"something went wrong","error":err.message})
    }

})


// weatherRouter.get("/post/:id",async(req,res)=>{
//     const {id}= req.params;
//     const cash_post= await client.hGet("posthm",`${id}`)
//     if(cash_post){
//         res.send(cash_post)
//     }else{
//         let post= await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then((res)=>res.json())
//         post= JSON.stringify(post)
//         await clientredis.hSet("posthm",`${id}`,`${post}`)
//         console.log(post)
//         res.send(post)
//     }
// })
weatherRouter.get("/",async(req,res)=>{
    const data= await WeatherModel.find()
    res.send(data)
})

weatherRouter.post("/create",async(req,res)=>{
    let post= req.body;
    try{
        const blog= new WeatherModel(post)
        await blog.save()
        res.send("New blog has been added")
    }catch(err){
        res.send({"msg":"something went wrong","error":err.message})
    }
})

// ..................................
module.exports={
    weatherRouter
}