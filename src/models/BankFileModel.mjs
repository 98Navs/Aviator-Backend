//src/models/BankFileModel.mjs
import { Schema, model } from 'mongoose';

const bankAccountSchema = new Schema({
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
    imageBarcode: {
        type: String,
        required: true
    },
    status:{
        type:String,
        default:'inActive'
    }
})
const BankAccount = model('BankAccount', bankAccountSchema);

export default BankAccount;