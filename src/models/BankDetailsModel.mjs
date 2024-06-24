// src/models/BankDetailsModel.mjs
import { Schema, model } from 'mongoose';

const BankDetailsSchema = new Schema({
    userId: { type: Number, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: Number, required: true },
    ifscCode: { type: String, required: true },
    upiId: { type: String, required: true },
    mobile: { type: Number, required: true },
    barCode: { type: String, default: 'NaN' },
    saveAs: { type: String, required: true },
    primary: { type: String, default: 'Yes' },
    status: { type: String, default: 'Active' } 
}, { timestamps: true});

const BankDetails = model('BankDetails', BankDetailsSchema);

export default BankDetails;
