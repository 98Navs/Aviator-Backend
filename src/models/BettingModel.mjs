// src/models/BettingModel.mjs
import { Schema, model } from 'mongoose';

const BettingSchema = new Schema({
    gameId: { type: Number, required: true },
    bettingId: { type: Number, required: true },
    userId: { type: Number, required: true },
    userName: { type: String, required: true },
    amount: { type: Number, required: true },
    winAmount: { type: Number, default: 0 },
    weightage: { type: Number, default: 0 },
    status: { type: String }
}, { timestamps: true });

BettingSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
    }
});

BettingSchema.pre('save', function (next) {
    if (this.amount !== 0) {
        this.weightage = ((this.winAmount - this.amount) / this.amount) * 100;
    } else {
        this.weightage = 0;
    }
    next();
});

const Betting = model('Betting', BettingSchema);

export default Betting;
