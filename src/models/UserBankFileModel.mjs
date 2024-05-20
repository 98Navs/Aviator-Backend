//src/models/UserBankFileModel.mjs
import { Schema, model } from 'mongoose';


const userBankAccountSchema = new Schema({
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
    upiId: {
        type: String,
        required: true
    }

})
const UserBankAccount = model('UserBankAccount', userBankAccountSchema);

export default UserBankAccount;