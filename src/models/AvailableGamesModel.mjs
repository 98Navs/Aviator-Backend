// src/models/AvailableGamesModel.mjs
import { Schema, model } from 'mongoose';

const AvailableGamesSchema = new Schema({
    name: { type: String, required: true },
    status: { type: String, required: true },
    images: [{ type: String, required: true }]
}, { timestamps: true });

const AvailableGames = model('AvailableGames', AvailableGamesSchema);

export default AvailableGames;
