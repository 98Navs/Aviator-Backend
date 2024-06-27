// src/models/WithdrawalModel.mjs
import { Schema, model } from 'mongoose';

const BankDetailsSchema = {
    bankName: { type: String, required: true, trim: true, uppercase: true },
    accountNumber: { type: Number, required: true },
    ifscCode: { type: String, required: true, trim: true, uppercase: true },
    upiId: { type: String, required: true, trim: true },
    mobile: { type: Number, required: true }
};

const WithdrawalSchema = new Schema({
    userId: { type: Number, required: true },
    userName: { type: String, required: true },
    transactionNo: { type: String, default: 'Admin Input Required' },
    amount: { type: Number, required: true },
    bankDetails: BankDetailsSchema,
    status: { type: String, default: 'Pending' }
}, { timestamps: true });

export default model('Withdrawal', WithdrawalSchema);
