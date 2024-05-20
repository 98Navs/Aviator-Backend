//src/models/RechargeModel.mjs
import mongoose, { Schema, model } from 'mongoose';

const TransactionSchema = new Schema({
    adminBankId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankAccount'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    paymentType: {
        type: String,
        default: 'creadit'
    },
    amount: Number,
    transactionId: String,
    bankName: {
        type: String,
    },
    accountNumber: {
        type: String,
    },
    accountHolderName: {
        type: String,
    },
    ifscCode: {
        type: String,
    },
    upiId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Approved', 'Rejected', 'Pending'],
        default: 'Pending'
    }
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
        }
    },
    timestamps: true
}
);

const Transaction = model('Transaction', TransactionSchema);

export default Transaction;