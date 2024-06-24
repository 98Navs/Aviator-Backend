// src/models/AvailableGamesModel.mjs
import { Schema, model } from 'mongoose';

const AvailableGamesSchema = new Schema({
    gameId: { type: Number, default: () => Math.floor(100000 + Math.random() * 900000), unique: true },
    name: { type: String, required: true },
    status: { type: String, required: true },
    images: [{ type: String, required: true }]
}, { timestamps: true });

export default model('AvailableGames', AvailableGamesSchema);