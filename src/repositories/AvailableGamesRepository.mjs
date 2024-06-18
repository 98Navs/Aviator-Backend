// src/repositories/AvailableGamesRepository.mjs
import AvailableGames from '../models/AvailableGamesModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';
import fs from 'fs';
import path from 'path';

class AvailableGamesRepository {
    static async createAvailableGames(availableGamesData) { return await AvailableGames.create(availableGamesData); }

    static async getAllAvailableGames(options, req) { return await paginate(AvailableGames, {}, options.page, options.limit, req); }

    static async getAvailableGamesByGameId(gameId) { return await AvailableGames.findOne({ gameId }); }

    static async getAvailableGamesByGameName(name) { return await AvailableGames.findOne({ name: new RegExp(`^${name}`, 'i') }); }

    static async getAllGameNames() { return await AvailableGames.distinct('name'); }

    static async checkDuplicateGameName(name) { return await AvailableGames.findOne({ name: new RegExp(`^${name}`, 'i') }); }

    static async updateAvailableGamesByGameId(gameId, availableGamesData) {
        const existingGame = await AvailableGames.findOne({ gameId });
        await Promise.all(existingGame.images.map(image =>
            fs.promises.unlink(path.join('src/public/gameImages', path.basename(image))).catch(err => {
                if (err.code !== 'ENOENT') throw err;
            })
        ));
        return await AvailableGames.findOneAndUpdate({ gameId }, availableGamesData, { new: true });
    }

    static async deleteAvailableGamesByGameId(gameId, availableGames) {
        await Promise.all(availableGames.images.map(image =>
            fs.promises.unlink(path.join('src/public/gameImages', path.basename(image))).catch(err => {
                if (err.code !== 'ENOENT') throw err;
            })
        ));
        return await AvailableGames.findOneAndDelete({ gameId });
    }

    static async filterAvailableGames(filterParams, options, req) {
        const query = {};

        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            query.$or = [
                { $expr: { $regexMatch: { input: { $toString: "$gameId" }, regex: searchRegex } } },
                { name: searchRegex }
            ];
        }
        return await paginate(AvailableGames, query, options.page, options.limit, req);
    }
}

export default AvailableGamesRepository;