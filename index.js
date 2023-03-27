const express= require("express")
const {connection } = require("./config/db")
const {authentication } = require("./middleware/aithentication")
const {userrouter } = require("./route/user.route")
const {weatherRouter}= require("./route/weather")
const cookieParser= require("cookie-parser")
const { client } = require("./redis")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const expressWinston= require("express-winston")
const winston= require("winston")
require("winston-mongodb")

require("dotenv").config()
const app= express()
app.use(express.json())
app.use(cookieParser())


app.use(expressWinston.logger({
    transports: [
    //   new winston.transports.Console({
    //     level:"info",
    //     json:true
    //   }),
      new winston.transports.File({
        level:"info",
        json:true,
        filename:"weather.txt"
      }),
      new winston.transports.MongoDB({
        level:"silly",
        db:process.env.mongourl,
        json:true
      })
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
  }));

app.get("/",(req,res )=>{
    res.send("HOME PAGE")
})
app.use("/user",userrouter)
app.use(authentication)
app.use("/weather",weatherRouter)
app.listen(process.env.port,async()=>{
    try{
        await connection
        console.log("Connected to DB ")
    }catch(err){
        console.log(err.message)
    }
    console.log(`server is running at port ${process.env.port}`)

})