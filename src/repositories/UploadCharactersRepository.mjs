// src/repositories/UploadCharactersRepository.mjs
import UploadCharacters from '../models/UploadCharactersModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';

class UploadCharactersRepository {
    static async createUploadCharacters(uploadCharactersData) { return await UploadCharacters.create(uploadCharactersData); }

    static async getAllUploadCharacters(options, req) { return await paginate(UploadCharacters, {}, options.page, options.limit, req); }

    static async getUploadCharactersByCharacterId(characterId) { return await UploadCharacters.findOne({ characterId }); }

    static async getUploadCharactersByCharacterName(name) { return await UploadCharacters.findOne({ name: new RegExp(`^${name}`, 'i') }); }

    static async getAllCharactersName() { return await UploadCharacters.distinct('name'); }

    static async checkDuplicateCharactersName(name) { return await UploadCharacters.findOne({ name: new RegExp(`^${name}`, 'i') }); }

    static async updateUploadCharactersByCharacterId(characterId, uploadCharactersData) { return await UploadCharacters.findOneAndUpdate({ characterId }, uploadCharactersData, { new: true }); }

    static async deleteUploadCharactersByCharacterId(characterId) { return await UploadCharacters.findOneAndDelete({ characterId }); }

    static async filterUploadCharacters(filterParams, options, req) {
        const query = {};

        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            query.$or = [
                { $expr: { $regexMatch: { input: { $toString: "$characterId" }, regex: searchRegex } } },
                { name: searchRegex }
            ];
        }
        return await paginate(UploadCharacters, query, options.page, options.limit, req);
    }
}

export default UploadCharactersRepository;