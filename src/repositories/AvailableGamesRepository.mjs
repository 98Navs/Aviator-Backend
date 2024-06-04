// src/repositories/AvailableGamesRepository.mjs
import AvailableGames from '../models/AvailableGamesModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';
import fs from 'fs';
import path from 'path';

class AvailableGamesRepository {
    static async createAvailableGames(availableGamesData) { return await AvailableGames.create(availableGamesData); }

    static async getAllAvailableGames(options, req) { return await paginate(AvailableGames, {}, options.page, options.limit, req); }

    static async getAvailableGamesById(id) { return await AvailableGames.findById(id); }

    static async updateAvailableGamesById(id, availableGamesData) {
        const existingGame = await AvailableGames.findById(id);
        await Promise.all(existingGame.images.map(image =>
            fs.promises.unlink(path.join('src/public/uploads', image)).catch(err => {
                if (err.code !== 'ENOENT') throw err;
            })
        ));
        return await AvailableGames.findByIdAndUpdate(id, availableGamesData, { new: true });
    }
    
    static async deleteAvailableGamesById(id, availableGames) {
        await Promise.all(availableGames.images.map(image =>
            fs.promises.unlink(path.join('src/public/uploads', image)).catch(err => {
                if (err.code !== 'ENOENT') throw err;
            })
        ));
        return await AvailableGames.findByIdAndDelete(id);
    }
}

export default AvailableGamesRepository;