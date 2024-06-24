// src/models/FestivalBonusModel.mjs
import { Schema, model } from 'mongoose';

const DepositBonusSchema = new Schema({
    offerId: { type: Number, default: () => Math.floor(100000 + Math.random() * 900000), unique: true },
    amount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    deal: { type: Number, required: true },
    status: { type: String, enum: { values: ['Active', 'Deactive'], message: 'OfferStatus must be one of: Active or Deactive' }, required: true }
}, { timestamps: true });

DepositBonusSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
    }
});

export default model('DepositBonus', DepositBonusSchema);