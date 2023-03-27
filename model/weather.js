const mongoose= require("mongoose")

const weatherSchema= mongoose.Schema({
    id:Number,
    title:String,
    body:String,
    temp:Number
    
})
const WeatherModel= mongoose.model("weather",weatherSchema)
module.exports={
    WeatherModel
}