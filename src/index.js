import ConnectDB from "./db/index.js";
import app from './app.js'
import dotenv from 'dotenv'

dotenv.config({
    path:'./env'
})

ConnectDB().then(
    ()=>{
        console.log(`Database connected`);
        app.listen(process.env.PORT,()=>{
            console.log(`Lisening on port ${process.env.PORT}`)
        })
    }
).catch((err)=>{
    console.log(` ${err}`);
})