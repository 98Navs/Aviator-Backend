// src/models/UploadCharactersModel.mjs
import { Schema, model } from 'mongoose';

const UploadCharactersSchema = new Schema({
    characterId: { type: Number, default: () => Math.floor(100000 + Math.random() * 900000), unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    status: { type: String, default: 'Active' }
}, { timestamps: true });

export default model('UploadCharacters', UploadCharactersSchema);