import mongoose from 'mongoose'
import express from 'express'
import { DB_Name } from '../constants.js'

const ConnectDB =async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MDB_URL}/${DB_Name}`)
        console.log(`DB connected at host: ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log("mongo db connection Error",error);
        process.exit(1)
    }
}

export default ConnectDB