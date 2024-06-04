// src/repositories/AvailableGamesRepository.mjs
import AvailableGames from '../models/AvailableGamesModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';
import fs from 'fs';
import path from 'path';

class AvailableGamesRepository {
    static async createAvailableGames(AvailableGamesData) { return await AvailableGames.create(AvailableGamesData); }

    static async getAllAvailableGames(options, req) { return await paginate(AvailableGames, {}, options.page, options.limit, req); }

    static async getAvailableGamesById(id) { return await AvailableGames.findById(id); }

    static async updateAvailableGamesById(id, AvailableGamesData) { return await AvailableGames.findByIdAndUpdate(id, AvailableGamesData); }

    static async deleteAvailableGamesById(id, banner) {
        await Promise.all(banner.images.map(image =>
            fs.promises.unlink(path.join('src/public/uploads', image)).catch(err => {
                if (err.code !== 'ENOENT') throw err;
            })
        ));
        return AvailableGames.findByIdAndDelete(id);
    }
}


export default AvailableGamesRepository;
