//src/models/bankfile.js
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
    }
})

//module.exports = mongoose.model('BankAccount', bankAccountSchema);


const BankAccount = model('BankAccount', bankAccountSchema);

export default BankAccount;