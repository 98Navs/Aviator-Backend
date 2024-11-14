// src/controllers/UploadCharactersController.mjs
import UploadCharactersRepository from "../repositories/UploadCharactersRepository.mjs";
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs'

class UploadCharactersController {
    static async createUploadCharacters(req, res) {
        try {
            const uploadCharactersData = await UploadCharactersController.uploadCharactersValidation(req.body);

            const uploadCharacters = await UploadCharactersRepository.createUploadCharacters(uploadCharactersData);
            res.status(201).json({ status: 201, success: true, message: 'Upload characters created successfully', data: uploadCharacters });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAllUploadCharacters(req, res) {
        try {
            const { search, pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const filterParams = { search };
            const uploadCharacters = Object.keys(filterParams).length > 0 ?
                await UploadCharactersRepository.filterUploadCharacters(filterParams, options, req) :
                await UploadCharactersRepository.getAllUploadCharacters(options, req);
            res.status(200).json({ status: 200, success: true, message: 'Upload characters fetched successfully', ...uploadCharacters });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getUploadCharactersByCharacterId(req, res) {
        try {
            const { characterId } = req.params;
            const uploadCharacters = await UploadCharactersController.validateAndFetchUploadCharactersByCharacterId(characterId);
            res.status(200).json({ status: 200, success: true, message: 'Upload character fetched successfully', data: uploadCharacters });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAllCharactersName(req, res) {
        try {
            const charactersName = await UploadCharactersRepository.getAllCharactersName(req);
            const data = charactersName.data.map(character => ({ name: character.name }));
            res.status(200).json({ status: 200, success: true, message: 'Upload characters names fetched successfully', data });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updateUploadCharactersByCharacterId(req, res) {
        try {
            const { characterId } = req.params;
            console.log(characterId);

            await UploadCharactersController.validateAndFetchUploadCharactersByCharacterId(characterId);
            const uploadCharactersData = await UploadCharactersController.uploadCharactersValidation(req.body, true);
            const updatedUploadCharacters = await UploadCharactersRepository.updateUploadCharactersByCharacterId(characterId, uploadCharactersData);
            res.status(200).json({ status: 200, success: true, message: 'Upload characters updated successfully', data: updatedUploadCharacters });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async deleteUploadCharactersByCharacterId(req, res) {
        try {
            const { characterId } = req.params;
            const uploadCharacters = await UploadCharactersController.validateAndFetchUploadCharactersByCharacterId(characterId);
            const deletedUploadCharacters = await UploadCharactersRepository.deleteUploadCharactersByCharacterId(characterId, uploadCharacters);
            res.status(200).json({ status: 200, success: true, message: 'Upload characters deleted successfully', data: deletedUploadCharacters });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchUploadCharactersByCharacterId(characterId) {
        await CommonHandler.validateSixDigitIdFormat(characterId);
        const uploadCharacters = await UploadCharactersRepository.getUploadCharactersByCharacterId(characterId);
        if (!uploadCharacters) { throw new NotFoundError('Upload characters not found.'); }
        return uploadCharacters;
    }

    static async uploadCharactersValidation(data, isUpdate = false) {
        const { name, image, status } = data;

        await CommonHandler.validateRequiredFields({ name, image });
        if (typeof name !== 'string') { throw new ValidationError('Name must be a string'); }
        if (!isUpdate && await UploadCharactersRepository.checkDuplicateCharactersName(name)) { throw new ValidationError('A game with the same name already exists.'); }
        if (isUpdate && !CommonHandler.validStatusForGames.includes(status)) { throw new ValidationError(`Status must be one of: ${CommonHandler.validStatusForGames.join(', ')} without any space`); }
        if (!image) { throw new ValidationError('Upload character image is required'); }

        Object.assign(data, {
            name: name.trim(),
            image: image.trim()
        });

        return data;
    }
}

export default UploadCharactersController;