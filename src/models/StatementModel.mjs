// src/models/StatementModel.mjs
import { Schema, model } from "mongoose";

const StatementSchema = new Schema({
    transactionId : { type: Number, required: true },
    userId: { type: Number, required: true },
    userName: { type: String, required: true },
    message: { type: String, required: true },
    amount: { type: Number, required: true },
    closingBalance: { type : Number, required: true },
    category: { type: String, required: true },
    type: { type: String },
    status: { type: String, required: true}
    
}, { timestamps: true });

export default model('Statement', StatementSchema)