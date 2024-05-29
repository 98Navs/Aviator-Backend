// src/models/BannerModel.mjs
import { Schema, model } from 'mongoose';

const BannerSchema = new Schema({
    name: { type: String, required: true },
    status: { type: String, required: true },
    groupId: { type: String, required: true },
    image: { type: String, required: true }
}, { timestamps: true });

const Banner = model('Banner', BannerSchema);

export default Banner;
