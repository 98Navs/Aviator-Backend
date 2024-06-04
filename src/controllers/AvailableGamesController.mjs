// src/controllers/AvailableGamesController.mjs
import AvailableGamesRepository from "../repositories/AvailableGamesRepository.mjs";

class AvailableGamesController {
    static async createAvailableGame(req, res) {
        try {
            const { availableGamesData } = await AvailableGamesController.availableGamesValidation(req);
            const availableGames = await AvailableGamesRepository.createAvailableGames(availableGamesData);
            res.status(201).json({ status: 201, success: true, message: 'Available games created successfully', availableGames });
        } catch (error) {
            AvailableGamesController.catchError(error, res);
        }
    }

    static async getAllAvailableGames(req, res) {
        try {
            const { pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const availableGames = await AvailableGamesRepository.getAllAvailableGames(options, req);
            if (availableGames.data.length === 0) { return res.status(404).json({ status: 404, success: false, message: 'No data found for the provided details.' }); }
            res.status(200).json({ status: 200, success: true, message: 'Available games fetched successfully', ...availableGames });
        } catch (error) {
            AvailableGamesController.catchError(error, res);
        }
    }

    static async getAvailableGamesById(req, res) {
        try {
            const { id } = req.params;
            const availableGames = await AvailableGamesController.validateAndFetchAvailableGameById(id);
            res.status(200).json({ status: 200, success: true, message: 'Available game fetched successfully', availableGames });
        } catch (error) {
            AvailableGamesController.catchError(error, res);
        }
    }

    static async updateAvailableGameById(req, res) {
        try {
            const { id } = req.params;
            await AvailableGamesController.validateAndFetchAvailableGameById(id);
            const { availableGamesData } = await AvailableGamesController.availableGamesValidation(req);
            const updatedAvailableGames = await AvailableGamesRepository.updateAvailableGamesById(id, availableGamesData);
            res.status(200).json({ status: 200, success: true, message: 'Available game updated successfully', updatedAvailableGames });
        } catch (error) {
            AvailableGamesController.catchError(error, res);
        }
    }

    static async deleteAvailableGameById(req, res) {
        try {
            const { id } = req.params;
            const availableGames = await AvailableGamesController.validateAndFetchAvailableGameById(id);
            const deletedAvailableGames = await AvailableGamesRepository.deleteAvailableGamesById(id, availableGames);
            res.status(200).json({ status: 200, success: true, message: 'Available game deleted successfully', deletedAvailableGames });
        } catch (error) {
            AvailableGamesController.catchError(error, res);
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchAvailableGameById(id) {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) { throw new ValidationError('Invalid Id format.'); }
        const availableGames = await AvailableGamesRepository.getAvailableGamesById(id);
        if (!availableGames) { throw new NotFoundError('Available game not found.'); }
        return availableGames;
    }

    static async availableGamesValidation(req) {
        const { name, status } = req.body;
        const images = req.files;

        const requiredFields = { name, status };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === '')
            .map(([field]) => field.charAt(0).toUpperCase() + field.slice(1));
        if (missingFields.length > 0) { throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`); }

        if (images.length === 0 || images.length > 5) { throw new ValidationError('Atleast one image is required and maximum 5 images, key is images.'); }

        const validStatuses = ['Active', 'Deactive'];
        if (!validStatuses.includes(status)) { throw new ValidationError('Status must be one of: Active or Deactive'); }

        const imageFilenames = images.map(image => image.filename);
        const availableGamesData = { name, status, images: imageFilenames };
        availableGamesData.name = name.trim();
        availableGamesData.status = status.trim();
        return { availableGamesData } ;
    }

    static async catchError(error, res) {
        try {
            if (error instanceof ValidationError) { res.status(400).json({ status: 400, success: false, message: error.message }); }
            else if (error instanceof NotFoundError) { res.status(404).json({ status: 404, success: false, message: error.message }); }
            else { res.status(500).json({ status: 500, success: false, message: 'Internal server error.' }); }
        } catch (error) {
            res.status(500).json({ status: 500, success: false, message: 'Something unexpected has happened' });
        }
    }
}

class ValidationError extends Error { constructor(message) { super(message); this.name = 'ValidationError'; } }
class NotFoundError extends Error { constructor(message) { super(message); this.name = 'NotFoundError'; } }

export default AvailableGamesController;
