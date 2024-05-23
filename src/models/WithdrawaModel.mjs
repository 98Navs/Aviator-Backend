//src/models/Withdraw.js
import mongoose, { Schema, model } from 'mongoose';

const WithdrawalSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userAccountId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserBankAccount' 
    },
    amount: Number,
    transactionId: String,
    bankName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    accountHolderName: {
        type: String,
        required: true
    },
    ifscCode: {
        type: String,
        required: true
    },
    mobile: {
        type: String
    },
    upiId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Approved', 'Pending','Rejected'],
        default: 'Pending'
    },
    paymentType: {
        type: String,
        default: 'dabit'
    },
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
        }
    },
    timestamps: true
}
);


const Withdrawal = model('Withdrawal', WithdrawalSchema);

export default Withdrawal;