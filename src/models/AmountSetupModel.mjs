// src/models/AmountSetupModel.mjs
import { Schema, model } from 'mongoose';

const AmountSetupSchema = new Schema({
    amountId: { type: Number, default: () => Math.floor(100000 + Math.random() * 900000), unique: true },
    settingName: { type: String, required: true },
    value: { type: String, required: true },
}, { timestamps: true });

AmountSetupSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
    }
});

const AmountSetup = model('AmountSetup', AmountSetupSchema);

export default AmountSetup;
