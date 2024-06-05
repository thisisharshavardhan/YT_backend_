import mongoose from "mongoose";

const subscribtionSchema = new mongoose.Schema({
    channel:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subscriber:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subscribtionSchema)