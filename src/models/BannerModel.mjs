// src/models/BannerModel.mjs
import { Schema, model } from 'mongoose';

const BannerSchema = new Schema({
    name: { type: String, required: true },
    groupId: { type: String, required: true },
    status: { type: String, required: true },
    images: [{ type: String, required: true }]
}, { timestamps: true });

export default model('Banner', BannerSchema);