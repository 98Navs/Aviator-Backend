// src/models/DepositBonusModel.mjs
import { Schema, model } from 'mongoose';

const FestivalBonusSchema = new Schema({
    offerId: { type: Number, default: () => Math.floor(100000 + Math.random() * 900000), unique: true },
    name: { type: String, required: true },
    bonusType: { type: String, enum: { values: ['New User Bonus', 'Festival Bonus'], message: 'BonusType must be one of: New User Bonus or Festival Bonus' }, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    deal: { type: Number, required: true },
    status: { type: String, enum: { values: ['Active', 'Deactive'], message: 'OfferStatus must be one of: Active or Deactive' }, required: true }
}, { timestamps: true });

FestivalBonusSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
    }
});

export default model('FestivalBonus', FestivalBonusSchema);