//src/models/UserModel.mjs
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    userId: { type: Number, default: () => Math.floor(100000 + Math.random() * 900000), unique: true },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: Number, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    image: { type: Buffer, default: Buffer.alloc(0) },
    depositAmount: { type: Number, default: 0 },
    winningsAmount: { type: Number, default: 0},
    bonusAmount: { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },
    lifetimeDepositAmount: { type: Number, default: 0 },
    lifetimeWithdrawalAmount: { type: Number, default: 0 },
    lifetimeNumberOfDeposit: { type: Number, default: 0 },
    lifetimeNumberOfWithdrawal: { type: Number, default: 0 },
    playedAmount: { type: Number, default: 0 },
    playedGame: { type: String, default: 'none' },
    promoCode: { type: String, default: () => Math.random().toString(36).slice(2, 10).toUpperCase() },
    referenceCode: { type: String, default: 'admin' },
    weightage: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    otp: { type: Number, default: null },
    bankDetails: [
        {
            type: Schema.Types.ObjectId,
            ref: 'UserBankAccount'
        }
    ],
}, {
    timestamps: true
});

// Define virtual wallet property
userSchema.virtual('wallet').get(function () {
    return this.depositAmount + this.winningsAmount + this.bonusAmount + this.commissionAmount;
});

// Define toJSON method to include virtuals
userSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        // Remove sensitive fields
        delete ret.password;
        delete ret.image;
        delete ret.otp;
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
    }
});

const User = model('User', userSchema);

export default User;
