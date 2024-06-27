// src/models/RechargeModel.mjs
import { Schema, model } from 'mongoose';

const RechargeSchema = new Schema({
    userId: { type: Number, required: true },
    userName: { type: String, required: true },
    transactionNo: { type: String, required: true },
    amount: { type: Number, required: true },
    bonusAmount: { type: Number, default: 0},
    paymentProof: {type: String, default: 'NaN'},
    status: { type: String, default: 'Pending' }
}, { timestamps: true });

export default model('Recharge', RechargeSchema);
