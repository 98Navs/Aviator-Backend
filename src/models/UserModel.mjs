// src/models/UserModel.mjs
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    image: { type: String, default: 'NaN' },
    userId: { type: Number, default: () => Math.floor(100000 + Math.random() * 900000), unique: true },
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: String, required: true},
    role: { type: String, default: 'user' },
    commissionPercentage: { type: Number, default: 0 },
    
    playedAmount: { type: Number, default: 0 },
    playedGame: { type: [String] },
    numberOfGames: { type: Number, default: 0 },
    accessiableGames: { type: [String], default: ["Aviator", "Snakes"] },
    lifetimeProfit: { type: Number, default: 0 },
    lifetimeLoss: { type: Number, default: 0 },

    depositAmount: { type: Number, default: 0 },
    winningsAmount: { type: Number, default: 0 },
    bonusAmount: { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },
    referralAmount: { type: Number, default: 0 },
    lifetimeNumberOfBiddings: { type: Number, default: 0 },
    lifetimeDepositAmount: { type: Number, default: 0 },
    lifetimeBonusAmount: { type: Number, default: 0},
    lifetimeWithdrawalAmount: { type: Number, default: 0 },
    lifetimeReferralAmount: { type: Number, default: 0 },
    lifetimeNumberOfDeposit: { type: Number, default: 0 },
    lifetimeNumberOfWithdrawal: { type: Number, default: 0 },
    
    numberOfReferrals: { type: Number, default: 0 },
    referralLink: { type: String, default: '' },
    promoCode: { type: String, default: () => Math.random().toString(36).slice(2, 10).toUpperCase() },
    referenceCode: { type: String, default: 'ADMIN0001' },
    status: { type: String, default: 'Active' },
    otp: { type: Number, default: null }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.password;
            delete ret.otp;
            ret.createdAt = ret.createdAt.toISOString();
            ret.updatedAt = ret.updatedAt.toISOString();
        }
    }
});

userSchema.pre('save', function (next) {
    if (this.isNew) {
        this.referralLink = `https://aviator-backend-5cfe.vercel.app/users?referenceCode=${this.promoCode}`;
    }
    this.numberOfGames = this.accessiableGames.length;
    next();
});

userSchema.virtual('wallet').get(function () { return this.depositAmount + this.winningsAmount + this.bonusAmount + this.commissionAmount + this.referralAmount; });

userSchema.virtual('referralAmountUsed').get(function () { return this.lifetimeReferralAmount - this.referralAmount; });

userSchema.virtual('weightage').get(function () { return ((this.lifetimeProfit - this.lifetimeLoss) / this.playedAmount) * 100; });

export default model('User', userSchema);